/**
 * Research Agent - Run once before building the site.
 * Scrapes Chinese pine pollen competitor data and generates a bilingual positioning teardown.
 *
 * Usage: npx tsx scripts/research-agent.ts
 *
 * Outputs:
 *   public/competitor-analysis.md    (English)
 *   public/competitor-analysis-zh.md (Chinese)
 *
 * Re-run if competitors or market conditions change.
 */

import { writeFile } from 'fs/promises'
import { readFileSync } from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'

// Load .env.local without requiring dotenv
try {
  const env = readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8')
  for (const line of env.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
  }
} catch { /* no .env.local, fall through */ }

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const COMPETITORS = [
  {
    name: 'QIN SHAN TANG',
    url: 'https://www.amazon.com/stores/QINSHANTANG/page/8DD33AA2-C9C9-4A16-88AA-390104EF7FB0',
    notes: 'Amazon-based Chinese pine pollen supplement brand. Capsules with ginger and Vitamin C. Sources from Chengde. 99% cracked cell wall claim.',
  },
  {
    name: 'MIGU Adaptogen Bio-tech',
    url: 'http://www.fungus-extract.com',
    notes: 'Xi\'an-based B2B extract manufacturer. cGMP/ISO certified. 62 patents. 500+ herb extracts. Supplies pharmaceutical and nutraceutical sectors.',
  },
  {
    name: 'TCM Adaptogen Warehouse',
    url: 'https://www.pinepollentablet.com',
    notes: 'Chinese B2B pine pollen tablet manufacturer. Export-focused. 500mg tablets. Traditional Chinese medicine positioning.',
  },
]

const BIOGOLD_CONTEXT = `
Bio Gold is a premium New Zealand pine pollen brand:
- University of Otago in vitro research: up to 40% bioactivity support observed in human cells
- 4 years government-funded R&D (AGMARDT, Callaghan Innovation, MPI)
- Sublingual liquid tincture — bypasses gut degradation entirely
- 2-minute hold under tongue for full absorption
- Hydroethanolic extraction from two South Island NZ locations
- Premium brand: Gold #D9A91B, Beige #E4D8C3, Charcoal #2F2E2D
- 25,000+ NZ customers
`

async function scrapeCompetitor(competitor: typeof COMPETITORS[0]): Promise<string> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(competitor.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; research-agent/1.0)' },
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) {
      return `Could not fetch ${competitor.url}. Using known data: ${competitor.notes}`
    }

    const html = await res.text()
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .slice(0, 4000)

    return `Scraped from ${competitor.url}:\n${text}`
  } catch {
    return `Fallback data for ${competitor.name}: ${competitor.notes}`
  }
}

async function generateAnalysis(scrapedData: Array<{ name: string; data: string }>): Promise<string> {
  const competitorSummaries = scrapedData
    .map((c) => `### ${c.name}\n${c.data}`)
    .join('\n\n')

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: `You are a market research analyst preparing a competitive intelligence report for Bio Gold entering the Chinese pine pollen market.

BIO GOLD CONTEXT:
${BIOGOLD_CONTEXT}

COMPETITOR DATA (scraped):
${competitorSummaries}

Write a comprehensive English competitive analysis report in Markdown format. Structure:

1. Executive Summary
2. Competitor 1: [name] — positioning, strengths, weaknesses, gap Bio Gold exploits
3. Competitor 2: [name] — same structure
4. Competitor 3: [name] — same structure
5. Brand Gap Analysis — 5 specific gaps Bio Gold can own
6. Creative Angles — 5 specific positioning angles with tagline ideas
7. Distribution Recommendation

Be specific, strategic, and direct. This is internal intelligence, not marketing copy.
Format as clean Markdown. Use ## for sections, ### for subsections.`,
      },
    ],
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}

async function generateChineseAnalysis(englishAnalysis: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 5000,
    messages: [
      {
        role: 'user',
        content: `将以下英文市场竞争分析报告完整翻译成简体中文。保留所有 Markdown 格式（##、###、**粗体**、-列表等）。品牌名称（Bio Gold、QIN SHAN TANG、MIGU、TCM Adaptogen Warehouse）保持英文，其余全部翻译为地道的中文商业语言。不要意译，忠实翻译原文的所有内容和结构。

${englishAnalysis}`,
      },
    ],
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}

async function main() {
  console.log('Starting research agent...')

  console.log('Scraping competitor data...')
  const scrapedData = await Promise.all(
    COMPETITORS.map(async (competitor) => ({
      name: competitor.name,
      data: await scrapeCompetitor(competitor),
    }))
  )

  console.log('Generating English analysis with Claude...')
  const analysis = await generateAnalysis(scrapedData)

  const dateEN = new Date().toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' })
  const dateZH = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })

  const headerEN = `# Chinese Pine Pollen Market: Competitive Analysis\n\n**Prepared for Bio Gold — Pine Pollen New Zealand Limited**\n**Research date: ${dateEN}**\n**Scope: Three leading Chinese pine pollen brands, market positioning gaps, and creative angles for Bio Gold's China entry.**\n\n---\n\n`
  const enPath = path.join(process.cwd(), 'public', 'competitor-analysis.md')
  await writeFile(enPath, headerEN + analysis, 'utf-8')
  console.log(`English analysis written to ${enPath}`)

  console.log('Generating Chinese analysis with Claude...')
  const zhAnalysis = await generateChineseAnalysis(analysis)

  const headerZH = `# 中国松花粉市场竞争分析\n\n**准备方：Bio Gold — Pine Pollen New Zealand Limited**\n**研究日期：${dateZH}**\n**研究范围：三个主要中国松花粉品牌、市场定位差距及 Bio Gold 进入中国市场的差异化角度。**\n\n---\n\n`
  const zhPath = path.join(process.cwd(), 'public', 'competitor-analysis-zh.md')
  await writeFile(zhPath, headerZH + zhAnalysis, 'utf-8')
  console.log(`Chinese analysis written to ${zhPath}`)
}

main().catch(console.error)
