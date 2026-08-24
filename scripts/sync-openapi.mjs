import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import yaml from 'js-yaml'
import { configDotenv } from 'dotenv'

configDotenv()

const url = `../../${process.env.API_DIRECTORY ?? 'api'}/openapi.yaml`

const src = new URL(url, import.meta.url)
const dest = new URL('../docs/public/openapi.json', import.meta.url)

if (existsSync(src)) {
  mkdirSync(new URL('../docs/public', import.meta.url), { recursive: true })
  const spec = yaml.load(readFileSync(src, 'utf8'))
  writeFileSync(dest, JSON.stringify(spec, null, 2))
  console.log('Synced openapi.yaml → docs/public/openapi.json')
} else {
  console.log('Source openapi.yaml not found, using existing docs/public/openapi.json')
}

