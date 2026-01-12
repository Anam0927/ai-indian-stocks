import antfu from '@antfu/eslint-config'
import prettierConflicts from 'eslint-config-prettier'

/**
 * @param {import('@antfu/eslint-config').OptionsConfig} [options]
 */
export function getBaseConfig(options = undefined) {
  return antfu(options, prettierConflicts, {
    ignores: ['**/*.gen.ts', '**/opencode/**'],
  }).overrideRules({
    'perfectionist/sort-imports': [
      'error',
      {
        newlinesBetween: 'always',
      },
    ],
    'node/prefer-global/process': 'off',
  })
}

export default getBaseConfig()
