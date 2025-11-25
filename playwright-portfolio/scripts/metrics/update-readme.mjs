import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const summaryPath = path.join(__dirname, '..', '..', 'reports', 'summary.json');

if (!fs.existsSync(summaryPath)) {
  console.log('⏭️  No summary.json found, skipping README update.');
  process.exit(0);
}

const s = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));

const readmePath = path.join(__dirname, '..', '..', '..', 'README.md');
let md = fs.readFileSync(readmePath, 'utf-8');

const markerStart = '<!-- METRICS:START -->';
const markerEnd = '<!-- METRICS:END -->';
const block = `${markerStart}
**Total:** ${s.total} &nbsp;|&nbsp; **Passed:** ${s.passed} (${s.passRate}) &nbsp;|&nbsp; **Failed:** ${s.failed} &nbsp;|&nbsp; **Skipped:** ${s.skipped}  
**Flaky:** ${s.flaky} (${s.flakyRate}) &nbsp;|&nbsp; **Duration:** ${s.duration}
${markerEnd}`;

if (md.includes(markerStart) && md.includes(markerEnd)) {
  // Reemplazar bloque existente
  md = md.replace(new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`), block);
  console.log('✅ README metrics block updated.');
} else {
  // Agregar nuevo bloque al final
  md += `\n\n## 📈 Métricas\n${block}\n`;
  console.log('✅ README metrics block added.');
}

fs.writeFileSync(readmePath, md);
console.log(`📝 README actualizado: ${readmePath}\n`);
