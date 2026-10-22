import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import os from 'os';
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
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }
    const tempZip = path.join(os.tmpdir(), `${Date.now()}-${zipName}`);
    if (fs.existsSync(tempZip)) {
      fs.unlinkSync(tempZip);
    }
    console.log(`Creating ${zipName}...`);
    execSync(`tar -a -c -f "${tempZip}" -C "${targetDir}" *`, { stdio: 'inherit', shell: true });
    fs.copyFileSync(tempZip, zipPath);
    fs.unlinkSync(tempZip);
  }
}
console.log(`All packages zipped for version v${version}.`);
