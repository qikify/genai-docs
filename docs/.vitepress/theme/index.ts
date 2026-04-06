import DefaultTheme from 'vitepress/theme'
import { theme, useOpenapi } from 'vitepress-openapi/client'
import spec from '../../public/openapi.json'
import 'vitepress-openapi/dist/style.css'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    const openapi = useOpenapi({
      spec,
      config: {
        operation: {
          hiddenSlots: ['playground'],
        },
      },
    })
    theme.enhanceApp({ ...ctx, openapi })
  },
}
