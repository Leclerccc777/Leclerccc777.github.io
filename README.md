# 源 // 索引 SOURCE // INDEX

个人开源代码与实验档案。温暖米白纸张、朱砂印色、写实黑胶沟槽与双面曲目档案。

线上地址：https://leclerccc777.github.io/

## 开发与发布

需要 Node.js 22.12+（使用 Node.js 24 验证）。

```sh
npm ci
npm run dev
npm run build
npm run preview
```

React 19、TypeScript、Vite、Tailwind CSS 4、Framer Motion。保持原有 vite.config.ts 与 bundle.mjs。构建先检查 TypeScript，再将 CSS 和 JS 内联，生成 dist/index.html 和根目录 index.html。GitHub Pages 使用 main 分支根目录发布。编辑源码后运行构建，将源码与生成的根目录 index.html 一起提交。字体从 Google Fonts 加载，失败时使用系统字体。

## 编辑与同步项目

修改 client/projects.ts 的 initialProjects。字段为 id、name（真实仓库名）、title、subtitle、year、stack、language、desc、tracks（label 与 detail）、stars、forks、recent（ISO 时间）、url、demo（可选）、private（可选）。B 面使用经过整理的中文曲目档案。

公开仓库列表分页读取，合并星标、分支、主要语言与 pushed_at，同时发现新增公开项目。手写的中文标题、简介与曲目保持不变。localStorage 缓存有效期为一小时；缓存损坏、存储不可用、超时、限流或断网时静默使用静态值。并发同步复用同一请求。不再逐项目拉取 README 或提交记录。

私有项目仅展示作者授权的名称与简介，不请求或公开其源码、README、技术栈及活动指标。访问仍需原有权限。前端不包含访问令牌。

## 交互

- 左右键、鼠标拖动、手机左右滑动或按钮：切盘，弹簧 stiffness 120 / damping 25。
- 空格或翻面按钮：切换 A / B 面，背面提供仓库和可用 Demo 入口。
- Enter、点击当前 A 面或访问按钮：新标签打开仓库。
- 当前项目同步至 URL Hash，分享链接可重载恢复。
- 中英文项目名与技术栈可搜索。
- 外圈每 28 秒自转一周，悬停和翻面时阻尼停转；指针微倾最大 8 度。
- 音效默认关闭，开启后由 Web Audio 合成机械微音效；波形随交互触发。
- 遵循系统减少动态效果设置，实际帧率取决于设备与浏览器。

无追踪脚本。第三方库许可随构建保留，详见各依赖 LICENSE。
