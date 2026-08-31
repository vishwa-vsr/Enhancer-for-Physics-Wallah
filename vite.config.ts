import { defineConfig, Plugin } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import fs from 'fs';

function copyExtensionAssetsPlugin(): Plugin {
  return {
    name: 'copy-extension-assets',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const srcDir = resolve(__dirname, 'src');

      // Helper to recursively copy directories
      const copyDir = (src: string, dest: string) => {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = resolve(src, entry.name);
          const destPath = resolve(dest, entry.name);
          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };

      // 1. Copy icons to root dist
      if (fs.existsSync(resolve(srcDir, 'icons'))) {
        copyDir(resolve(srcDir, 'icons'), resolve(distDir, 'icons'));
      }

      // 2. Copy content and background scripts to root dist
      const staticFiles = ['content.js', 'content.css', 'background.js'];
      for (const file of staticFiles) {
        const srcFile = resolve(srcDir, file);
        if (fs.existsSync(srcFile)) {
          fs.copyFileSync(srcFile, resolve(distDir, file));
        }
      }

      // 3. Create manifest for Chrome
      const manifestSrc = resolve(srcDir, 'manifest.json');
      let baseManifest: any = {};
      if (fs.existsSync(manifestSrc)) {
        baseManifest = JSON.parse(fs.readFileSync(manifestSrc, 'utf-8'));
        if (baseManifest.action) {
          baseManifest.action.default_popup = 'src/popup/index.html';
        }
        fs.writeFileSync(resolve(distDir, 'manifest.json'), JSON.stringify(baseManifest, null, 2));
      }

      // 4. Create browser-specific target folders (chrome, edge, firefox) so both dist/ and dist/chrome work!
      const targets = ['chrome', 'edge', 'firefox'];
      for (const target of targets) {
        const targetDir = resolve(distDir, target);
        if (fs.existsSync(targetDir)) {
          fs.rmSync(targetDir, { recursive: true, force: true });
        }
        fs.mkdirSync(targetDir, { recursive: true });

        // Copy assets (popup bundle)
        if (fs.existsSync(resolve(distDir, 'assets'))) {
          copyDir(resolve(distDir, 'assets'), resolve(targetDir, 'assets'));
        }
        // Copy popup HTML
        if (fs.existsSync(resolve(distDir, 'src/popup'))) {
          copyDir(resolve(distDir, 'src/popup'), resolve(targetDir, 'src/popup'));
        }
        // Copy icons
        if (fs.existsSync(resolve(srcDir, 'icons'))) {
          copyDir(resolve(srcDir, 'icons'), resolve(targetDir, 'icons'));
        }
        // Copy scripts
        for (const file of staticFiles) {
          const srcFile = resolve(srcDir, file);
          if (fs.existsSync(srcFile)) {
            fs.copyFileSync(srcFile, resolve(targetDir, file));
          }
        }

        // Adjust manifest for target
        const targetManifest = JSON.parse(JSON.stringify(baseManifest));
        if (target === 'firefox') {
          if (targetManifest.background && targetManifest.background.service_worker) {
            targetManifest.background.scripts = [targetManifest.background.service_worker];
            delete targetManifest.background.service_worker;
          }
          targetManifest.browser_specific_settings = {
            gecko: {
              id: 'pw-control@visha.dev',
              data_collection_permissions: { required: ['none'] },
            },
          };
        }
        fs.writeFileSync(resolve(targetDir, 'manifest.json'), JSON.stringify(targetManifest, null, 2));
      }
    },
  };
}

export default defineConfig({
  plugins: [preact(), copyExtensionAssetsPlugin()],
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
      '@popup': resolve(__dirname, 'src/popup'),
    },
  },
  base: './',
  build: {
    outDir: 'dist',
    emptyDirOnBuild: true,
    target: 'chrome90',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});
