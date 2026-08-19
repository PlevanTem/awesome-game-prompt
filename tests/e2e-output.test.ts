import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = process.cwd();
const distDirectory = join(root, 'dist');

async function digestDirectory(directory: string): Promise<string | null> {
  try {
    await stat(directory);
  } catch {
    return null;
  }

  const digest = createHash('sha256');

  async function addDirectory(path: string, relativePath = ''): Promise<void> {
    const entries = await readdir(path, { withFileTypes: true });

    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const entryPath = join(path, entry.name);
      const entryRelativePath = join(relativePath, entry.name);

      if (entry.isDirectory()) {
        digest.update(`directory:${entryRelativePath}\n`);
        await addDirectory(entryPath, entryRelativePath);
      } else {
        digest.update(`file:${entryRelativePath}\n`);
        digest.update(await readFile(entryPath));
      }
    }
  }

  await addDirectory(directory);
  return digest.digest('hex');
}

async function waitForFixtureServer(server: ReturnType<typeof spawn>): Promise<void> {
  const deadline = Date.now() + 20_000;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Fixture server exited with code ${server.exitCode}`);
    }

    try {
      const response = await fetch('http://127.0.0.1:4321/');

      if (response.ok) {
        return;
      }
    } catch {
      // The server is still building the fixture site.
    }

    await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
  }

  throw new Error('Fixture server did not start within 20 seconds');
}

async function stopFixtureServer(server: ReturnType<typeof spawn>): Promise<void> {
  if (server.exitCode !== null) {
    return;
  }

  await new Promise<void>((resolvePromise) => {
    server.once('exit', () => resolvePromise());
    server.kill();
  });
}

describe('E2E fixture output', () => {
  it('leaves the normal production dist unchanged', async () => {
    const initialDigest = await digestDirectory(distDirectory);
    const server = spawn(process.execPath, [join(root, 'tests', 'e2e-server.mjs')], {
      cwd: root,
      stdio: 'ignore',
    });

    try {
      await waitForFixtureServer(server);
      expect(await digestDirectory(distDirectory)).toBe(initialDigest);
    } finally {
      await stopFixtureServer(server);
    }
  }, 30_000);
});
