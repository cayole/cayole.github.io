# CAYOLE / NOTES

一个以 Markdown 文件为内容源的静态个人博客，包含日期线首页、代码高亮、KaTeX 公式和响应式文章页。

## 本地运行

```bash
npm install
npm run dev
```

终端会显示本地地址，通常是 `http://localhost:5173`。保存 Markdown 文件后，页面会自动刷新。

## 新建文章

在 `src/content/posts/` 中创建一个 `.md` 文件。文件名就是文章网址，建议使用小写英文和连字符，例如：

```text
src/content/posts/my-first-post.md
```

文章模板：

````md
---
title: 文章标题
excerpt: 一句话简介，会显示在首页展开区域。
date: 2026-07-01
readTime: 5
tags: 随笔, 开发
cover: images/my-cover.jpg
---

## 正文标题

这里开始写标准 Markdown 正文。

```ts
const message = '代码块会自动高亮'
```

行内公式：$E = mc^2$

$$
V = \frac{I \times C}{D + 1}
$$
````

必填字段为 `title`、`excerpt`、`date`；`readTime`、`tags` 和 `cover` 可以按需填写。日期必须使用 `YYYY-MM-DD` 格式。

## 图片

将图片放入 `public/images/`：

```text
public/images/my-cover.jpg
```

封面写法：

```yaml
cover: images/my-cover.jpg
```

正文图片写法：

```md
![图片说明](images/my-cover.jpg)
```

也可以使用 HTTPS 图片地址。不支持在网页中上传或编辑文章。

## 编辑和删除

- 编辑：直接修改对应的 `.md` 文件并保存。
- 删除：删除对应的 `.md` 文件。
- 修改网址：重命名 `.md` 文件；已有旧链接会失效。

## 构建与发布

本地检查生产构建：

```bash
npm run build
npm run preview
```

推送到 GitHub：

```bash
git add src/content/posts public/images
git commit -m "content: publish new post"
git push
```

仓库中的 `.github/workflows/deploy-pages.yml` 会自动构建并发布。首次使用时，在 GitHub 仓库的 `Settings → Pages` 中将发布来源设为 `GitHub Actions`。

博客没有网页编辑器，也不需要 GitHub token。所有文章变更都通过本地文件和 Git 提交完成。
