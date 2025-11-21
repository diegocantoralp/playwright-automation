/**
 * Merge multiple test reports into a single consolidated report
 * Useful when running tests in sharded mode or multiple CI jobs
 */

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUTPUT_FILE = path.join(REPORTS_DIR, 'merged-results.json');

async function mergeReports() {
  console.log('🔄 Merging test reports...\n');

  const reportsFiles = [
    'test-results.json',
    'smoke-results.json',
    'regression-results.json',
    'api-results.json'
  ];

  const mergedData = {
    config: {},
    suites: [],
    errors: [],
    stats: {
      startTime: new Date().toISOString(),
      duration: 0,
      expected: 0,
      unexpected: 0,
      flaky: 0,
      skipped: 0
    }
  };

  let foundReports = 0;

  for (const fileName of reportsFiles) {
    const filePath = path.join(REPORTS_DIR, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⏭️  Skipping ${fileName} (not found)`);
      continue;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      console.log(`✅ Processing ${fileName}`);
      console.log(`   - Suites: ${data.suites?.length || 0}`);
      console.log(`   - Passed: ${data.stats?.expected || 0}`);
      console.log(`   - Failed: ${data.stats?.unexpected || 0}`);
      console.log(`   - Flaky: ${data.stats?.flaky || 0}`);
      console.log(`   - Skipped: ${data.stats?.skipped || 0}\n`);

      // Merge suites
      if (data.suites) {
        mergedData.suites.push(...data.suites);
      }

      // Merge errors
      if (data.errors) {
        mergedData.errors.push(...data.errors);
      }

      // Merge stats
      if (data.stats) {
        mergedData.stats.duration += data.stats.duration || 0;
        mergedData.stats.expected += data.stats.expected || 0;
        mergedData.stats.unexpected += data.stats.unexpected || 0;
        mergedData.stats.flaky += data.stats.flaky || 0;
        mergedData.stats.skipped += data.stats.skipped || 0;
      }

      // Use first config found
      if (!mergedData.config.rootDir && data.config) {
        mergedData.config = data.config;
      }

      foundReports++;
    } catch (error) {
      console.error(`❌ Error processing ${fileName}:`, error.message);
    }
  }

  if (foundReports === 0) {
    console.log('⚠️  No reports found to merge');
    return;
  }

  // Calculate total and pass rate
  const total = mergedData.stats.expected + mergedData.stats.unexpected + mergedData.stats.flaky;
  const passed = mergedData.stats.expected + mergedData.stats.flaky;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;

  mergedData.stats.total = total;
  mergedData.stats.passRate = passRate;
  mergedData.stats.endTime = new Date().toISOString();

  // Write merged report
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mergedData, null, 2));

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Merged Report Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total Tests:   ${total}`);
  console.log(`✅ Passed:     ${mergedData.stats.expected}`);
  console.log(`❌ Failed:     ${mergedData.stats.unexpected}`);
  console.log(`⚠️  Flaky:      ${mergedData.stats.flaky}`);
  console.log(`⏭️  Skipped:    ${mergedData.stats.skipped}`);
  console.log(`📈 Pass Rate:  ${passRate}%`);
  console.log(`⏱️  Duration:   ${(mergedData.stats.duration / 1000).toFixed(2)}s`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`📁 Merged report saved to: ${OUTPUT_FILE}\n`);
}

// Run if called directly
if (require.main === module) {
  mergeReports().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { mergeReports };
