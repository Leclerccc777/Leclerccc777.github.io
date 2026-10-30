export interface Track { label: string; detail: string }
export interface Project {
  id: string; name: string; title: string; subtitle: string; year: string;
  stack: string; language: string; desc: string; tracks: Track[];
  stars: number | null; forks: number | null; recent: string | null;
  url: string; demo?: string; private?: boolean;
}
export const owner = 'Leclerccc777';
// 私有项目只使用作者已授权公开的名称与简介，不请求其源码或指标。
export const initialProjects: Project[] = [
  {
    id: '01', name: 'spanish', title: '每天一点西语', subtitle: 'HOLA / SPANISH', year: '2026',
    stack: 'HTML · JavaScript · Node.js', language: 'HTML',
    desc: '为中文学习者制作的西语学习工具。6,500 个词条、分级练习与语音，把语言学习拆成每天可完成的一小步；从浏览器出发，也延伸至微信小程序。',
    tracks: [
      { label: '学习内容', detail: '6,500 词库与 A1–B2 分级练习。' },
      { label: '日常节奏', detail: '语音、年度计划与学习记录备份。' },
      { label: '运行介质', detail: '浏览器 HTML 与原生微信小程序。' },
      { label: '进度保存', detail: '默认在线版的进度保存在当前浏览器。' },
    ],
    stars: 0, forks: 0, recent: null, url: 'https://github.com/Leclerccc777/spanish',
    demo: 'https://leclerccc777.github.io/spanish/',
  },
  {
    id: '02', name: 'qicheng-recruitment', title: '启程', subtitle: 'QICHENG / RECRUITMENT', year: '2026',
    stack: '未公开', language: '未公开', private: true,
    desc: '启程：面向大学生的可追溯招聘信息聚合网站。此处仅展示作者授权公开的项目名称与简介，仓库访问需要相应权限。',
    tracks: [
      { label: '项目方向', detail: '可追溯的招聘信息聚合。' },
      { label: '适用人群', detail: '面向大学生。' },
      { label: '档案权限', detail: '仅公开名称与简介，源码需仓库权限。' },
    ],
    stars: null, forks: null, recent: null, url: 'https://github.com/Leclerccc777/qicheng-recruitment',
  },
  {
    id: '03', name: '-travel', title: '旅途手记', subtitle: 'TRAVEL / NOTES', year: '2026',
    stack: 'Markdown', language: 'Markdown',
    desc: '旅游规划。为下一次出发预留的项目空间，目前仅有初始 README，等待路线、目的地与沿途故事慢慢填满。',
    tracks: [
      { label: '项目主题', detail: '旅游规划与出行记录。' },
      { label: '当前进度', detail: '初始 README，内容待完善。' },
      { label: '阅读方式', detail: '在 GitHub 查看现有文档。' },
    ],
    stars: 0, forks: 0, recent: null, url: 'https://github.com/Leclerccc777/-travel',
  },
  {
    id: '04', name: '-web_pages', title: '网页实验', subtitle: 'WEB / EXPERIMENTS', year: '2026',
    stack: 'HTML', language: 'HTML',
    desc: '随便玩玩。在浏览器里试验想法，收藏独立网页与个人创作；从一个生日页面开始，把小小的心意写成可以打开的网页。',
    tracks: [
      { label: '创作介质', detail: '独立 HTML 网页。' },
      { label: '现有作品', detail: 'birthday.html 生日页面。' },
      { label: '在线阅读', detail: '通过 GitHub Pages 直接体验。' },
    ],
    stars: 0, forks: 0, recent: null, url: 'https://github.com/Leclerccc777/-web_pages',
    demo: 'https://leclerccc777.github.io/-web_pages/birthday.html',
  },
  {
    id: '05', name: 'Leclerccc777.github.io', title: '源 // 索引', subtitle: 'SOURCE / INDEX', year: '2026',
    stack: 'React · TypeScript · Tailwind · Motion', language: 'TypeScript',
    desc: '用一张张黑胶收藏代码、实验与持续生长的想法。纸张、音轨和弹簧运动共同构成这份交互档案；这间唱片馆，也是作品集中的一件作品。',
    tracks: [
      { label: '界面构成', detail: 'React、TypeScript 与 Tailwind CSS。' },
      { label: '运动系统', detail: 'CSS 3D、弹簧惯性与双面翻转。' },
      { label: '声音材质', detail: 'Web Audio 实时合成机械微音效。' },
      { label: '档案同步', detail: '公开仓库数据与一小时本地缓存。' },
    ],
    stars: 0, forks: 0, recent: null, url: 'https://github.com/Leclerccc777/Leclerccc777.github.io',
    demo: 'https://leclerccc777.github.io/',
  },
];
export const count = (n: number | null) => n === null ? '—' : n.toLocaleString('zh-CN');
export function relative(date: string | null): string {
  if (!date || !Number.isFinite(Date.parse(date))) return '—';
  const seconds = Math.max(0, (Date.now() - Date.parse(date)) / 1000);
  if (seconds < 60) return '刚刚';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}天前`;
  return new Date(date).toLocaleDateString('zh-CN');
}
export function https(url?: string): string | undefined {
  try { const parsed = new URL(url || ''); return parsed.protocol === 'https:' ? parsed.href : undefined; }
  catch { return undefined; }
}
export const projectHash = (p: Project) => `#${p.id}-${encodeURIComponent(p.name)}`;
export const indexFromHash = (projects: Project[], hash: string) => projects.findIndex(p => projectHash(p) === hash);

