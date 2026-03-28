import { Resvg } from '@resvg/resvg-js'
import { writeFileSync } from 'fs'
import { renderOgImage } from '../src/views/og-image.js'

const svg = renderOgImage()
console.log('SVG length:', svg.length)

const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
const pngData = resvg.render()
const pngBuffer = pngData.asPng()
console.log('PNG size:', pngBuffer.length, 'bytes')

const b64 = pngBuffer.toString('base64')
writeFileSync('og-image-b64.txt', b64)
console.log('Base64 written to og-image-b64.txt, length:', b64.length)
