// Flat ESLint config (ESLint 9). Extends Expo's recommended config.
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/*', 'dist-check/*', 'node_modules/*', '.expo/*', 'scripts/*'],
  },
  {
    rules: {
      // The kit-variant registry (useKitVariant / useKitVariant slots) resolves a
      // MODULE-SCOPED component at runtime — it is not created during render, so it
      // is remount-safe. This rule cannot see that, so we disable it project-wide.
      'react-hooks/static-components': 'off',
      // Reanimated shared values are intentionally mutated via `.value`. The React
      // Compiler immutability rule does not model this, so we disable it.
      'react-hooks/immutability': 'off',
      // RESPONSIVENESS RULE: no fixed pixel sizes. Dimensions must flow through the
      // responsive scalers (r.s / r.ms / scale / moderateScale / fontScale / wp / hp)
      // or theme tokens, so the UI adapts to every phone width/height. 0 and 1
      // (hairlines/resets) are allowed.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'Property[key.name=/^(width|height|minWidth|minHeight|maxWidth|maxHeight|fontSize|lineHeight|borderRadius)$/] > Literal[raw=/^[0-9.]+$/][value!=0][value!=1]',
          message:
            'No fixed pixel sizes. Use responsive scalers (r.s/r.ms/scale/moderateScale/fontScale/wp/hp) or theme tokens.',
        },
        {
          selector:
            'JSXAttribute[name.name=/^(width|height|size)$/] > JSXExpressionContainer > Literal[raw=/^[0-9.]+$/][value!=0][value!=1]',
          message:
            'No fixed pixel sizes. Use responsive scalers (r.s/r.ms/scale/moderateScale/fontScale/wp/hp) or theme tokens.',
        },
      ],
    },
  },
  {
    // The responsive scalers and design tokens are the ONE place guideline numbers
    // are authored; the rule does not apply to them.
    files: ['src/core/theme/responsive.ts', 'src/core/theme/tokens.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
];
