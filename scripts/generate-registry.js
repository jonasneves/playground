import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appsDir = path.join(__dirname, '../apps');
const outputPath = path.join(__dirname, '../public/apps-registry.json');

function generateRegistry() {
  try {
    // Ensure public directory exists
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Read all directories in apps/
    const entries = fs.readdirSync(appsDir, { withFileTypes: true });
    const appDirs = entries.filter(entry => entry.isDirectory());

    const apps = [];

    for (const dir of appDirs) {
      const manifestPath = path.join(appsDir, dir.name, 'manifest.json');

      if (fs.existsSync(manifestPath)) {
        try {
          const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
          const manifest = JSON.parse(manifestContent);

          apps.push({
            path: `apps/${dir.name}`,
            name: dir.name,
            manifest: manifest
          });
        } catch (err) {
          console.warn(`Failed to parse manifest for ${dir.name}:`, err.message);
        }
      }
    }

    const registry = {
      version: '1.0.0',
      generated: new Date().toISOString(),
      apps: apps
    };

    fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2));
    console.log(`✓ Generated registry with ${apps.length} apps`);
    console.log(`  Output: ${outputPath}`);
  } catch (err) {
    console.error('Failed to generate registry:', err);
    process.exit(1);
  }
}

generateRegistry();
