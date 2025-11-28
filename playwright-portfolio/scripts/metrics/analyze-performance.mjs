import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const historyFile = path.join(__dirname, '..', '..', 'reports', 'history.json');
const outputFile = path.join(__dirname, '..', '..', 'reports', 'performance-trends.json');

if (!fs.existsSync(historyFile)) {
  console.error('❌ No se encontró reports/history.json. Ejecuta tests primero.');
  process.exit(1);
}

const history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));

// Calcular tendencias de performance
const trends = {
  avgDuration: 0,
  avgPassRate: 0,
  avgFlakyRate: 0,
  trend: {
    duration: 'stable',
    passRate: 'stable',
    flakyRate: 'stable',
  },
  slowestTests: [],
  improvements: [],
  regressions: [],
};

if (history.length === 0) {
  console.log('⚠️  No hay suficiente historial para calcular tendencias.');
  process.exit(0);
}

// Calcular promedios
trends.avgDuration = history.reduce((sum, e) => {
  const durationMs = parseFloat(e.duration) * 1000;
  return sum + durationMs;
}, 0) / history.length;

trends.avgPassRate = history.reduce((sum, e) => {
  return sum + parseFloat(e.passRate);
}, 0) / history.length;

trends.avgFlakyRate = history.reduce((sum, e) => {
  return sum + parseFloat(e.flakyRate);
}, 0) / history.length;

// Calcular tendencias (últimos 5 vs previos 5)
if (history.length >= 10) {
  const recent = history.slice(-5);
  const previous = history.slice(-10, -5);
  
  const recentAvgDuration = recent.reduce((sum, e) => sum + parseFloat(e.duration) * 1000, 0) / 5;
  const previousAvgDuration = previous.reduce((sum, e) => sum + parseFloat(e.duration) * 1000, 0) / 5;
  const durationDiff = ((recentAvgDuration - previousAvgDuration) / previousAvgDuration) * 100;
  
  if (durationDiff < -5) trends.trend.duration = 'improving';
  else if (durationDiff > 5) trends.trend.duration = 'regressing';
  
  const recentAvgPassRate = recent.reduce((sum, e) => sum + parseFloat(e.passRate), 0) / 5;
  const previousAvgPassRate = previous.reduce((sum, e) => sum + parseFloat(e.passRate), 0) / 5;
  const passRateDiff = recentAvgPassRate - previousAvgPassRate;
  
  if (passRateDiff > 2) trends.trend.passRate = 'improving';
  else if (passRateDiff < -2) trends.trend.passRate = 'regressing';
  
  const recentAvgFlakyRate = recent.reduce((sum, e) => sum + parseFloat(e.flakyRate), 0) / 5;
  const previousAvgFlakyRate = previous.reduce((sum, e) => sum + parseFloat(e.flakyRate), 0) / 5;
  const flakyRateDiff = recentAvgFlakyRate - previousAvgFlakyRate;
  
  if (flakyRateDiff < -1) trends.trend.flakyRate = 'improving';
  else if (flakyRateDiff > 1) trends.trend.flakyRate = 'regressing';
}

// Guardar tendencias
fs.writeFileSync(outputFile, JSON.stringify(trends, null, 2));

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📈 Performance Trends Analysis');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Data points: ${history.length}`);
console.log(`\nAverages (all time):`);
console.log(`  ⏱️  Duration: ${(trends.avgDuration / 1000).toFixed(1)}s`);
console.log(`  ✅ Pass Rate: ${trends.avgPassRate.toFixed(1)}%`);
console.log(`  ⚠️  Flaky Rate: ${trends.avgFlakyRate.toFixed(1)}%`);

if (history.length >= 10) {
  console.log(`\nTrends (recent vs previous):`);
  console.log(`  ⏱️  Duration: ${getTrendEmoji(trends.trend.duration)} ${trends.trend.duration}`);
  console.log(`  ✅ Pass Rate: ${getTrendEmoji(trends.trend.passRate)} ${trends.trend.passRate}`);
  console.log(`  ⚠️  Flaky Rate: ${getTrendEmoji(trends.trend.flakyRate)} ${trends.trend.flakyRate}`);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`✅ Trends saved to: ${outputFile}\n`);

function getTrendEmoji(trend) {
  if (trend === 'improving') return '📈';
  if (trend === 'regressing') return '📉';
  return '➡️';
}
