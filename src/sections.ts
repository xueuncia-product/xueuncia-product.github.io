export const SECTIONS = [
  { key: 'ai-learning', name: 'AI 学习', en: 'AI Learning', desc: '记录 AI 学习与实践，把工具用进真正的问题。', color: 'var(--accent-ai)' },
  { key: 'philosophy', name: '哲学', en: 'Philosophy', desc: '从阅读与思考中，寻找看问题的方法。', color: 'var(--accent-philosophy)' },
  { key: 'methods', name: '工作方法论', en: 'Methods', desc: '把工作中的经验整理成可重复使用的方法。', color: 'var(--accent-methods)' },
  { key: 'works', name: '作品展示', en: 'Works', desc: '做出来的东西，以及它们背后的过程。', color: 'var(--accent-works)' },
] as const;

export const LEGACY_SECTIONS: Record<string, string> = {
  articles: 'ai-learning', ideas: 'ai-learning', videos: 'ai-learning', gallery: 'works',
};
export const canonicalSection = (key: string) => LEGACY_SECTIONS[key] || key;
