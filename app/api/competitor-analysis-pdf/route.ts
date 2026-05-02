import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function findBrowser(): string {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ].filter(Boolean) as string[]

  for (const p of candidates) {
    try { if (existsSync(p)) return p } catch { /* skip */ }
  }
  throw new Error('No browser found. Set PUPPETEER_EXECUTABLE_PATH env var.')
}

function applyInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
}

function mdToHtml(md: string): string {
  const lines = md.split('\n')
  let html = ''
  let inList = false

  for (const raw of lines) {
    const line = raw.trimEnd()

    if (line.startsWith('# ')) {
      if (inList) { html += '</ul>'; inList = false }
      html += `<h1>${applyInline(line.slice(2))}</h1>\n`
    } else if (line.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false }
      html += `<h2>${applyInline(line.slice(3))}</h2>\n`
    } else if (line.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false }
      html += `<h3>${applyInline(line.slice(4))}</h3>\n`
    } else if (line.startsWith('- ')) {
      if (!inList) { html += '<ul>\n'; inList = true }
      html += `  <li>${applyInline(line.slice(2))}</li>\n`
    } else if (/^---+$/.test(line.trim())) {
      if (inList) { html += '</ul>\n'; inList = false }
      html += '<hr>\n'
    } else if (line.trim() === '') {
      if (inList) { html += '</ul>\n'; inList = false }
    } else {
      if (inList) { html += '</ul>\n'; inList = false }
      html += `<p>${applyInline(line)}</p>\n`
    }
  }

  if (inList) html += '</ul>\n'
  return html
}

async function getMarkdown(isZh: boolean): Promise<string> {
  const zhPath = path.join(process.cwd(), 'public', 'competitor-analysis-zh.md')
  const enPath = path.join(process.cwd(), 'public', 'competitor-analysis.md')

  if (isZh) {
    if (existsSync(zhPath)) return readFile(zhPath, 'utf-8')

    // Chinese file not yet generated — translate on the fly and cache it
    const english = await readFile(enPath, 'utf-8')
    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 5000,
      messages: [{
        role: 'user',
        content: `将以下英文市场竞争分析报告完整翻译成简体中文。保留所有 Markdown 格式（##、###、**粗体**、-列表等）。品牌名称（Bio Gold、QIN SHAN TANG、MIGU、TCM Adaptogen Warehouse）保持英文，其余全部翻译为地道的中文商业语言。\n\n${english}`,
      }],
    })
    const zh = message.content[0].type === 'text' ? message.content[0].text : english
    // Cache for future requests
    await writeFile(zhPath, zh, 'utf-8').catch(() => { /* non-fatal */ })
    return zh
  }

  return readFile(enPath, 'utf-8')
}

function buildAnalysisHtml(markdown: string, date: string, isZh: boolean): string {
  // Strip the top meta lines (title + bold meta) from the markdown body
  // so we render them as the styled cover, not as h1/p in the content
  const bodyMd = markdown
    .replace(/^# .+\n/, '')
    .replace(/^\*\*Prepared for.+\*\*\n/, '')
    .replace(/^\*\*Research date:.+\*\*\n/, '')
    .replace(/^\*\*Scope:.+\*\*\n/, '')
    .replace(/^---\n/, '')

  const body = mdToHtml(bodyMd)

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Bio Gold — China Competitive Analysis</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Outfit', -apple-system, sans-serif; color: #2F2E2D; background: #fff; font-size: 13.5px; line-height: 1.75; }

  /* Cover */
  .cover {
    background: #2F2E2D;
    padding: 56px 60px 48px;
    color: white;
    page-break-after: avoid;
  }
  .cover-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 48px; }
  .brand { display: flex; align-items: center; gap: 14px; }
  .brand-dot { width: 44px; height: 44px; background: #D9A91B; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .brand-name { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
  .brand-sub { font-size: 9px; color: #D9A91B; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
  .doc-badge { background: #D9A91B; color: #2F2E2D; font-size: 9px; font-weight: 700; padding: 5px 14px; border-radius: 20px; letter-spacing: 1.5px; text-transform: uppercase; }
  .cover-title { font-size: 38px; font-weight: 800; color: #fff; letter-spacing: -0.025em; line-height: 1.05; margin-bottom: 12px; }
  .cover-sub { font-size: 14px; color: rgba(255,255,255,0.45); margin-bottom: 32px; }
  .cover-meta { display: flex; gap: 40px; padding-top: 28px; border-top: 1px solid rgba(255,255,255,0.1); }
  .cover-meta-item { }
  .cover-meta-label { font-size: 9px; font-weight: 700; color: #D9A91B; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
  .cover-meta-value { font-size: 12px; color: rgba(255,255,255,0.6); }

  /* Stats bar */
  .stats-bar { background: #D9A91B; padding: 16px 60px; display: flex; gap: 48px; }
  .stat { }
  .stat-val { font-size: 18px; font-weight: 800; color: #2F2E2D; }
  .stat-lbl { font-size: 9px; color: rgba(47,46,45,0.6); font-weight: 600; }

  /* Body */
  .body { padding: 48px 60px; }

  /* Typography */
  h1 { font-size: 26px; font-weight: 800; color: #2F2E2D; letter-spacing: -0.02em; margin-bottom: 20px; margin-top: 40px; }
  h2 { font-size: 16px; font-weight: 700; color: #2F2E2D; margin-top: 40px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #D9A91B; letter-spacing: -0.01em; page-break-after: avoid; }
  h3 { font-size: 11px; font-weight: 700; color: #D9A91B; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 20px; margin-bottom: 5px; page-break-after: avoid; }
  p { margin-bottom: 12px; color: #2F2E2D; }
  ul { margin: 6px 0 14px 20px; }
  li { margin-bottom: 4px; color: #5A5856; }
  strong { font-weight: 700; color: #2F2E2D; }
  em { font-style: italic; color: #5A5856; }
  hr { border: none; border-top: 1px solid #E4D8C3; margin: 32px 0; }

  /* Verdict callout */
  p:has(strong:first-child) { background: #F5F0E8; border-left: 3px solid #D9A91B; padding: 10px 14px; border-radius: 0 6px 6px 0; margin-bottom: 14px; }

  /* Footer */
  .doc-footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #E4D8C3; display: flex; justify-content: space-between; align-items: center; }
  .footer-brand { font-size: 11px; font-weight: 700; color: #2F2E2D; }
  .footer-note { font-size: 10px; color: #9b9289; }
</style>
</head>
<body>

<div class="cover">
  <div class="cover-top">
    <div class="brand">
      <div class="brand-dot">🌲</div>
      <div>
        <div class="brand-name">Bio Gold®</div>
        <div class="brand-sub">${isZh ? '新西兰松花粉' : 'New Zealand Pine Pollen'}</div>
      </div>
    </div>
    <div class="doc-badge">${isZh ? '市场研究报告' : 'Research Report'}</div>
  </div>
  <div class="cover-title">${isZh ? '中国松花粉市场<br>竞争分析报告' : 'China Pine Pollen Market:<br>Competitive Analysis'}</div>
  <div class="cover-sub">${isZh ? '准备方：Bio Gold — Pine Pollen New Zealand Limited' : 'Prepared for Bio Gold — Pine Pollen New Zealand Limited'}</div>
  <div class="cover-meta">
    <div class="cover-meta-item">
      <div class="cover-meta-label">${isZh ? '研究日期' : 'Research date'}</div>
      <div class="cover-meta-value">${date}</div>
    </div>
    <div class="cover-meta-item">
      <div class="cover-meta-label">${isZh ? '研究范围' : 'Scope'}</div>
      <div class="cover-meta-value">${isZh ? '三个主要中国松花粉品牌' : 'Three leading Chinese pine pollen brands'}</div>
    </div>
    <div class="cover-meta-item">
      <div class="cover-meta-label">${isZh ? '文件性质' : 'Classification'}</div>
      <div class="cover-meta-value">${isZh ? '内部资料，请勿外传' : 'Proprietary — do not distribute'}</div>
    </div>
  </div>
</div>

<div class="stats-bar">
  <div class="stat"><div class="stat-val">3</div><div class="stat-lbl">${isZh ? '分析竞争品牌' : 'Competitors analysed'}</div></div>
  <div class="stat"><div class="stat-val">5</div><div class="stat-lbl">${isZh ? '识别的品牌差距' : 'Brand gaps identified'}</div></div>
  <div class="stat"><div class="stat-val">5</div><div class="stat-lbl">${isZh ? '差异化定位角度' : 'Creative angles'}</div></div>
  <div class="stat"><div class="stat-val">0</div><div class="stat-lbl">${isZh ? '进入中国市场的优质新西兰品牌' : 'Premium NZ brands in China today'}</div></div>
</div>

<div class="body">
  ${body}
  <div class="doc-footer">
    <div class="footer-brand">Bio Gold® — Pine Pollen New Zealand Limited</div>
    <div class="footer-note">${isZh ? '内部资料' : 'Proprietary research'} · ${date}</div>
  </div>
</div>

</body>
</html>`
}

export async function GET(request: NextRequest) {
  try {
    const isZh = new URL(request.url).searchParams.get('locale') === 'zh'
    const markdown = await getMarkdown(isZh)
    const date = isZh
      ? new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' })
    const html = buildAnalysisHtml(markdown, date, isZh)

    const puppeteer = await import('puppeteer-core')
    const browser = await puppeteer.default.launch({
      executablePath: findBrowser(),
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    })

    try {
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 })
      const pdf = await page.pdf({
        format: 'A4',
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        printBackground: true,
      })

      return new NextResponse(new Uint8Array(pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="Bio-Gold-China-Competitive-Analysis.pdf"',
        },
      })
    } finally {
      await browser.close()
    }
  } catch (error) {
    console.error('Analysis PDF error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
