module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:unicorn/recommended', 'plugin:prettier/recommended'],
  rules: {
    'unicorn/no-process-exit': ['off'],
    'unicorn/no-null': ['off'],
    'unicorn/no-array-reduce': ['off'],
    'unicorn/prefer-spread': ['off'],
  },
};
