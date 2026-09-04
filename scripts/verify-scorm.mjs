import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'scorm-build');
const required = ['imsmanifest.xml', 'index.html', 'assets/fire-emergency-protocol.mp4'];
const failures = required.filter(path => !existsSync(join(root, path))).map(path => `Missing ${path}`);
const manifest = existsSync(join(root, 'imsmanifest.xml')) ? readFileSync(join(root, 'imsmanifest.xml'), 'utf8') : '';

for (const expected of ['<schemaversion>1.2</schemaversion>', 'adlcp:scormtype="sco"', 'href="index.html"']) {
  if (!manifest.includes(expected)) failures.push(`Manifest does not contain ${expected}`);
}

function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  });
}

for (const file of existsSync(root) ? filesIn(root).filter(path => /\.(?:html|css|js)$/.test(path)) : []) {
  if (/(?<!\.)\/assets\//.test(readFileSync(file, 'utf8'))) failures.push(`Absolute asset path remains in ${file}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

const size = filesIn(root).reduce((sum, path) => sum + statSync(path).size, 0);
console.log(`SCORM validation passed: ${filesIn(root).length} files, ${(size / 1024 / 1024).toFixed(1)} MB uncompressed.`);
