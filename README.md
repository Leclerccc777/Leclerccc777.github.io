# SOURCE // INDEX — The Vinyl Collection

Leclerccc777 的个人代码唱片馆。米白纸纹、黑胶沟槽、圆形项目标签和 CSS 3D 景深轮播。

**线上地址：** https://leclerccc777.github.io/

## 开发与发布

需要 Node.js 22.12+（已用 Node.js 24 验证）。

```sh
npm ci
npm run dev
npm run build
npm run preview
```

技术栈：React 19、TypeScript、Vite、Tailwind CSS 4、Framer Motion。`npm run build` 先做 TypeScript 检查，再构建并把 CSS / JS 内联，生成 `dist/index.html` 和仓库根目录 `index.html`。

GitHub Pages 保持 **Deploy from a branch → main → / (root)**。修改源码后执行构建，将源码和生成的根目录 `index.html` 一起提交，即可更新。无需令牌、服务器或运行时 CDN；字体从 Google Fonts 加载，失败时自动使用系统字体。

## 更新项目

编辑 `client/projects.ts` 的 `initialProjects` 数组。字段包括 `id`、`name`（真实仓库名）、`title`（中文标题）、`subtitle`（英文副标题）、`year`、`stack`、`desc`、`stars`、`forks`、`commits`、`recent`（ISO 日期）、`url`、`demo`、`label`、`preview`、`private`。

加载时分页发现账号所有公开仓库，补充新增项目与真实 star / fork 数据。选中公开仓库后请求默认分支最新提交、提交数量及 README 摘要；数量根据 `per_page=1` 的分页末页计算。API 超时或限流时仍可浏览存档，未获得的数据显示 `—`。

作者已同意展示的私有项目只包含名称与简介，不请求或公开源码、README 和统计。访问其仓库仍需要原有 GitHub 权限。前端严禁放置访问令牌。

## 交互与可访问性

- 左右键、左右按钮或拖动：切换唱片；Spring stiffness 120 / damping 25。
- 空格或“翻面”：查看 B 面 README 纯文本摘要；返回 A 面可用同一操作。
- Enter、点击当前唱片或“打开仓库”：在新标签打开真实仓库。
- 索引支持按中英文项目名、语言、简介搜索。
- Web Audio 合成微弱机械点击与摩擦声，默认关闭；动态波形在交互时响应。
- 尊重系统减少动态效果设置；动画主要使用 transform 和 opacity。移动端帧率受设备和浏览器影响，不承诺所有设备固定 60fps。

构建后无需安装运行依赖；无账号登录、无分析追踪。第三方库许可随构建保留，详见依赖各自 LICENSE。
