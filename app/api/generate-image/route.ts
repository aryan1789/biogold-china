import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.GEMINI_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { name, claims } = await request.json()

    if (!API_KEY) {
      return NextResponse.json({ error: 'Image generation not configured' }, { status: 500 })
    }

    const prompt = `Photorealistic commercial product photography. A premium New Zealand pine pollen supplement product called "${name}". Key benefits: ${(claims as string[]).join(', ')}. An elegant dark glass jar or bottle with brushed gold lid and accents, sitting on dark slate stone. Pine needles and golden pollen dust scattered around it. Deep charcoal background. Soft warm studio lighting from above left. Ultra high resolution commercial product photography, hyperrealistic, not AI-generated looking. Shot on Phase One camera.`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '1:1',
          safetySetting: 'block_low_and_above',
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Imagen error:', err)
      return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })
    }

    const data = await response.json()
    const base64 = data.predictions?.[0]?.bytesBase64Encoded
    if (!base64) return NextResponse.json({ error: 'No image returned' }, { status: 500 })

    return NextResponse.json({ image: `data:image/jpeg;base64,${base64}` })
  } catch (err) {
    console.error('Generate image error:', err)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}
