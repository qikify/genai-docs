import { readFileSync } from 'node:fs'

/** The spec the sync script copied from genai-api, as the build reads it. */
export function readSpec(): any {
  return JSON.parse(readFileSync(new URL('../public/openapi.json', import.meta.url), 'utf8'))
}
