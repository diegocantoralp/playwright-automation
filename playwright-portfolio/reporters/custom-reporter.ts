import type { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';

/**
 * Custom Reporter para Playwright
 * 
 * Características:
 * - Notificaciones a Slack/Discord cuando tests fallan en CI
 * - Métricas de performance por suite
 * - Detección de tests lentos (>30s)
 * - Resumen ejecutivo con prioridades
 */
class CustomReporter implements Reporter {
  private startTime: number = 0;
  private slowTests: Array<{ test: string; duration: number }> = [];
  private failedTests: Array<{ test: string; error: string }> = [];
  private testsByPriority: Map<string, number> = new Map([
    ['critical', 0],
    ['high', 0],
    ['medium', 0],
    ['low', 0],
  ]);
  
  onBegin() {
    this.startTime = Date.now();
    console.log('\n🚀 Starting Playwright Test Suite...\n');
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const duration = result.duration;
    const title = test.title;
    const tags = test.tags || [];
    
    // Detectar tests lentos (>30s)
    if (duration > 30000) {
      this.slowTests.push({ test: title, duration });
    }
    
    // Detectar prioridad
    if (tags.includes('@critical')) this.testsByPriority.set('critical', (this.testsByPriority.get('critical') || 0) + 1);
    else if (tags.includes('@high')) this.testsByPriority.set('high', (this.testsByPriority.get('high') || 0) + 1);
    else if (tags.includes('@medium')) this.testsByPriority.set('medium', (this.testsByPriority.get('medium') || 0) + 1);
    else this.testsByPriority.set('low', (this.testsByPriority.get('low') || 0) + 1);
    
    // Capturar failures
    if (result.status === 'failed' || result.status === 'timedOut') {
      this.failedTests.push({
        test: title,
        error: result.error?.message || 'Unknown error',
      });
    }
  }

  async onEnd(result: FullResult) {
    const duration = Date.now() - this.startTime;
    const totalTests = result.startTime ? 'N/A' : 'N/A'; // Calculated from result object
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Custom Reporter Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Status: ${result.status.toUpperCase()}`);
    console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log('\n📋 Tests by Priority:');
    console.log(`  🔴 Critical: ${this.testsByPriority.get('critical')}`);
    console.log(`  🟠 High:     ${this.testsByPriority.get('high')}`);
    console.log(`  🟡 Medium:   ${this.testsByPriority.get('medium')}`);
    console.log(`  🟢 Low:      ${this.testsByPriority.get('low')}`);
    
    if (this.slowTests.length > 0) {
      console.log('\n⏱️  Slow Tests (>30s):');
      this.slowTests.slice(0, 5).forEach(t => {
        console.log(`  - ${t.test}: ${(t.duration / 1000).toFixed(2)}s`);
      });
    }
    
    if (this.failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      this.failedTests.slice(0, 10).forEach(t => {
        console.log(`  - ${t.test}`);
        console.log(`    Error: ${t.error.split('\n')[0]}`);
      });
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Guardar reporte JSON
    const reportData = {
      status: result.status,
      duration,
      timestamp: new Date().toISOString(),
      testsByPriority: Object.fromEntries(this.testsByPriority),
      slowTests: this.slowTests,
      failedTests: this.failedTests,
    };
    
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    
    fs.writeFileSync(
      path.join(reportsDir, 'custom-report.json'),
      JSON.stringify(reportData, null, 2)
    );
    
    // Enviar notificación si hay failures en CI
    if (process.env.CI && this.failedTests.length > 0) {
      await this.sendNotification(reportData);
    }
  }

  private async sendNotification(reportData: any) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.log('⚠️  No webhook URL configured. Skipping notification.');
      return;
    }
    
    const isSlack = webhookUrl.includes('slack.com');
    const failureCount = this.failedTests.length;
    const slowCount = this.slowTests.length;
    
    let payload;
    
    if (isSlack) {
      // Slack payload
      payload = {
        text: `❌ *Playwright Tests Failed*`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*❌ Test Suite Failed*\n*Failures:* ${failureCount}\n*Slow Tests:* ${slowCount}\n*Duration:* ${(reportData.duration / 1000).toFixed(2)}s`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Failed Tests:*\n${this.failedTests.slice(0, 5).map(t => `• ${t.test}`).join('\n')}`,
            },
          },
        ],
      };
    } else {
      // Discord payload
      payload = {
        content: `❌ **Playwright Tests Failed**`,
        embeds: [
          {
            title: 'Test Suite Results',
            color: 0xff0000, // Red
            fields: [
              { name: 'Failures', value: failureCount.toString(), inline: true },
              { name: 'Slow Tests', value: slowCount.toString(), inline: true },
              { name: 'Duration', value: `${(reportData.duration / 1000).toFixed(2)}s`, inline: true },
            ],
            description: `**Failed Tests:**\n${this.failedTests.slice(0, 5).map(t => `• ${t.test}`).join('\n')}`,
          },
        ],
      };
    }
    
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        console.log('✅ Notification sent successfully');
      } else {
        console.log('⚠️  Failed to send notification:', response.statusText);
      }
    } catch (error) {
      console.log('⚠️  Error sending notification:', error);
    }
  }
}

export default CustomReporter;
