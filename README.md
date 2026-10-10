# 雪豹 UNCIA

个人主页，使用 Astro 和 GitHub Pages。首页提供随北京时间变化的云端主题、星空太极主题和雪豹动效。

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

## 旧时光

首页底部的「旧时光」进入独立阅读页。解锁后可浏览精选文章、内容分类、年份归档和日常记录。
目录、标题、分类、摘要、正文和配图都已加密，公开仓库仅保存密文，不保存原始归档或密码。

加密使用 PBKDF2-SHA256（600,000 次）和 AES-256-GCM，每个文件使用独立随机 nonce。
密码、解密密钥和正文不写入浏览器存储；刷新或锁定后需重新输入密码。
正文在禁用脚本的沙箱中阅读，外部图片不自动加载；显示主题与页面同步。

静态密文可以被下载并离线尝试密码。修改密码需要在私有工作目录重新生成整套密文。
没有正文的历史记录仅保留已有元数据，不尝试补抓。

## 发布

`.github/workflows/deploy.yml` 在推送 `main` 后构建并发布到 GitHub Pages。
只提交页面源、公开素材、密文与构建配置；私密 Markdown、整理中间材料和本地工具须保留在仓库外。
公开文章的列表与正文路由均排除 `draft: true`、`private: true` 或 `source: sina`。
这些路由过滤无法保护提交到公开仓库的源文件，私密正文不能进入 `src/content/posts/`。
