import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reportsDir = path.join(__dirname, '..', '..', 'reports');
const historyFile = path.join(reportsDir, 'history.json');
const summaryFile = path.join(reportsDir, 'summary.json');

// Leer el resumen actual
if (!fs.existsSync(summaryFile)) {
  console.error('❌ No se encontró reports/summary.json. Ejecuta compute-metrics.mjs primero.');
  process.exit(1);
}

const currentSummary = JSON.parse(fs.readFileSync(summaryFile, 'utf-8'));

// Añadir timestamp
const entry = {
  timestamp: new Date().toISOString(),
  date: new Date().toLocaleDateString('es-PE'),
  time: new Date().toLocaleTimeString('es-PE'),
  ...currentSummary
};

// Leer historial existente o crear nuevo
let history = [];
if (fs.existsSync(historyFile)) {
  history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
}

// Añadir entrada actual
history.push(entry);

// Mantener solo últimos 30 registros (1 mes si es daily)
if (history.length > 30) {
  history = history.slice(-30);
}

// Guardar historial actualizado
fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📈 Trending Metrics Updated');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Entries in history: ${history.length}`);
console.log(`Latest entry: ${entry.date} ${entry.time}`);
console.log(`Pass rate trend: ${getTrend(history, 'passRate')}`);
console.log(`Flaky rate trend: ${getTrend(history, 'flakyRate')}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log(`✅ History saved to: ${historyFile}\n`);

// Calcular tendencia simple (últimos 5 vs previos)
function getTrend(history, metric) {
  if (history.length < 10) return '➡️ Insufficient data';
  
  const recent = history.slice(-5);
  const previous = history.slice(-10, -5);
  
  const recentAvg = recent.reduce((sum, e) => sum + parseFloat(e[metric]), 0) / recent.length;
  const previousAvg = previous.reduce((sum, e) => sum + parseFloat(e[metric]), 0) / previous.length;
  
  const diff = recentAvg - previousAvg;
  
  if (Math.abs(diff) < 0.5) return '➡️ Stable';
  if (diff > 0) return `📈 Improving (+${diff.toFixed(1)}%)`;
  return `📉 Declining (${diff.toFixed(1)}%)`;
}
