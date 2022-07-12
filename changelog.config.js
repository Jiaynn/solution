const packages = [
  'qnuniapp-im-demo',
  'qnweapp-im-demo',
  'qnweapp-interview-demo',
  'qnweb-cloud-class-demo',
  'qnweb-cube-ui',
  'qnweb-exam-system-demo',
  'qnweb-im-demo',
  'qnweb-interview-demo',
  'qnweb-overhaul-demo',
  'qnweb-rtc-ai-demo',
  'qnweb-video-together-demo',
  'qnweb-whiteboard-demo',
  'qnuniapp-im',
  'qnweapp-im',
  'qnweb-exam-sdk',
  'qnweb-high-level-rtc',
  'qnweb-im',
  'qnweb-rtc-ai',
  'qnweb-whiteboard',
  'whiteboard',
  'qnuniapp-voice-chat',
  'qnuniapp-live'
];

module.exports = {
  disableEmoji: true,
  format: '{type}{scope}: {emoji}{subject}',
  list: ['test', 'feat', 'fix', 'chore', 'docs', 'refactor', 'style', 'ci', 'perf', 'release'],
  maxMessageLength: 64,
  minMessageLength: 3,
  questions: ['type', 'scope', 'subject', 'body', 'breaking', 'issues', 'lerna'],
  scopes: packages.concat(''),
  types: {
    chore: {
      description: 'Build process or auxiliary tool changes',
      emoji: '🤖',
      value: 'chore',
    },
    ci: {
      description: 'CI related changes',
      emoji: '🎡',
      value: 'ci',
    },
    docs: {
      description: 'Documentation only changes',
      emoji: '✏️',
      value: 'docs',
    },
    feat: {
      description: 'A new feature',
      emoji: '🎸',
      value: 'feat',
    },
    fix: {
      description: 'A bug fix',
      emoji: '🐛',
      value: 'fix',
    },
    perf: {
      description: 'A code change that improves performance',
      emoji: '⚡️',
      value: 'perf',
    },
    refactor: {
      description: 'A code change that neither fixes a bug or adds a feature',
      emoji: '💡',
      value: 'refactor',
    },
    release: {
      description: 'Create a release commit',
      emoji: '🏹',
      value: 'release',
    },
    style: {
      description: 'Markup, white-space, formatting, missing semi-colons...',
      emoji: '💄',
      value: 'style',
    },
    test: {
      description: 'Adding missing tests',
      emoji: '💍',
      value: 'test',
    },
  },
};
