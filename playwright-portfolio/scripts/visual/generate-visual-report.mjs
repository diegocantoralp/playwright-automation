import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testResultsDir = path.join(__dirname, '..', '..', 'test-results');
const reportsDir = path.join(__dirname, '..', '..', 'reports');
const outputFile = path.join(reportsDir, 'visual-diff-report.html');

// Buscar archivos -diff.png en test-results
function findDiffs(dir) {
  const diffs = [];
  
  if (!fs.existsSync(dir)) return diffs;
  
  function scan(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.name.endsWith('-diff.png')) {
        // Buscar archivos relacionados
        const baseName = entry.name.replace('-diff.png', '');
        const actualPath = path.join(currentDir, `${baseName}-actual.png`);
        const expectedPath = path.join(currentDir, `${baseName}-expected.png`);
        
        diffs.push({
          name: baseName,
          test: path.basename(path.dirname(fullPath)),
          diff: fullPath,
          actual: fs.existsSync(actualPath) ? actualPath : null,
          expected: fs.existsSync(expectedPath) ? expectedPath : null,
          relativeDiff: path.relative(testResultsDir, fullPath),
          relativeActual: fs.existsSync(actualPath) ? path.relative(testResultsDir, actualPath) : null,
          relativeExpected: fs.existsSync(expectedPath) ? path.relative(testResultsDir, expectedPath) : null,
        });
      }
    }
  }
  
  scan(dir);
  return diffs;
}

const diffs = findDiffs(testResultsDir);

if (diffs.length === 0) {
  console.log('✅ No visual differences found. All snapshots match!');
  
  // Crear reporte vacío
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Diff Report - No Differences</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 1200px;
      margin: 40px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .success {
      background: #d4edda;
      border: 2px solid #28a745;
      padding: 30px;
      border-radius: 8px;
      text-align: center;
    }
    .success h1 {
      color: #155724;
      margin: 0 0 10px;
    }
    .success p {
      color: #155724;
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div class="success">
    <h1>✅ Visual Testing Passed</h1>
    <p>All ${diffs.length} visual snapshots match their baselines.</p>
    <p><small>Generated: ${new Date().toLocaleString('es-PE')}</small></p>
  </div>
</body>
</html>
  `.trim();
  
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(outputFile, html);
  console.log(`📄 Report saved to: ${outputFile}\n`);
  process.exit(0);
}

console.log(`\n⚠️  Found ${diffs.length} visual difference(s)\n`);

// Generar HTML report
const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Diff Report - ${diffs.length} Differences</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .header {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    .header h1 {
      color: #d32f2f;
      margin-bottom: 10px;
    }
    .header .meta {
      color: #666;
      font-size: 14px;
    }
    .diff-container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    .diff-header {
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .diff-header h2 {
      color: #333;
      font-size: 20px;
      margin-bottom: 5px;
    }
    .diff-header .test-name {
      color: #666;
      font-size: 14px;
      font-family: 'Courier New', monospace;
    }
    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    .image-box {
      text-align: center;
    }
    .image-box h3 {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .image-box img {
      max-width: 100%;
      border: 2px solid #e0e0e0;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .image-box.diff img {
      border-color: #d32f2f;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚠️ Visual Diff Report</h1>
    <div class="meta">
      <strong>${diffs.length}</strong> visual difference(s) detected<br>
      Generated: ${new Date().toLocaleString('es-PE')}
    </div>
  </div>

  ${diffs.map(diff => `
    <div class="diff-container">
      <div class="diff-header">
        <h2>${diff.name}</h2>
        <div class="test-name">Test: ${diff.test}</div>
      </div>
      <div class="images-grid">
        ${diff.expected ? `
          <div class="image-box expected">
            <h3>Expected (Baseline)</h3>
            <img src="../test-results/${diff.relativeExpected}" alt="Expected">
          </div>
        ` : ''}
        ${diff.actual ? `
          <div class="image-box actual">
            <h3>Actual (Current)</h3>
            <img src="../test-results/${diff.relativeActual}" alt="Actual">
          </div>
        ` : ''}
        <div class="image-box diff">
          <h3>Difference (Highlighted)</h3>
          <img src="../test-results/${diff.relativeDiff}" alt="Diff">
        </div>
      </div>
    </div>
  `).join('\n')}

  <div class="footer">
    <p>📊 Review differences and update baselines if changes are intentional</p>
    <p><code>npm run test:update-snapshots</code></p>
  </div>
</body>
</html>
`.trim();

if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
fs.writeFileSync(outputFile, html);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Visual Diff Report Generated');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
diffs.forEach(d => {
  console.log(`⚠️  ${d.test} / ${d.name}`);
});
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`📄 Report saved to: ${outputFile}\n`);
