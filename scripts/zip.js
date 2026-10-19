import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
const version = pkg.version;

const targets = ['chrome', 'firefox', 'edge'];
for (const target of targets) {
  const zipName = `pw-${target}-v${version}.zip`;
  const distDir = path.join(rootDir, 'dist');
  const targetDir = path.join(distDir, target);
  const zipPath = path.join(distDir, zipName);

  if (fs.existsSync(targetDir)) {
    console.log(`Creating ${zipName}...`);
    execSync(`tar -a -c -f "${zipPath}" -C "${targetDir}" *`, { stdio: 'inherit', shell: true });
  }
}
console.log(`All packages zipped for version v${version}.`);
