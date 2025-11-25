import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, '..', '..', 'reports', 'results.json');

if (!fs.existsSync(file)) {
  console.error('❌ No se encontró reports/results.json. Asegúrate de tener el reporter JSON activo.');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(file, 'utf-8'));

// Playwright JSON reporter estructura
let total = 0, passed = 0, failed = 0, skipped = 0, flaky = 0, durationMs = 0;

function walk(node) {
  if (!node) return;
  
  // Acumular duración si existe
  if (node.stats?.duration) durationMs += node.stats.duration;
  
  // Recursivamente procesar suites y specs
  if (node.specs) node.specs.forEach(s => walk(s));
  if (node.suites) node.suites.forEach(s => walk(s));
  
  // Procesar tests
  if (node.tests) {
    for (const t of node.tests) {
      total++;
      
      // Heurística para detectar flaky: múltiples results o retries
      const results = t.results || [];
      const statuses = results.map(r => r.status);
      const retried = results.some(r => (r.retry || 0) > 0);
      const isFlaky = statuses.includes('flaky') || (retried && statuses.includes('passed'));

      // Estado final: último result
      const last = results[results.length - 1];
      const status = last?.status || t.status || 'unknown';

      if (status === 'passed') passed++;
      else if (status === 'skipped') skipped++;
      else if (status === 'failed') failed++;

      if (isFlaky) flaky++;
    }
  }
}

// Procesar todos los suites
(data.suites || []).forEach(s => walk(s));

const flakyRate = total ? (flaky / total) * 100 : 0;
const passRate = total ? (passed / total) * 100 : 0;
const summary = {
  total,
  passed,
  failed,
  skipped,
  flaky,
  flakyRate: `${flakyRate.toFixed(1)}%`,
  passRate: `${passRate.toFixed(1)}%`,
  duration: `${(durationMs / 1000).toFixed(1)}s`
};

// Output para console
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Test Metrics Summary');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Total Tests:    ${summary.total}`);
console.log(`✅ Passed:      ${summary.passed} (${summary.passRate})`);
console.log(`❌ Failed:      ${summary.failed}`);
console.log(`⏭️  Skipped:     ${summary.skipped}`);
console.log(`⚠️  Flaky:       ${summary.flaky} (${summary.flakyRate})`);
console.log(`⏱️  Duration:    ${summary.duration}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Guardar summary en JSON para otros usos (README/summary de CI)
const outDir = path.join(__dirname, '..', '..', 'reports');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const out = path.join(outDir, 'summary.json');
fs.writeFileSync(out, JSON.stringify(summary, null, 2));

console.log(`✅ Summary saved to: ${out}\n`);
