import { defineConfig, Plugin } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import fs from 'fs';
import { transformSync, buildSync } from 'esbuild';

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

      // 1. Parse base manifest
      const manifestSrc = resolve(srcDir, 'manifest.json');
      let baseManifest: any = {};
      if (fs.existsSync(manifestSrc)) {
        baseManifest = JSON.parse(fs.readFileSync(manifestSrc, 'utf-8'));
        if (baseManifest.action) {
          baseManifest.action.default_popup = 'src/popup/index.html';
        }
      }

      // 2. Create browser-specific target folders (chrome, edge, firefox)
      const staticFiles = ['content.css', 'background.js'];
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
        // Minify and copy static background script and CSS
        for (const file of staticFiles) {
          const srcFile = resolve(srcDir, file);
          if (fs.existsSync(srcFile)) {
            const rawContent = fs.readFileSync(srcFile, 'utf-8');
            try {
              if (file.endsWith('.js')) {
                const minified = transformSync(rawContent, { minify: true, target: 'chrome90' });
                fs.writeFileSync(resolve(targetDir, file), minified.code, 'utf-8');
              } else if (file.endsWith('.css')) {
                const minified = transformSync(rawContent, { loader: 'css', minify: true });
                fs.writeFileSync(resolve(targetDir, file), minified.code, 'utf-8');
              } else {
                fs.copyFileSync(srcFile, resolve(targetDir, file));
              }
            } catch {
              fs.copyFileSync(srcFile, resolve(targetDir, file));
            }
          }
        }

        // Bundle TypeScript content script into target content.js
        const contentEntry = resolve(srcDir, 'content/index.ts');
        if (fs.existsSync(contentEntry)) {
          buildSync({
            entryPoints: [contentEntry],
            bundle: true,
            minify: true,
            target: 'chrome90',
            outfile: resolve(targetDir, 'content.js'),
            format: 'iife',
          });
        } else {
          const legacyContent = resolve(srcDir, 'content.js');
          if (fs.existsSync(legacyContent)) {
            const rawContent = fs.readFileSync(legacyContent, 'utf-8');
            const minified = transformSync(rawContent, { minify: true, target: 'chrome90' });
            fs.writeFileSync(resolve(targetDir, 'content.js'), minified.code, 'utf-8');
          }
        }

        // Bundle TypeScript engine bridge into target engine-bridge.js
        const bridgeEntry = resolve(srcDir, 'content/engine-bridge.ts');
        if (fs.existsSync(bridgeEntry)) {
          buildSync({
            entryPoints: [bridgeEntry],
            bundle: true,
            minify: true,
            target: 'chrome90',
            outfile: resolve(targetDir, 'engine-bridge.js'),
            format: 'iife',
          });
        }

        // Adjust manifest for target
        const targetManifest = JSON.parse(JSON.stringify(baseManifest));
        if (target === 'firefox') {
          if (targetManifest.background && targetManifest.background.service_worker) {
            targetManifest.background.scripts = [targetManifest.background.service_worker];
            delete targetManifest.background.service_worker;
          }
          // Filter out world: MAIN for older Firefox engine compatibility
          if (Array.isArray(targetManifest.content_scripts)) {
            targetManifest.content_scripts = targetManifest.content_scripts.filter(
              (cs: any) => cs.world !== 'MAIN'
            );
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

      // 3. Mirror dist/chrome into the root of dist/ so whether the user loaded dist/ or dist/chrome/, it works
      const chromeDir = resolve(distDir, 'chrome');
      if (fs.existsSync(chromeDir)) {
        const entries = fs.readdirSync(chromeDir, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = resolve(chromeDir, entry.name);
          const destPath = resolve(distDir, entry.name);
          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
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
