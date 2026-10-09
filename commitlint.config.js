export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'web',
        'gateway',
        'auth',
        'content',
        'gameplay',
        'progress',
        'rewards',
        'kit',
        'contracts',
        'infra',
        'repo',
        'ci',
        'docs',
      ],
    ],
    'subject-case': [0],
  },
};
