import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { access, rm } from 'node:fs/promises';

process.env.DATABASE_URL ??= 'file:./ci-test.db';

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
