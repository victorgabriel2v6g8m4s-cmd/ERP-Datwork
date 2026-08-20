import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { access, rm } from 'node:fs/promises';

process.env.DATABASE_URL ??= 'file:./ci-test.db';
process.env.NODE_ENV = 'production';
process.env.HOST = '127.0.0.1';
process.env.ALLOWED_ORIGINS = 'https://erp.example.test';
process.env.ALLOW_INSECURE_AUTH_BYPASS = 'false';

const databasePath = new URL('../ci-test.db', import.meta.url);

after(async () => {
    try {
        const { default: prismaClient } = await import('../dist/config/prisma.js');
        await prismaClient.$disconnect();
    } finally {
        await rm(databasePath, { force: true });
    }
});

test('backend build produces the server entrypoint', async () => {
    await assert.doesNotReject(() => access(new URL('../dist/server.js', import.meta.url)));
});

test('compiled route graph can be loaded without starting the HTTP server', { timeout: 5000 }, async () => {
    const { router } = await import('../dist/routes.js');

    assert.equal(typeof router, 'function');
    assert.ok(Array.isArray(router.stack));
    assert.ok(router.stack.length > 0, 'Expected the global router to contain registered routes');
});

test('production app exposes health metadata and fails closed on protected routes', async () => {
    const { createApp } = await import('../dist/app.js');
    const server = createApp().listen(0, '127.0.0.1');

    try {
        await new Promise((resolve, reject) => {
            server.once('listening', resolve);
            server.once('error', reject);
        });
        const address = server.address();
        assert.ok(address && typeof address === 'object');
        const baseUrl = `http://127.0.0.1:${address.port}`;

        const healthResponse = await fetch(`${baseUrl}/health`);
        assert.equal(healthResponse.status, 200);
        assert.equal(healthResponse.headers.get('x-content-type-options'), 'nosniff');
        assert.equal(healthResponse.headers.get('x-powered-by'), null);
        assert.deepEqual(await healthResponse.json(), { status: 'ok', environment: 'production' });

        const protectedResponse = await fetch(`${baseUrl}/products`);
        assert.equal(protectedResponse.status, 503);
        assert.equal((await protectedResponse.json()).error, 'AuthenticationNotConfigured');

        const rejectedOrigin = await fetch(`${baseUrl}/health`, {
            headers: { Origin: 'https://attacker.example.test' }
        });
        assert.equal(rejectedOrigin.status, 403);
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }
});
