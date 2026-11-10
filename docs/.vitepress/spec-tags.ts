export interface SpecOperation {
  operationId: string
  method: string
  path: string
  summary: string
  description: string
  tags: string[]
}

export interface SpecTag {
  name: string
  slug: string
  description: string
  operations: SpecOperation[]
}

const methods = ['get', 'post', 'put', 'patch', 'delete']

/**
 * Every endpoint of the API spec, one reference page each, so an endpoint
 * added to genai-api's openapi.yaml shows up once its release's sync PR
 * merges, with no page to write.
 */
export function specOperations(spec: any): SpecOperation[] {
  return Object.entries<any>(spec.paths ?? {}).flatMap(([path, pathItem]) =>
    methods
      .filter((method) => pathItem[method])
      .map((method) => {
        const operation = pathItem[method]
        return {
          operationId: operation.operationId,
          method: method.toUpperCase(),
          path,
          summary: operation.summary ?? '',
          description: operation.description ?? '',
          tags: operation.tags ?? [],
        }
      }),
  )
}

/**
 * The spec's endpoints by tag, as the overview lists them. Tags the spec
 * declares at the top come first, in that order and with their description;
 * any other tag follows in the order its first operation appears.
 */
export function specTags(spec: any): SpecTag[] {
  const tags = new Map<string, SpecTag>()
  const tag = (name: string, description = '') =>
    tags.get(name) ??
    tags.set(name, { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), description, operations: [] }).get(name)!

  for (const declared of spec.tags ?? []) tag(declared.name, declared.description ?? '')

  for (const operation of specOperations(spec)) {
    for (const name of operation.tags) tag(name).operations.push(operation)
  }

  return [...tags.values()]
}
