import { readSpec } from '../.vitepress/read-spec'
import { specTags } from '../.vitepress/spec-tags'

// The page is the plugin's view of one tag, which draws the tag's name as the
// heading; config.ts's transformPageData gives the page that name as its title.
export default {
  paths() {
    return specTags(readSpec()).map(({ name, slug }) => ({
      params: { tag: slug, name },
      content: `<OASpec :tags='${JSON.stringify([name])}' hide-info hide-servers />`,
    }))
  },
}
