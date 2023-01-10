module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  "parserOptions": {
    "project": ["./tsconfig.json"]
  },
  plugins: [
    '@typescript-eslint'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb-typescript'
  ],
  rules: {
    "react/jsx-filename-extension": [2, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/quotes": "off",
    "react/jsx-closing-tag-location": "off",
    "react/jsx-boolean-value": "off",
    "jsx-a11y/control-has-associated-label": "off",
    "jsx-a11y/media-has-caption": "off",
    "ban-ts-comment": "off",
    "@typescript-eslint/naming-convention": ["off",
      {
        "selector": "default",
        "format": ["camelCase"],
        "leadingUnderscore": "allow"
      },
      {
        "selector": "variable",
        "format": ["camelCase", "UPPER_CASE", "PascalCase"],
        "leadingUnderscore": "allow"
      },
      {
        "selector": ["class", "typeAlias"],
        "format": ["PascalCase"],
        "leadingUnderscore": "allow"
      },
      {
        "selector": "property",
        "format": ["camelCase", "PascalCase"],
        "leadingUnderscore": "allow"
      },
      {
        "selector": "function",
        "format": ["camelCase", "PascalCase"],
        "leadingUnderscore": "allow"
      },
      {
        "selector": "interface",
        "format": ["PascalCase"],
        "prefix": ["I"]
      },
      {
        "selector": "typeParameter",
        "format": ["PascalCase"],
        "prefix": ["T"]
      }
    ],
    "linebreak-style": "off",
    "no-console": "off",
    "max-len": ["error", 180],
    "consistent-return": "off",
    "no-underscore-dangle": "off",
    "indent": "off",
    "@typescript-eslint/indent": ["error", 4],
    "react/jsx-indent": ["error", 4],
    "react/jsx-indent-props": ["error", 4],
    "@typescript-eslint/comma-dangle": "off",
    "arrow-body-style": "off",
    "react/jsx-one-expression-per-line": "off",
    "object-curly-newline": "off",
    "react/no-did-update-set-state": "off",
    "react/destructuring-assignment": "off",
    "react/no-unused-prop-types": "off",
    "react/require-default-props": "off",
    "prefer-template": "off",
    "class-methods-use-this": "off",
    "react/sort-comp": "off",
    "import/prefer-default-export": "off",
    "prefer-destructuring": "off",
    "react/jsx-props-no-spreading": "off",
    "react/no-array-index-key": "off",
    "object-shorthand": "off",
    "react/jsx-wrap-multilines": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "no-plusplus": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "prefer-object-spread": "off",
    "operator-assignment": "off",
    "@typescript-eslint/object-curly-spacing": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "no-prototype-builtins": "off",
    "no-restricted-syntax": "off",
    "import/no-unresolved": "off",
    "import/extensions": "off",
    "global-require": "off",
    "no-case-declarations": "off",
    "no-continue": "off"
  }
  // extends: '@react-native-community', // use prettier
};
