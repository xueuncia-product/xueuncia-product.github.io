# 雪豹 UNCIA

个人主页，使用 Astro 和 GitHub Pages。首页提供随北京时间变化的云端主题、星空太极主题、水墨山水主题和雪豹动效。

站点：<https://xueuncia-product.github.io/>

## 本地开发

需要 Node.js 24，依赖版本由 `package-lock.json` 固定。

```sh
npm ci
npm run dev -- --background
npm run build
```

`src/home.html` 是首页视觉源，`src/pages/index.astro` 原样载入它；其余栏目在 `src/pages/`。
字体和图片随站点托管，浏览器不依赖第三方字体 CDN。
三主题字体由 `public/themes/typography.css` 统一控制：云端使用 Noto Sans SC 黑体，太极使用 Noto Serif SC 宋体与 Newsreader，水墨使用霞鹜文楷；导航、标题、正文和文句一起切换。新中文字形采用 OFL 自托管分包，浏览器只加载当前页所需字符。

`public/themes/scenes.js` 和 `scenes.css` 是全站主题背景与文句的共享源；水墨山水配文言文，六种空间星系配古典诗句，云层科技光路配英文原著名句。路由决定构图和文句，正文保持独立清晰的阅读区。
首页雪豹使用六个有序姿态，水墨使用坐姿与舔爪两张透明插画；首次动作约3.2秒，支持点击或键盘打招呼，减少动态偏好时静止。

## 旅行作品

作品展示按「视频作品、互动作品、旅行工具」分组。视频区分别提供《见周期》和两段峡湾短片的封面、时长及入口，不混入文章或工具列表。
新西兰页含两份本人实拍的峡湾原声短片，依据原素材和旧剪辑记录重建，明确标注来源情况；目的地参考图库继续独立标注摄影者与CC0出处。

## 旧时光

顶部导航的「旧时光」进入公开阅读页，无需密码，可浏览精选文章、内容分类、年份归档和日常记录。
原有 AES-256-GCM 文件保留，`public/vault/data/access.json` 公开读取密钥；这种文件包装没有访问限制，所有目录、正文和配图均可被任何人读取和保存。
原始 Markdown 备份仍保存在仓库外，密码不写入网站文件。
正文经过严格的标签、链接和配图过滤后整页阅读，外部图片不自动加载；三主题背景、文句和正文颜色与全站同步。
没有正文的历史记录仅保留已有元数据，不尝试补抓。

## 发布

`.github/workflows/deploy.yml` 在推送 `main` 后构建并发布到 GitHub Pages。
只提交页面源、公开素材、密文与构建配置；私密 Markdown、整理中间材料和本地工具须保留在仓库外。
公开文章的列表与正文路由均排除 `draft: true`、`private: true` 或 `source: sina`。
这些路由过滤无法保护提交到公开仓库的源文件，私密正文不能进入 `src/content/posts/`。
