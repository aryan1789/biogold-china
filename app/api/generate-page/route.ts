import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PRODUCT_CONTEXT = `
Bio Gold is a premium New Zealand pine pollen brand. All products use pine pollen sourced from two South Island NZ locations.

KEY FACTS TO WEAVE IN:
- University of Otago research validates bioactivity
- 4 years government-funded R&D
- Hydroethanolic extraction for maximum bioavailability
- Over 200 bioactive compounds in pine pollen
- 25,000+ NZ customers

COMPLIANCE RULES (STRICT):
- No therapeutic claims (no "treats", "cures", "prevents")
- No disease references by name
- Use: "supports", "maintains", "traditional use", "natural vitality", "as part of a balanced diet"
- No before/after health transformation claims
`

export async function POST(request: NextRequest) {
  try {
    const { name, claims, locale } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Product name required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const claimsList = (claims as string[]).slice(0, 3).join(', ') || 'natural vitality, bioactive support'

    const prompt = `You are generating product page content for Bio Gold, a premium NZ pine pollen brand entering the Chinese market.

${PRODUCT_CONTEXT}

PRODUCT TO GENERATE:
Name: ${name}
Key benefit claims: ${claimsList}

Generate a complete product page in this exact JSON structure. Write in Carl Meyer's voice: direct, warm, plain language, no corporate jargon, no em dashes, no buzzwords.

{
  "en": {
    "name": "${name}",
    "tagline": "Short punchy tagline, 6-10 words max",
    "hero": {
      "headline": "Bold headline, 8-12 words",
      "subheadline": "2-3 sentence supporting paragraph"
    },
    "benefits": [
      { "title": "Benefit 1", "description": "2 sentence description" },
      { "title": "Benefit 2", "description": "2 sentence description" },
      { "title": "Benefit 3", "description": "2 sentence description" },
      { "title": "Benefit 4", "description": "2 sentence description" }
    ],
    "mechanism": "2-3 paragraph explanation of how it works scientifically. Plain language.",
    "ingredientStory": "2 paragraph story about NZ pine pollen provenance and why it matters.",
    "usage": ["Step 1", "Step 2", "Step 3", "Step 4"]
  },
  "zh": {
    "name": "Chinese name for ${name}",
    "tagline": "Chinese tagline",
    "hero": {
      "headline": "Chinese headline",
      "subheadline": "Chinese subheadline paragraph"
    },
    "benefits": [
      { "title": "Chinese benefit 1 title", "description": "Chinese description" },
      { "title": "Chinese benefit 2 title", "description": "Chinese description" },
      { "title": "Chinese benefit 3 title", "description": "Chinese description" },
      { "title": "Chinese benefit 4 title", "description": "Chinese description" }
    ],
    "mechanism": "Chinese mechanism explanation",
    "ingredientStory": "Chinese ingredient story",
    "usage": ["Chinese step 1", "Chinese step 2", "Chinese step 3", "Chinese step 4"]
  }
}

Return ONLY valid JSON. No markdown. No extra text.`

    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Page generation error:', error)
    return NextResponse.json({ error: 'Failed to generate page' }, { status: 500 })
  }
}
