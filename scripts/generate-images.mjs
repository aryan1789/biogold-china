import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const API_KEY = process.env.GEMINI_API_KEY

const IMAGES = [
  {
    filename: 'pine-pollen-face-mask.jpg',
    prompt: `Photorealistic commercial product photography. A premium luxury face mask skincare product. A sleek matte charcoal-black ceramic jar with a brushed gold lid, filled with rich golden-amber cream. Small pine needles and golden pollen dust artfully arranged around the jar on a dark slate stone surface. Soft studio lighting from upper left. Deep charcoal background. Ultra-high resolution commercial product photography. Shot on Phase One, 85mm lens. Hyperrealistic, not AI-generated looking.`,
  },
  {
    filename: 'pine-pollen-tablets.jpg',
    prompt: `Photorealistic commercial product photography. Premium supplement tablets in a dark amber apothecary glass bottle with brushed gold aluminum lid, lying on its side with small honey-gold tablets spilling out naturally onto dark slate stone. Pine pollen powder dust catches warm light. Deep charcoal background. Soft warm studio lighting. Hyperrealistic pharmaceutical-grade product photography. Shot on Hasselblad, 100mm macro lens. Not AI-generated looking.`,
  },
  {
    filename: 'body-cream.jpg',
    prompt: `Photorealistic commercial product photography. A luxury body cream in an elegant wide-mouth matte black glass jar with heavy brushed gold lid, opened to reveal smooth ivory-gold whipped cream inside. The jar sits on dark slate stone with soft pine bark texture in soft-focus background. Golden pine pollen dust in raking light. Deep charcoal background. Perfume campaign aesthetic. Hyperrealistic, not AI-generated looking.`,
  },
  {
    filename: 'hero-forest.jpg',
    prompt: `Photorealistic aerial drone photography of a dense New Zealand South Island pine forest at golden hour. Thousands of tall radiata pine trees stretching to the horizon with morning mist in the valleys. Low golden sun backlights the canopy creating golden light through pine needles. Deep forest green, warm gold, soft mist. No people, no buildings. Shot from 300m altitude on RED camera. Cinematic, dramatic, ultra realistic nature photography.`,
  },
  {
    filename: 'pollen-close.jpg',
    prompt: `Extreme close-up macro photography of pine pollen grains in golden morning light. Spherical deep gold pollen grains floating suspended, sharp focus on foreground grains with soft bokeh behind. Deep forest green background fading to darkness. Shot on Canon MP-E 65mm macro lens at f/5.6. Ultra realistic scientific macro photography, visually stunning golden orbs of pure light. Not AI-generated looking.`,
  },
]

async function generateWithFlash(prompt, filename) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
    }),
  })
  if (!response.ok) {
    const err = await response.text()
    throw new Error(`${response.status} ${err.slice(0, 200)}`)
  }
  const data = await response.json()
  const parts = data.candidates?.[0]?.content?.parts || []
  const imgPart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'))
  if (!imgPart) throw new Error('No image in response')
  return Buffer.from(imgPart.inlineData.data, 'base64')
}

async function generateWithImagen4(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '4:3',
        safetySetting: 'block_low_and_above',
      },
    }),
  })
  if (!response.ok) {
    const err = await response.text()
    throw new Error(`${response.status} ${err.slice(0, 300)}`)
  }
  const data = await response.json()
  const base64 = data.predictions?.[0]?.bytesBase64Encoded
  if (!base64) throw new Error('No image data returned')
  return Buffer.from(base64, 'base64')
}

async function generateImage(prompt) {
  return generateWithImagen4(prompt)
}

async function main() {
  const outputDir = path.join(__dirname, '..', 'public', 'images', 'products')
  if (!existsSync(outputDir)) await mkdir(outputDir, { recursive: true })

  console.log(`Generating ${IMAGES.length} images...\n`)

  for (const { filename, prompt } of IMAGES) {
    const outputPath = path.join(outputDir, filename)
    if (existsSync(outputPath)) {
      console.log(`  Skipping ${filename} (already exists)`)
      continue
    }
    try {
      process.stdout.write(`  Generating ${filename}...`)
      const buffer = await generateImage(prompt)
      await writeFile(outputPath, buffer)
      console.log(` done (${Math.round(buffer.length / 1024)}KB)`)
    } catch (err) {
      console.error(` FAILED: ${err.message.slice(0, 150)}`)
    }
  }
  console.log('\nDone.')
}

main()
