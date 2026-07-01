# CAYOLE / NOTES

一个排版驱动的个人博客原型，包含日期线首页、Markdown 文章页与实时预览编辑器。

## 本地运行

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

## 已支持

- 首页日期线与可展开文章简介
- Markdown、GFM、代码语法高亮
- KaTeX 行内公式与独立公式
- 本地图片插入（单张上限 1.5 MB）与远程图片 URL
- 新建、编辑文章与浏览器 `localStorage` 持久化
- 桌面和移动端响应式布局

## GitHub Pages 发布与网页写作

仓库已包含 `.github/workflows/deploy-pages.yml`。上传到 GitHub 后：

1. 打开仓库 `Settings → Pages`。
2. 将 `Build and deployment` 的来源设置为 `GitHub Actions`。
3. 等待首次 `Deploy blog to GitHub Pages` 工作流完成。
4. 在 GitHub 创建 fine-grained personal access token：只选择博客仓库，并只授予 `Contents: Read and write`。
5. 打开博客编辑器中的“发布到 GitHub”，填写所有者、仓库名、分支和令牌。
6. 点击“提交并发布”。文章会写入 `public/posts.json`，随后触发 Pages 重新部署。

令牌仅保存在编辑页面的内存中，刷新页面后即清除；仓库信息会保存在当前浏览器。不要把令牌写入源码、环境变量或 Git 提交。

没有 GitHub 令牌时，“保存到本机”仍会使用浏览器 `localStorage`，适合草稿和离线编辑。
