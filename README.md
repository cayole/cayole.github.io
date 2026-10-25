# CAYOLE / NOTES

一个以 Markdown 文件为内容源的静态个人博客，包含日期线首页、代码高亮、KaTeX 公式和响应式文章页。

后续文章、图解与动画制作统一遵循 [文章制作标准](ARTICLE_STANDARDS.md)，项目工作约定见 [AGENTS.md](AGENTS.md)。

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

## 文章系列

“宏观经济学”系列的文章放在 `src/content/posts/macroeconomics/` 中，例如：

```text
src/content/posts/macroeconomics/macroeconomics-01-introduction.md
```

使用上面的文章模板，并可填写 `tags: 宏观经济学`。子目录中的 Markdown 文章会自动出现在首页；空系列目录不会显示为文章。
文章网址仍使用文件名，因此不同目录中的文章文件名也必须保持唯一。

## 文章中的交互演示

产品市场乘数演示可通过以下专用代码块插入：

~~~~md
~~~goods-market
~~~
~~~~

它支持调整消费倾向和政府购买增量、单步播放及暂停。使用 `spending-quiz` 代码块插入支出分类小游戏，使用 `town-demand` 代码块插入订单、库存与产出的情景演示。

这些是博客内置的组件，不执行文章中提供的 JavaScript 或 HTML。普通代码块仍按原方式显示。

金融主题另提供 `bond-price`、`money-market`、`investment-lab`、`is-lm-lab`、`real-rate`、`bank-capital`、`credit-wedge` 代码块。对应模型和控件位于 `src/components/finance/`，用途见 [文章制作标准](ARTICLE_STANDARDS.md)。

劳动力、通胀与中期主题提供 `labour-count`、`wage-price`、`expectations-lab`、`price-level`、`medium-run`、`deflation-lab` 代码块，对应 `src/components/labour/`。数值与内容回归检查运行 `node --test tests/labour-models.test.mjs tests/labour-content.test.mjs`（Node.js 22.18+，使用原生 TypeScript 类型擦除）。

长期增长与技术就业主题提供 `compound-growth`、`purchasing-power`、`capital-accumulation`、`golden-rule`、`balanced-growth`、`growth-accounting`、`productivity-jobs`、`productivity-wages` 代码块，对应 `src/components/growth/`，复用现有滑块、结果和手动播放控件。数值、边界与内容检查运行 `node --test tests/growth-models.test.mjs tests/growth-content.test.mjs`。这些例子使用虚构数据与明确的简化条件，不是现实增长或就业预测。

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
