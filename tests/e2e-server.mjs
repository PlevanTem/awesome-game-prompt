import { spawn } from 'node:child_process';
import { readFile, rm, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const e2eDistDirectory = join(root, '.e2e-dist');
const port = 4321;
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: 'inherit', shell: false });

    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });
}

async function buildFixtureSite() {
  await rm(e2eDistDirectory, { force: true, recursive: true });
  process.env.PROMPT_FORGE_E2E_FIXTURES = '1';

  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const args = process.platform === 'win32'
    ? ['/d', '/s', '/c', 'npm.cmd', 'exec', 'astro', 'build', '--', '--outDir', '.e2e-dist']
    : ['exec', 'astro', 'build', '--', '--outDir', '.e2e-dist'];
  await run(command, args);
}

function resolveRequestPath(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, `http://127.0.0.1:${port}`).pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const requested = resolve(e2eDistDirectory, relativePath);

  if (requested !== e2eDistDirectory && !requested.startsWith(`${e2eDistDirectory}${sep}`)) {
    return null;
  }

  return requested;
}

await buildFixtureSite();

const server = createServer(async (request, response) => {
  try {
    let filePath = resolveRequestPath(request.url ?? '/');

    if (!filePath) {
      response.writeHead(403).end();
      return;
    }

    if ((await stat(filePath)).isDirectory()) {
      filePath = join(filePath, 'index.html');
    }

    const content = await readFile(filePath);
    response.writeHead(200, {
      'content-type': mimeTypes[extname(filePath)] ?? 'application/octet-stream',
    });
    response.end(content);
  } catch {
    response.writeHead(404).end();
  }
});

server.listen(port, '127.0.0.1');
