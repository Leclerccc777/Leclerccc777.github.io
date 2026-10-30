import { owner, https, type Project } from './projects';
export interface Repository {
  name: string; description: string | null; private: boolean; owner: { login: string };
  created_at: string; pushed_at: string | null; language: string | null;
  html_url: string; stargazers_count: number; forks_count: number;
}
export type SyncState = 'loading' | 'live' | 'cached' | 'offline';
const KEY = `source-index:${owner}:repos:v3`, TTL = 60 * 60 * 1000;
let pending: Promise<{ repos: Repository[]; state: SyncState }> | undefined;
function valid(value: unknown): value is Repository {
  if (!value || typeof value !== 'object') return false;
  const r = value as Repository;
  return typeof r.name === 'string' && r.name.length > 0 && r.private === false &&
    typeof r.owner?.login === 'string' && r.owner.login.toLowerCase() === owner.toLowerCase() &&
    typeof r.created_at === 'string' && Number.isFinite(Date.parse(r.created_at)) &&
    (r.pushed_at === null || typeof r.pushed_at === 'string' && Number.isFinite(Date.parse(r.pushed_at))) &&
    (r.language === null || typeof r.language === 'string') &&
    (r.description === null || typeof r.description === 'string') &&
    typeof r.html_url === 'string' && r.html_url.startsWith(`https://github.com/${owner}/`) &&
    Number.isSafeInteger(r.stargazers_count) && r.stargazers_count >= 0 &&
    Number.isSafeInteger(r.forks_count) && r.forks_count >= 0;
}
export function readCache(now = Date.now()): Repository[] | null {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!value || !Number.isFinite(value.time) || now < value.time || now - value.time >= TTL ||
      !Array.isArray(value.repos) || !value.repos.every(valid)) return null;
    return value.repos;
  } catch { return null; }
}
async function fetchAll(): Promise<{ repos: Repository[]; state: SyncState }> {
  const repos: Repository[] = [];
  for (let page = 1; ; page++) {
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`https://api.github.com/users/${owner}/repos?type=owner&per_page=100&page=${page}`, {
        signal: controller.signal, headers: { Accept: 'application/vnd.github+json' },
      });
      if (!response.ok) throw new Error(`GitHub ${response.status}`);
      const batch: unknown = await response.json();
      if (!Array.isArray(batch) || !batch.every(valid)) throw new Error('Invalid repository data');
      repos.push(...batch);
      if (batch.length < 100) break;
    } finally { clearTimeout(timeout); }
  }
  const unique = [...new Map(repos.map(r => [r.name, r])).values()];
  try { localStorage.setItem(KEY, JSON.stringify({ time: Date.now(), repos: unique })); } catch { /* 缓存可选。 */ }
  return { repos: unique, state: 'live' };
}
export function syncProjects(): Promise<{ repos: Repository[]; state: SyncState }> {
  const cached = readCache();
  if (cached) return Promise.resolve({ repos: cached, state: 'cached' });
  // 复用并发请求；失败保持静态档案，无逐项目额外请求。
  pending ??= fetchAll().catch(() => ({ repos: [], state: 'offline' as const })).finally(() => { pending = undefined; });
  return pending;
}
export function mergeProjects(existing: Project[], repos: Repository[]): Project[] {
  const projects = existing.map(p => ({ ...p }));
  for (const repo of repos.filter(valid)) {
    let project = projects.find(p => p.name.toLowerCase() === repo.name.toLowerCase());
    if (project?.private) continue;
    if (!project) {
      project = {
        id: String(Math.max(0, ...projects.map(p => Number(p.id) || 0)) + 1).padStart(2, '0'),
        name: repo.name, title: repo.name, subtitle: repo.name.toUpperCase(), year: repo.created_at.slice(0, 4),
        stack: repo.language || '未标注', language: repo.language || '未标注',
        desc: repo.description || '这个新项目已收入档案。打开 GitHub 阅读项目文档与代码。',
        tracks: [
          { label: '项目简介', detail: repo.description || '作者尚未填写简介。' },
          { label: '主要语言', detail: repo.language || '尚未标注。' },
          { label: '代码档案', detail: '在 GitHub 阅读完整文档与提交记录。' },
        ],
        stars: 0, forks: 0, recent: null, url: https(repo.html_url)!,
      };
      projects.push(project);
    }
    project.stars = repo.stargazers_count;
    project.forks = repo.forks_count;
    project.recent = repo.pushed_at;
    project.language = repo.language || project.language;
  }
  return projects;
}

