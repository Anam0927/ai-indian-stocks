import { getBaseConfig } from './base.js'

export default getBaseConfig({
  react: true,
}).append({
  files: ['**/ui/*.tsx'],
  rules: {
    'react-refresh/only-export-components': 'off',
  },
})
