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

当前版本不依赖后端。需要跨设备同步或正式部署时，可将 `src/lib/posts.ts` 的存储层替换为 CMS、数据库或 Markdown 文件接口。
