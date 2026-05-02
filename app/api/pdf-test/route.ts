import { NextResponse } from 'next/server'
import { existsSync } from 'fs'
import { execSync } from 'child_process'

export async function GET() {
  const results: Record<string, string> = {}

  // Which chromium binaries are findable via which
  for (const name of ['chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable']) {
    try {
      const p = execSync(`which ${name} 2>/dev/null`, { encoding: 'utf8' }).trim()
      results[`which_${name}`] = p || 'not found'
    } catch {
      results[`which_${name}`] = 'not found'
    }
  }

  // Check known paths
  const paths = [
    '/run/current-system/sw/bin/chromium',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
  ]
  for (const p of paths) {
    results[`exists_${p}`] = String(existsSync(p))
  }

  // PUPPETEER_EXECUTABLE_PATH env var
  results['PUPPETEER_EXECUTABLE_PATH'] = process.env.PUPPETEER_EXECUTABLE_PATH || 'not set'

  // Try to actually launch Puppeteer
  try {
    const puppeteer = await import('puppeteer-core')

    let execPath = process.env.PUPPETEER_EXECUTABLE_PATH || ''
    if (!execPath) {
      for (const name of ['chromium', 'chromium-browser', 'google-chrome']) {
        try {
          const p = execSync(`which ${name} 2>/dev/null`, { encoding: 'utf8' }).trim()
          if (p) { execPath = p; break }
        } catch { /* skip */ }
      }
    }

    results['execPath_used'] = execPath || 'none'

    if (execPath) {
      const browser = await puppeteer.default.launch({
        executablePath: execPath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-zygote', '--single-process'],
      })
      const version = await browser.version()
      await browser.close()
      results['launch'] = 'SUCCESS'
      results['version'] = version
    } else {
      results['launch'] = 'SKIPPED — no execPath found'
    }
  } catch (e) {
    results['launch'] = `FAILED: ${e instanceof Error ? e.message : String(e)}`
  }

  return NextResponse.json(results, { status: 200 })
}
