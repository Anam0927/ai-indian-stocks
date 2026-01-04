import reactEslintConfig from '@stocks/config/react'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'

export default reactEslintConfig.append({
  plugins: {
    'better-tailwindcss': eslintPluginBetterTailwindcss,
  },
  rules: {
    ...eslintPluginBetterTailwindcss.configs['recommended-error'].rules,
    'better-tailwindcss/no-unregistered-classes': [
      'error',
      {
        ignore: ['dark', 'toaster'],
      },
    ],
  },
  settings: {
    'better-tailwindcss': {
      entryPoint: './src/index.css',
    },
  },
})
