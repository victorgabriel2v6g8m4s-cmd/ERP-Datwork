import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const { detectUploadMimeType, getSafeUploadExtension } = await import('../dist/utils/uploadSecurity.js');

test('upload security detects content signatures independently from filenames', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'erp-upload-security-'));

  try {
    const disguisedImage = path.join(directory, 'invoice.pdf');
    await writeFile(disguisedImage, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    assert.equal(await detectUploadMimeType(disguisedImage), 'image/png');

    const unsupportedFile = path.join(directory, 'payload.jpg');
    await writeFile(unsupportedFile, Buffer.from('not an image'));
    assert.equal(await detectUploadMimeType(unsupportedFile), null);
    assert.equal(getSafeUploadExtension('application/pdf'), '.pdf');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
