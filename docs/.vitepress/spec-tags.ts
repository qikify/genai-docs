export interface SpecOperation {
  method: string
  path: string
  summary: string
}

export interface SpecTag {
  name: string
  slug: string
  description: string
  operations: SpecOperation[]
}

const methods = ['get', 'post', 'put', 'patch', 'delete']

/**
 * The tags of the API spec, one reference page each, so an endpoint added to
 * genai-api's openapi.yaml shows up once its release's sync PR merges, with
 * no page to write. Tags the spec declares at the top come first, in that
 * order and with their description; any other tag follows in the order its
 * first operation appears.
 */
export function specTags(spec: any): SpecTag[] {
  const tags = new Map<string, SpecTag>()
  const tag = (name: string, description = '') =>
    tags.get(name) ??
    tags.set(name, { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), description, operations: [] }).get(name)!

  for (const declared of spec.tags ?? []) tag(declared.name, declared.description ?? '')

  for (const [path, pathItem] of Object.entries<any>(spec.paths ?? {})) {
    for (const method of methods) {
      const operation = pathItem[method]
      for (const name of operation?.tags ?? []) {
        tag(name).operations.push({ method: method.toUpperCase(), path, summary: operation.summary ?? '' })
      }
    }
  }

  return [...tags.values()]
}
