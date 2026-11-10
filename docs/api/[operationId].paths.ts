import { readSpec } from '../.vitepress/read-spec'
import { specOperations } from '../.vitepress/spec-tags'

// One page per endpoint, at its operationId, which the plugin draws whole,
// heading included. config.ts lists the pages in the sidebar by tag, titles each
// with its summary, and gives the search the words a page has no file to hold.
export default {
  paths() {
    return specOperations(readSpec()).map(({ operationId, summary }) => ({
      params: { operationId, summary },
      content: `<OAOperation operationId="${operationId}" />`,
    }))
  },
}
