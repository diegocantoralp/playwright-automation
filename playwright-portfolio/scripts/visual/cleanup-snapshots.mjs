import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', '..', 'tests', 'visual');

// Función recursiva para obtener todos los archivos
function allFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  
  return fs.readdirSync(dir).flatMap(f => {
    const p = path.join(dir, f);
    return fs.statSync(p).isDirectory() ? allFiles(p) : [p];
  });
}

// Buscar carpetas de snapshots (Playwright usa diferentes convenciones)
const possibleSnapshotDirs = [
  path.join(root, '__screenshots__'),
  path.join(root, 'components', '__screenshots__'),
  path.join(root, 'snapshots'),
];

let totalSnaps = 0;
let removed = 0;

for (const snapDir of possibleSnapshotDirs) {
  if (!fs.existsSync(snapDir)) continue;

  const snaps = allFiles(snapDir).filter(p => p.endsWith('.png'));
  totalSnaps += snaps.length;

  console.log(`\n🔍 Scanning: ${path.relative(root, snapDir)}`);
  console.log(`   Found ${snaps.length} snapshots`);

  // Obtener todos los specs existentes
  const specs = allFiles(root).filter(p => p.endsWith('.spec.ts'));
  
  for (const snap of snaps) {
    const baseName = path.basename(snap, '.png');
    
    // Heurística: buscar si algún spec menciona este nombre de snapshot
    // Playwright usa el nombre del test + snapshot name, ejemplo: "card.png"
    const existsSpec = specs.some(specPath => {
      const content = fs.readFileSync(specPath, 'utf-8');
      // Buscar el nombre del snapshot en el spec
      return content.includes(baseName) || content.includes(snap);
    });

    if (!existsSpec) {
      console.log(`   ❌ Removing orphan: ${path.basename(snap)}`);
      fs.unlinkSync(snap);
      removed++;
    } else {
      console.log(`   ✅ Keeping: ${path.basename(snap)}`);
    }
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Snapshot Cleanup Summary');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Total snapshots scanned: ${totalSnaps}`);
console.log(`Orphan snapshots removed: ${removed}`);
console.log(`Remaining snapshots: ${totalSnaps - removed}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (removed === 0) {
  console.log('✨ No orphan snapshots found. Everything is clean!\n');
} else {
  console.log(`🧹 Cleaned up ${removed} orphan snapshot(s).\n`);
}
