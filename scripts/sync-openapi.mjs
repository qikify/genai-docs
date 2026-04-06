import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import yaml from 'js-yaml'

const src = new URL('../../api/openapi.yaml', import.meta.url)
const dest = new URL('../docs/public/openapi.json', import.meta.url)

mkdirSync(new URL('../docs/public', import.meta.url), { recursive: true })

const spec = yaml.load(readFileSync(src, 'utf8'))
writeFileSync(dest, JSON.stringify(spec, null, 2))

console.log('Synced openapi.yaml → docs/public/openapi.json')
