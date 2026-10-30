import { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, type PanInfo } from 'framer-motion';
import { initialProjects, owner, count, relative, https, projectHash, indexFromHash, type Project } from './projects';
import { mergeProjects, syncProjects, type SyncState } from './github';
import { playSwitch, playFlip, playOpen, setAudioEnabled, suspendAudio } from './audio';
import './style.css';

function Octocat() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1 1.73 2.64 1.23 3.28.94.1-.73.39-1.23.71-1.51-2.5-.29-5.13-1.25-5.13-5.57 0-1.23.44-2.24 1.16-3.03-.12-.29-.5-1.43.11-2.98 0 0 .95-.3 3.08 1.16a10.8 10.8 0 0 1 5.6 0c2.14-1.46 3.08-1.16 3.08-1.16.61 1.55.23 2.69.12 2.98.72.79 1.15 1.8 1.15 3.03 0 4.33-2.64 5.28-5.15 5.56.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z"/></svg>;
}
const spring = { type: 'spring' as const, stiffness: 120, damping: 25, mass: 0.9 };
const pad = (value: number) => String(value).padStart(2, '0');
type RecordProps = {
  project: Project; offset: number; flipped: boolean; reduce: boolean;
  direction: number; opening: boolean; onSelect: () => void;
  onOpen: (event?: React.MouseEvent) => void;
};
function Record({ project: p, offset, flipped, reduce, direction, opening, onSelect, onOpen }: RecordProps) {
  const active = offset === 0, distance = Math.abs(offset);
  const hover = useRef<HTMLDivElement>(null), hovered = useRef(false), speed = useRef(0);
  const spin = useMotionValue(0);
  useAnimationFrame((_, delta) => {
    const dt = Math.min(delta, 64);
    const target = active && !flipped && !hovered.current && !reduce && !document.hidden ? 1 : 0;
    speed.current += (target - speed.current) * (1 - Math.exp(-dt / 220));
    if (speed.current > 0.001) spin.set((spin.get() + dt * 360 / 28000 * speed.current) % 360);
  });
  const resetTilt = () => {
    hovered.current = false;
    const style = hover.current?.style;
    style?.setProperty('--tilt-x', '0deg');
    style?.setProperty('--tilt-y', '0deg');
    style?.setProperty('--sheen', '0deg');
  };
  useEffect(resetTilt, [active, flipped]);
  const interactive = active && flipped;
  return <motion.div className={`record-slot ${active ? 'is-active' : ''} ${flipped ? 'is-flipped' : ''}`}
    style={{ zIndex: 20 - distance }} initial={false}
    animate={{
      x: `${offset * 79}%`, y: distance * 14, z: active ? 40 : -110 * distance,
      rotateY: active ? 0 : -Math.sign(offset) * 32,
      rotateZ: reduce ? 0 : active ? [direction * 12, 0] : -Math.sign(offset) * 6,
      scale: opening && active ? 1.08 : active ? 1 : Math.max(0.72, 1 - distance * 0.09),
      opacity: opening && active ? 0.25 : 1,
      filter: `blur(${reduce ? 0 : distance * 0.65}px) brightness(${1 - distance * 0.16})`,
    }}
    transition={reduce ? { duration: 0 } : { ...spring, rotateZ: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } }}>
    <div className="record-hover" ref={hover} onPointerEnter={() => { hovered.current = true; }}
      onPointerMove={e => {
        if (!active || flipped || reduce || e.pointerType === 'touch') return;
        const rect = e.currentTarget.getBoundingClientRect();
        const dx = Math.max(-1, Math.min(1, (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)));
        const dy = Math.max(-1, Math.min(1, (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)));
        const style = e.currentTarget.style;
        style.setProperty('--tilt-x', `${-dy * 8}deg`);
        style.setProperty('--tilt-y', `${dx * 8}deg`);
        style.setProperty('--sheen', `${dx * 18 + dy * 12}deg`);
      }} onPointerLeave={resetTilt}>
      <motion.div className="record-flip" animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.85, ease: [0.22, 1, 0.36, 1] }}>
        <div className="vinyl-face vinyl-front" aria-hidden={flipped} onClick={onSelect}>
          <motion.div className="grooves" style={{ rotate: spin }} />
          <div className="vinyl-sheen" />
          <div className="deadwax"><span>SOURCE INDEX — {p.id} — ORIGINAL PRESSING</span><span>CODE ARCHIVE / {p.year} / SIDE A</span></div>
          <div className="center-label">
            <div className="label-top"><Octocat/><span>NO.{p.id}<br/>SOURCE RECORDS</span></div>
            <div className="label-title"><h3>{p.title}</h3><p>{p.subtitle}</p></div>
            <div className="label-bottom"><span className="language-badge">{p.language}</span><span>{p.private ? 'PRIVATE' : `★ ${count(p.stars)}`}<br/>33⅓ RPM</span></div>
          </div>
          <span className="spindle-hole" />
        </div>
        <div className="vinyl-face vinyl-back" aria-hidden={!interactive} inert={!interactive}>
          <div className="sleeve">
            <div className="back-header"><span>NO.{p.id} / SIDE B</span><Octocat/></div>
            <h3>{p.title}</h3><p className="back-subtitle">{p.subtitle}</p>
            <ol className="tracklist">{p.tracks.slice(0, 4).map((track, i) =>
              <li key={track.label}><span>TRACK {pad(i + 1)} // {track.label}</span><p>{track.detail}</p></li>)}</ol>
            <div className="back-actions">
              <a href={https(p.url)} onClick={e => { e.preventDefault(); e.stopPropagation(); onOpen(e); }} target="_blank" rel="noopener noreferrer">打开 GitHub ↗</a>
              {https(p.demo) && <a href={https(p.demo)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>在线预览 ↗</a>}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </motion.div>;
}

function App() {
  const [projects, setProjects] = useState(initialProjects);
  const [cursor, setCursor] = useState(() => Math.max(0, indexFromHash(initialProjects, location.hash)));
  const [flipped, setFlipped] = useState(false), [sound, setSound] = useState(false);
  const [sync, setSync] = useState<SyncState>('loading'), [query, setQuery] = useState('');
  const [opening, setOpening] = useState(false), [pulse, setPulse] = useState(0), [direction, setDirection] = useState(1);
  const reduce = !!useReducedMotion(), stage = useRef<HTMLDivElement>(null);
  const suppress = useRef(0), touch = useRef<{ x: number; y: number; time: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hashReady = useRef(false);
  const active = ((cursor % projects.length) + projects.length) % projects.length, p = projects[active];
  const audio = useRef(sound); audio.current = sound;
  const play = useCallback((kind: 'switch' | 'flip' | 'open') => {
    if (!audio.current) return;
    setPulse(v => v + 1);
    ({ switch: playSwitch, flip: playFlip, open: playOpen })[kind]();
  }, []);
  const select = useCallback((next: number) => {
    setDirection(next >= cursor ? 1 : -1); setCursor(next);
    setFlipped(false); setOpening(false); play('switch');
  }, [cursor, play]);
  const inspect = useCallback(() => { setFlipped(value => !value); play('flip'); }, [play]);
  const open = useCallback(() => {
    const url = https(p.url);
    if (!url || opening) return;
    play('open'); setOpening(true);
    // 在手势回调中打开，避免延迟动画触发浏览器弹窗拦截。
    window.open(url, '_blank', 'noopener,noreferrer');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpening(false), 600);
  }, [p.url, opening, play]);
  useEffect(() => {
    let alive = true;
    void syncProjects().then(result => {
      if (!alive) return;
      setProjects(previous => mergeProjects(previous, result.repos)); setSync(result.state);
    });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    const fromHash = indexFromHash(projects, location.hash);
    if (fromHash >= 0) { setCursor(fromHash); setFlipped(false); }
    const change = () => {
      const index = indexFromHash(projects, location.hash);
      if (index >= 0) { setCursor(index); setFlipped(false); }
    };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, [projects]);
  useEffect(() => {
    // 初次保留目录锚点；等待新仓库同步后再解析尚未知晓的分享链接。
    if (!hashReady.current && location.hash === '#collection') { hashReady.current = true; return; }
    if (sync === 'loading' && location.hash && indexFromHash(projects, location.hash) < 0) return;
    const requested = indexFromHash(projects, location.hash);
    if (!hashReady.current && requested >= 0 && projects[requested].name !== p.name) return;
    hashReady.current = true;
    history.replaceState(null, '', projectHash(p));
  }, [p.name, p.id, sync, projects]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat || target.closest('input,textarea,select,[contenteditable]')) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault(); select(cursor + (event.key === 'ArrowLeft' ? -1 : 1));
      } else if (!target.closest('button,a')) {
        if (event.code === 'Space') { event.preventDefault(); inspect(); }
        if (event.key === 'Enter') { event.preventDefault(); open(); }
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [cursor, select, inspect, open]);
  useEffect(() => {
    const visibility = () => { if (document.hidden) suspendAudio(); };
    document.addEventListener('visibilitychange', visibility);
    return () => { document.removeEventListener('visibilitychange', visibility); if (timer.current) clearTimeout(timer.current); };
  }, []);
  const panEnd = (event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if ('pointerType' in event && event.pointerType === 'touch' || touch.current) return;
    if (Math.abs(info.offset.x) < 8) return;
    suppress.current = performance.now() + 400;
    if (Math.abs(info.offset.x) > Math.abs(info.offset.y) && Math.abs(info.offset.x + info.velocity.x * 0.12) > 55)
      select(cursor + (info.offset.x < 0 ? 1 : -1));
  };
  const filtered = projects.filter(item => `${item.title} ${item.subtitle} ${item.stack}`.toLowerCase().includes(query.toLowerCase()));
  const syncLabel = { loading: '正在同步', live: '已同步 GITHUB', cached: '本地缓存 · 1H', offline: '静态档案' }[sync];
  return <>
    <a className="skip" href="#collection">跳到全部作品</a>
    <header className="topbar flex items-center justify-between">
      <a href="#collection" className="archive-link">个人开源代码与实验档案 <span> / VOL. 03</span> ↙</a>
      <div className="header-right flex items-center">
        <span className={`sync-status ${sync}`} role="status"><i/>{syncLabel}</span>
        <a className="owner flex items-center" href={`https://github.com/${owner}`} target="_blank" rel="noopener noreferrer"><Octocat/>@{owner} ↗</a>
      </div>
    </header>
    <main>
      <section className="hero">
        <div className="masthead">
          <div><h1>源 <span>//</span> 索引<span className="title-period">.</span></h1><p>SOURCE // INDEX <span>— 个人开源代码与实验档案</span></p></div>
          <div className="edition"><span>THE CODE COLLECTION</span><b>{pad(active + 1)}<i> / {pad(projects.length)}</i></b><span>写下代码，也留下一点声音。</span></div>
        </div>
        <section className="player-section" aria-label="黑胶项目轮播">
          <div className="player-caption"><span>精选唱片 / ON THE TURNTABLE</span><span>33⅓ RPM <i>●</i> ORIGINAL CODE</span></div>
          <span className="vertical-caption">ANALOG FEELING. DIGITAL THINKING.</span>
          <motion.div ref={stage} className="stage" tabIndex={0} role="region" aria-roledescription="carousel"
            aria-label="黑胶唱片。左右键切换，空格翻面，回车访问仓库" aria-keyshortcuts="ArrowLeft ArrowRight Space Enter"
            onPanEnd={panEnd}
            onTouchStart={event => {
              if ((event.target as HTMLElement).closest('a,button') || event.touches.length !== 1) { touch.current = null; return; }
              touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY, time: performance.now() };
            }}
            onTouchEnd={event => {
              const start = touch.current; touch.current = null;
              if (!start || !event.changedTouches.length) return;
              const dx = event.changedTouches[0].clientX - start.x, dy = event.changedTouches[0].clientY - start.y;
              if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.25 && performance.now() - start.time < 1500) {
                suppress.current = performance.now() + 450; select(cursor + (dx < 0 ? 1 : -1));
              }
            }} onTouchCancel={() => { touch.current = null; }}>
            <span className="stage-mark mark-left">+</span><span className="stage-mark mark-right">+</span>
            {projects.map((project, index) => {
              const offset = ((index - active + projects.length / 2) % projects.length + projects.length) % projects.length - projects.length / 2;
              return Math.abs(offset) <= 2 && <Record key={project.name} project={project} offset={offset}
                flipped={offset === 0 && flipped} reduce={reduce} direction={direction} opening={opening} onOpen={open}
                onSelect={() => { if (performance.now() < suppress.current) return; if (offset === 0) open(); else select(cursor + offset); }}/>;
            })}
          </motion.div>
          <div className="transport flex items-center justify-center">
            <button onClick={() => select(cursor - 1)} aria-label="上一张唱片">←</button>
            <div className="now-playing"><span>{flipped ? 'SIDE B / 曲目档案' : 'SIDE A / 当前播放'}</span><p>{p.subtitle}</p></div>
            <button onClick={() => select(cursor + 1)} aria-label="下一张唱片">→</button>
          </div>
        </section>
        <section className="metadata" aria-label="当前项目资料" aria-live="polite">
          <div className="meta-project"><span className="section-label">01 / 项目名称 <em>REPOSITORY</em></span>
            <h2>{p.title}</h2><p className="repo-slug">{p.subtitle}</p>
            <dl><div><dt>年份 / YEAR</dt><dd>{p.year}年</dd></div><div><dt>核心技术栈 / PRIMARY STACK</dt><dd className="stack-tags">{p.stack.split(/[·,]/).map(s => <span key={s}>{s.trim()}</span>)}</dd></div></dl>
          </div>
          <div className="meta-notes"><span className="section-label">02 / 项目志 <em>LINER NOTES</em></span>
            <p>{p.desc}</p><div className="project-actions flex flex-wrap">
              <a href={https(p.url)} target="_blank" rel="noopener noreferrer" onClick={() => play('open')}>{p.private ? '私有仓库 · 需权限' : '打开 GitHub 仓库'} ↗</a>
              {https(p.demo) && <a href={https(p.demo)} target="_blank" rel="noopener noreferrer">在线预览 ↗</a>}
              <button onClick={inspect} aria-pressed={flipped}>{flipped ? '返回 A 面' : '查看 B 面'} ⤾</button>
            </div>
          </div>
          <div className="meta-data"><span className="section-label">03 / 实时指标 <em>SESSION DATA</em></span>
            <dl>{[['星标 / STARS', count(p.stars)], ['分支 / FORKS', count(p.forks)], ['主要语言 / LANGUAGE', p.language], ['最近更新 / UPDATED', relative(p.recent)]].map(([label, value]) =>
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
            <p className="data-note">{p.private ? 'PRIVATE PRESSING / 仅名称与简介公开' : `PUBLIC PRESSING / ${syncLabel}`}</p>
          </div>
        </section>
        <div className="control-bar">
          <div className="browse-controls"><button onClick={() => select(cursor - 1)} aria-label="向左切换唱片"><kbd>←</kbd></button><button onClick={() => select(cursor + 1)} aria-label="向右切换唱片"><kbd>→</kbd></button><span>切换唱片</span></div>
          <button className="control" onClick={inspect} aria-pressed={flipped}><kbd>SPACE</kbd>{flipped ? '翻回 A 面' : '翻转 B 面'}</button>
          <button className="control" onClick={open}><kbd>ENTER</kbd>访问仓库 ↗</button>
          <span className="drag-copy">拖动 / 滑动以浏览 ⟷</span>
          <button className={`audio-toggle ${sound ? 'sound-on' : ''}`} aria-pressed={sound} onClick={() => {
            const next = !sound; setSound(next); audio.current = next; setAudioEnabled(next); if (next) play('switch');
          }}><span className="waveform" key={pulse} aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <i key={i} style={{ animationDelay: `${i * 0.045}s` }}/>)}</span>音效：{sound ? '开启' : '关闭'}</button>
        </div>
      </section>
      <section className="collection" id="collection">
        <div className="collection-header flex justify-between items-end"><div><span className="section-label">完整目录 / THE DISCOGRAPHY</span><h2>想法，刻录于此<span>。</span></h2></div>
          <label className="search-label">DIG THROUGH THE CRATES<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索项目、语言或想法…" /></label></div>
        <div className="list-heading"><span>目录 / PROJECT</span><span>技术栈 / STACK</span><span>介质 / PRESSING</span><span>年份 / YEAR</span><span/></div>
        {filtered.map(project => <button key={project.name} className={`project-row ${project.name === p.name ? 'selected' : ''}`} aria-current={project.name === p.name ? 'true' : undefined}
          aria-label={`查看 ${project.title}`} onClick={() => {
            select(projects.indexOf(project)); history.replaceState(null, '', projectHash(project));
            stage.current?.scrollIntoView({ block: 'center', behavior: reduce ? 'instant' : 'smooth' });
            stage.current?.focus({ preventScroll: true });
          }}>
          <span className="row-name"><small>{project.id}</small><span>{project.title}<em>{project.subtitle}</em></span></span>
          <span>{project.stack}</span><span>{project.private ? 'PRIVATE' : 'PUBLIC'}</span><span>{project.year}</span><span className="row-arrow">↗</span>
        </button>)}
        {!filtered.length && <p className="empty">没有找到这张唱片。试试其他项目名或语言。</p>}
        <div className="collection-foot flex justify-between"><span>持续创作。持续归档。</span><span>{pad(projects.length)} RECORDS / INDEPENDENT ARCHIVE</span></div>
      </section>
    </main>
    <footer className="flex justify-between items-end"><div><span>每一个想法，都值得被听见。</span><p>SOURCE // INDEX</p></div><a href={`https://github.com/${owner}`} target="_blank" rel="noopener noreferrer">© {new Date().getFullYear()} {owner.toUpperCase()} ↗</a><span className="footer-note">DESIGNED TO BE EXPLORED.<br/>BUILT TO KEEP EVOLVING.</span></footer>
  </>;
}
createRoot(document.getElementById('root')!).render(<App/>);

