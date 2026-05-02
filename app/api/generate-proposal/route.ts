import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { existsSync } from 'fs'
import { execSync } from 'child_process'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const GEMINI_KEY = process.env.GEMINI_API_KEY

const BIOGOLD_BRIEF = `
Bio Gold is a premium New Zealand pine pollen brand entering the Chinese market.

PRODUCT RANGE:
1. Pine Pollen Face Mask - Skincare, phytoandrogens + antioxidants, topical bioavailability
2. Pine Pollen Tablets - Supplement, standardised extract, energy + vitality + adaptogenic
3. Pine Pollen Body Cream - Skincare, skin barrier + bioactive nourishment

KEY FACTS:
- University of Otago research: pine pollen supports testosterone in human cells by up to 40%
- 4 years government-funded R&D (AGMARDT, Callaghan Innovation, MPI)
- Harvested from two South Island New Zealand locations
- Hydroethanolic extract for maximum bioavailability
- 25,000+ customers across New Zealand

PARTNERSHIP TERMS (standard):
- MOQ: 500 units per SKU for initial order
- Margin: 40-45% distributor margin on RRP
- Payment terms: 30% deposit, 70% before shipping
- Lead time: 4-6 weeks from confirmed order
- Support: bilingual marketing materials, product training, regulatory documentation

REGULATORY:
- Products can enter China via CBEC on Tmall Global or JD Worldwide without Blue Hat registration
- Full NMPA registration pathway available for the retail channel
- All products TGA-compliant (Australian standard)
`

function findBrowser(): string {
  // Try explicit env var first
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH
  }

  // Try to find via which (works on any Linux including Nix)
  for (const name of ['chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable']) {
    try {
      const found = execSync(`which ${name} 2>/dev/null`, { encoding: 'utf8' }).trim()
      if (found) return found
    } catch { /* not in PATH */ }
  }

  // Fallback to known static paths
  const candidates = [
    '/run/current-system/sw/bin/chromium',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ]

  for (const p of candidates) {
    try { if (existsSync(p)) return p } catch { /* skip */ }
  }
  throw new Error('No browser found. Set PUPPETEER_EXECUTABLE_PATH env var.')
}

async function htmlToPdf(html: string): Promise<Buffer> {
  const puppeteer = await import('puppeteer-core')
  const browser = await puppeteer.default.launch({
    executablePath: findBrowser(),
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-zygote', '--single-process'],
  })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 })
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      printBackground: true,
    })
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}

async function scrapeDistributorBrand(input: string): Promise<string> {
  let url = input.trim()
  if (!url.match(/^https?:\/\//)) {
    if (url.includes('.')) url = `https://${url}`
    else return ''
  }

  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 7000)
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; biogold-research/1.0)' },
      signal: controller.signal,
    })
    clearTimeout(t)
    if (!res.ok) return ''

    const html = await res.text()

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim().slice(0, 100) : ''

    const descMatch = html.match(/name=["']description["'][^>]*content=["']([^"']+)/i)
      || html.match(/content=["']([^"']+)["'][^>]*name=["']description["']/i)
    const description = descMatch ? descMatch[1].trim().slice(0, 200) : ''

    const hexColors = [...new Set(html.match(/#[0-9a-fA-F]{6}/g) || [])].slice(0, 6)

    const headings = (html.match(/<h[12][^>]*>([^<]+)<\/h[12]>/gi) || [])
      .map(h => h.replace(/<[^>]+>/g, '').trim())
      .filter(Boolean)
      .slice(0, 4)
      .join(' | ')

    const bodyText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 400)

    const parts = [`Site: ${url}`, `Title: ${title}`]
    if (description) parts.push(`Description: ${description}`)
    if (hexColors.length) parts.push(`Brand colours: ${hexColors.join(', ')}`)
    if (headings) parts.push(`Key headings: ${headings}`)
    parts.push(`Content sample: ${bodyText}`)
    return parts.join('\n')
  } catch {
    return ''
  }
}

async function generatePackagingImage(company: string, brandData: string): Promise<string | null> {
  if (!GEMINI_KEY) return null

  const aestheticNote = brandData
    ? `The distributor's brand data: ${brandData.slice(0, 350)}. Subtly incorporate their visual aesthetic — colours, mood, and style — into the display background and lighting while keeping the Bio Gold product packaging as the hero.`
    : 'Use a premium neutral dark aesthetic with warm gold lighting.'

  try {
    const prompt = `Photorealistic premium product packaging mockup photography for a B2B pitch to ${company}. Three Bio Gold New Zealand pine pollen supplement products: a face mask jar, a supplement bottle, and a body cream jar. Each with dark glass and brushed gold lids, minimalist gold "Bio Gold" lettering. Arranged on a dark slate surface with pine needles and golden pollen dust. ${aestheticNote} Soft warm studio lighting. Ultra high resolution commercial photography, hyperrealistic. Professional pitch deck aesthetic.`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${GEMINI_KEY}`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: '16:9', safetySetting: 'block_low_and_above' },
      }),
    })

    if (!res.ok) return null
    const data = await res.json()
    const b64 = data.predictions?.[0]?.bytesBase64Encoded
    return b64 ? `data:image/jpeg;base64,${b64}` : null
  } catch {
    return null
  }
}

async function generateProposalCopy(company: string, isZh: boolean): Promise<string> {
  const prompt = isZh
    ? `你正在为 Bio Gold 撰写一份 B2B 经销商合作方案。Bio Gold 是一个正在进入中国市场的优质新西兰松花粉品牌。

${BIOGOLD_BRIEF}

经销商：${company}

请用简体中文撰写一份专业、个性化的经销商合作方案，针对该公司量身定制。全文必须完全用中文，包括所有章节标题。

使用 ## markdown 标注每个章节标题。用完整段落书写，正文不用项目符号列表。

## 开场白
用贵公司名称作个性化问候。2-3句话说明 Bio Gold 与贵公司的契合点。

## 关于 Bio Gold
3-4句话介绍品牌故事、新西兰产地背景和科研验证。

## 产品系列
简要介绍全部三款产品及核心卖点，每款一段。

## 中国市场机遇
2-3句话说明中国消费者对新西兰进口产品的信任度及市场时机。

## 合作条款
以加粗标签的散文形式呈现以下内容：起订量、经销商利润率、付款条款、交货周期、所提供的支持。

## 法规路径
说明跨境电商（CBEC）进入路径及完整国家药监局（NMPA）注册选项，语言清晰，避免过于专业。

## 下一步
明确的行动号召，温暖收尾。

语气：专业而不失温度，直接，自信，不做作，不推销。不使用破折号。
不做治疗性声明。使用"支持"、"维持"、"天然活力"、"传统适应原草本"等表述。`
    : `You are writing a B2B distributor proposal for Bio Gold, a premium New Zealand pine pollen brand entering the Chinese market.

${BIOGOLD_BRIEF}

DISTRIBUTOR: ${company}

Write a professional, personalised distributor proposal tailored to this specific company. Write entirely in English.

Use ## markdown for each section heading. Write in full paragraphs, no bullet lists in prose sections.

## Opening
Personalised greeting using their company name. 2-3 sentences on why Bio Gold is a natural fit for them specifically.

## About Bio Gold
3-4 sentences on brand story, NZ provenance, and scientific validation.

## The Product Range
Brief overview of all three products with key selling points. One short paragraph per product.

## The China Market Opportunity
2-3 sentences on consumer trust in NZ imports and market timing.

## Partnership Terms
Write this as structured prose with bold labels. Cover: MOQ, distributor margin, payment terms, lead time, support provided.

## Regulatory Path
CBEC entry route explanation and full NMPA pathway option. Keep it clear and non-technical.

## Next Steps
Clear call to action. Warm close.

Tone: warm-professional, direct, confident. Not corporate. Not salesy. No em dashes.
No therapeutic claims. Use: "supports", "maintains", "natural vitality", "traditional adaptogenic herb".`

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1800,
    messages: [{ role: 'user', content: prompt }],
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}

function formatMarkdown(text: string): string {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  let html = ''
  let inPara = false

  for (const raw of lines) {
    const line = raw
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')

    if (/^## /.test(line)) {
      if (inPara) { html += '</p>'; inPara = false }
      html += `<h2 class="sh2">${line.slice(3).trim()}</h2>`
    } else if (/^### /.test(line)) {
      if (inPara) { html += '</p>'; inPara = false }
      html += `<h3 class="sh3">${line.slice(4).trim()}</h3>`
    } else if (line.trim() === '') {
      if (inPara) { html += '</p>'; inPara = false }
    } else {
      if (!inPara) { html += '<p>'; inPara = true }
      else html += '<br/>'
      html += line
    }
  }

  if (inPara) html += '</p>'
  return html
}

export async function POST(request: NextRequest) {
  try {
    const { company, locale } = await request.json()

    if (!company?.trim()) {
      return NextResponse.json({ error: 'Company name required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const isZh = locale === 'zh'

    const [proposalText, brandData] = await Promise.all([
      generateProposalCopy(company, isZh),
      scrapeDistributorBrand(company),
    ])

    const packagingImage = await generatePackagingImage(company, brandData)

    const html = buildPDFHTML(company, proposalText, packagingImage, isZh)
    const pdfBuffer = await htmlToPdf(html)

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Bio-Gold-Proposal-${company.replace(/\s+/g, '-')}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Proposal generation error:', error)
    return NextResponse.json({ error: 'Failed to generate proposal' }, { status: 500 })
  }
}

function buildPDFHTML(company: string, content: string, packagingImage: string | null, isZh: boolean): string {
  const formatted = formatMarkdown(content)
  const date = isZh
    ? new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' })

  const packagingSection = packagingImage ? `
  <div class="packaging">
    <div class="packaging-label">${isZh ? '产品包装概念图' : 'Packaging Concept'}</div>
    <img src="${packagingImage}" alt="Bio Gold packaging concept" class="packaging-img" />
    <p class="packaging-note">${isZh ? '概念包装效果图，仅供参考。正式合作后可提供定制方案。' : 'Concept packaging render for illustration purposes. Custom solutions available on confirmed partnership.'}</p>
  </div>` : ''

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Bio Gold — Distributor Proposal — ${company}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Outfit', -apple-system, sans-serif; color: #2F2E2D; background: #fff; }

  /* Cover */
  .cover {
    background: #2F2E2D;
    min-height: 260px;
    padding: 56px 60px 48px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .cover-top { display: flex; align-items: center; justify-content: space-between; }
  .brand-mark { display: flex; align-items: center; gap: 14px; }
  .brand-circle {
    width: 48px; height: 48px;
    background: #D9A91B;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; flex-shrink: 0;
  }
  .brand-name { font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
  .brand-sub { font-size: 9px; color: #D9A91B; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
  .cover-badge {
    background: #D9A91B; color: #2F2E2D;
    font-size: 9px; font-weight: 700;
    padding: 5px 14px; border-radius: 20px;
    letter-spacing: 1.5px; text-transform: uppercase;
  }
  .cover-bottom { margin-top: 40px; }
  .cover-for { font-size: 10px; font-weight: 700; color: #D9A91B; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
  .cover-company { font-size: 36px; font-weight: 800; color: #fff; letter-spacing: -0.02em; line-height: 1.1; }
  .cover-date { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 10px; }

  /* Stats bar */
  .stats-bar {
    background: #D9A91B;
    padding: 16px 60px;
    display: flex; gap: 48px; align-items: center;
  }
  .stat-item { display: flex; align-items: center; gap: 10px; }
  .stat-val { font-size: 18px; font-weight: 800; color: #2F2E2D; }
  .stat-lbl { font-size: 10px; color: rgba(47,46,45,0.65); font-weight: 600; max-width: 100px; line-height: 1.3; }

  /* Body */
  .body { padding: 52px 60px; }

  /* Packaging */
  .packaging { margin: 40px 0; border-radius: 10px; overflow: hidden; border: 1px solid #E4D8C3; }
  .packaging-label { font-size: 9px; font-weight: 700; color: #D9A91B; letter-spacing: 2px; text-transform: uppercase; padding: 10px 16px; background: #F5F0E8; border-bottom: 1px solid #E4D8C3; }
  .packaging-img { width: 100%; height: 300px; object-fit: cover; display: block; }
  .packaging-note { font-size: 9px; color: #9b9289; padding: 8px 16px; background: #F5F0E8; border-top: 1px solid #E4D8C3; }

  /* Content typography */
  .content p { font-size: 13.5px; line-height: 1.85; color: #2F2E2D; margin-bottom: 14px; }
  .content strong { color: #2F2E2D; font-weight: 700; }
  .content em { font-style: italic; }
  .content .sh2 {
    font-size: 17px; font-weight: 700; color: #2F2E2D;
    margin-top: 36px; margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 2px solid #D9A91B;
    letter-spacing: -0.01em;
  }
  .content .sh3 {
    font-size: 14px; font-weight: 700; color: #D9A91B;
    margin-top: 20px; margin-bottom: 6px;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .content .sh2:first-child { margin-top: 0; }

  /* Terms box */
  .terms-box {
    background: #F5F0E8;
    border-radius: 10px;
    padding: 24px 28px;
    margin: 32px 0;
    border-left: 3px solid #D9A91B;
  }
  .terms-box p { font-size: 13px; line-height: 1.7; color: #2F2E2D; margin-bottom: 8px; }
  .terms-box p:last-child { margin-bottom: 0; }

  /* Compliance */
  .compliance { margin-top: 40px; padding: 16px 20px; background: #F5F0E8; border-radius: 8px; }
  .compliance p { font-size: 9.5px; color: #9b9289; line-height: 1.6; margin-bottom: 3px; }

  /* Footer */
  .doc-footer {
    margin-top: 32px;
    padding-top: 20px;
    border-top: 1px solid #E4D8C3;
    display: flex; justify-content: space-between; align-items: center;
  }
  .footer-brand { font-size: 11px; font-weight: 700; color: #2F2E2D; }
  .footer-entity { font-size: 10px; color: #9b9289; }
</style>
</head>
<body>

<div class="cover">
  <div class="cover-top">
    <div class="brand-mark">
      <div class="brand-circle">🌲</div>
      <div>
        <div class="brand-name">Bio Gold®</div>
        <div class="brand-sub">New Zealand Pine Pollen</div>
      </div>
    </div>
    <div class="cover-badge">${isZh ? '经销商合作方案' : 'Distributor Proposal'}</div>
  </div>
  <div class="cover-bottom">
    <div class="cover-for">${isZh ? '致' : 'Prepared for'}</div>
    <div class="cover-company">${company}</div>
    <div class="cover-date">${date}</div>
  </div>
</div>

<div class="stats-bar">
  <div class="stat-item">
    <div class="stat-val">40%</div>
    <div class="stat-lbl">${isZh ? '奥塔哥大学体外研究生物活性数据' : 'Bioactivity in Otago in vitro research'}</div>
  </div>
  <div class="stat-item">
    <div class="stat-val">25,000+</div>
    <div class="stat-lbl">${isZh ? '新西兰客户数量' : 'Customers across New Zealand'}</div>
  </div>
  <div class="stat-item">
    <div class="stat-val">${isZh ? '4年' : '4 yrs'}</div>
    <div class="stat-lbl">${isZh ? '政府资助研发' : 'Government-funded R&D'}</div>
  </div>
  <div class="stat-item">
    <div class="stat-val">0</div>
    <div class="stat-lbl">${isZh ? '进入中国市场的优质新西兰松花粉品牌' : 'Premium NZ pine pollen brands in China today'}</div>
  </div>
</div>

${packagingSection}

<div class="body">
  <div class="content">${formatted}</div>

  <div class="compliance">
    <p>${isZh ? '请仔细阅读标签并按照使用说明使用。' : 'Always read the label and follow the directions for use.'}</p>
    <p>${isZh ? '若症状持续，请咨询医疗专业人员。' : 'If symptoms persist, talk to your health professional.'}</p>
  </div>

  <div class="doc-footer">
    <div>
      <div class="footer-brand">Bio Gold® — Pine Pollen New Zealand Limited</div>
      <div class="footer-entity">New Zealand · www.biogoldnz.com</div>
    </div>
    <div class="footer-entity">${date}</div>
  </div>
</div>

</body>
</html>`
}
