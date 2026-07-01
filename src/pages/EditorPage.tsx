import { Bold, Braces, Check, ChevronDown, CloudUpload, Code2, GitBranch, Heading2, ImagePlus, Link2, LoaderCircle, ShieldCheck, Sigma } from 'lucide-react'
import { type ChangeEvent, type ReactNode, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MarkdownBody } from '../components/MarkdownBody'
import { githubPostsPath, GitHubPublishError, loadGitHubConfig, publishPostsToGitHub, saveGitHubConfig } from '../lib/github'
import { createSlug, getPosts, savePost } from '../lib/posts'
import { safeImageUrl } from '../lib/urls'
import type { Post } from '../types'

const starterMarkdown = `## 从这里开始

写下正文。你可以使用 **粗体**、列表、引用，以及标准 Markdown 语法。

### 一段代码

\`\`\`ts
const note = '保持具体，保持诚实。'
console.log(note)
\`\`\`

行内公式 $E = mc^2$，或独立公式：

$$
f(x) = \\int_{-\\infty}^{\\infty} \\hat f(\\xi) e^{2\\pi i \\xi x} d\\xi
$$
`

interface ToolButtonProps {
  label: string
  icon: ReactNode
  onClick: () => void
}

function ToolButton({ label, icon, onClick }: ToolButtonProps) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label}>
      {icon}<span>{label}</span>
    </button>
  )
}

export function EditorPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const editId = searchParams.get('id')
  const existing = editId ? getPosts().find((post) => post.id === editId) : undefined
  const [title, setTitle] = useState(existing?.title ?? '')
  const [excerpt, setExcerpt] = useState(existing?.excerpt ?? '')
  const [date, setDate] = useState(existing?.date ?? new Date().toISOString().slice(0, 10))
  const [tags, setTags] = useState(existing?.tags.join(', ') ?? '随笔')
  const [cover, setCover] = useState(existing?.cover ?? '')
  const [content, setContent] = useState(existing?.content ?? starterMarkdown)
  const [notice, setNotice] = useState('')
  const draftIdRef = useRef(existing?.id ?? crypto.randomUUID())
  const draftSlugRef = useRef(existing?.slug)
  const [githubOpen, setGithubOpen] = useState(false)
  const [githubConfig, setGithubConfig] = useState(loadGitHubConfig)
  const [githubToken, setGithubToken] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [commitUrl, setCommitUrl] = useState('')

  useEffect(() => {
    document.title = existing ? `编辑：${existing.title}` : '写一篇 / CAYOLE'
    return () => { document.title = 'CAYOLE / NOTES' }
  }, [existing])

  function insertMarkdown(before: string, after = '', placeholder = '') {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.slice(start, end) || placeholder
    const next = `${content.slice(0, start)}${before}${selected}${after}${content.slice(end)}`
    setContent(next)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
    })
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
    if (!allowedTypes.has(file.type)) {
      setNotice('仅支持 PNG、JPEG、WebP 或 GIF 图片。')
      event.target.value = ''
      return
    }
    if (file.size > 1_500_000) {
      setNotice('图片超过 1.5 MB；为避免浏览器本地存储溢出，请先压缩。')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      insertMarkdown('\n\n![图片说明](', ')\n\n', String(reader.result))
      setNotice('图片已插入正文。')
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  function buildPost() {
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      setNotice('请填写标题、简介与正文。')
      return null
    }
    if (cover.trim() && !safeImageUrl(cover.trim())) {
      setNotice('封面图片必须使用 HTTPS 地址。')
      return null
    }

    if (!draftSlugRef.current) draftSlugRef.current = createSlug(title)

    const post: Post = {
      id: draftIdRef.current,
      slug: draftSlugRef.current,
      title: title.trim(),
      excerpt: excerpt.trim(),
      date,
      readTime: Math.max(1, Math.ceil(content.length / 500)),
      tags: tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean),
      cover: cover.trim() || undefined,
      content,
    }

    return post
  }

  function handleSave() {
    const post = buildPost()
    if (!post) return

    try {
      savePost(post)
      setNotice('已保存。正在打开文章…')
      window.setTimeout(() => navigate(`/post/${post.slug}`), 450)
    } catch {
      setNotice('保存失败：浏览器本地空间可能不足，请移除大图后重试。')
    }
  }

  async function handleGitHubPublish() {
    const post = buildPost()
    if (!post) return

    setPublishing(true)
    setCommitUrl('')
    setNotice('正在提交到 GitHub…')

    try {
      savePost(post)
      saveGitHubConfig(githubConfig)
      const result = await publishPostsToGitHub({
        config: githubConfig,
        token: githubToken,
        posts: getPosts(),
        title: post.title,
      })
      setCommitUrl(result.commitUrl ?? '')
      setNotice('已提交到 GitHub。Pages 通常会在稍后完成重新部署。')
    } catch (error) {
      if (error instanceof GitHubPublishError && error.status === 401) {
        setNotice('发布失败：令牌无效或已经过期。')
      } else if (error instanceof GitHubPublishError && error.status === 403) {
        setNotice('发布失败：令牌缺少该仓库的 Contents 写入权限。')
      } else if (error instanceof GitHubPublishError && error.status === 404) {
        setNotice('发布失败：找不到仓库或分支，请检查配置和令牌授权范围。')
      } else {
        setNotice(`发布失败：${error instanceof Error ? error.message : '未知错误'}`)
      }
    } finally {
      setPublishing(false)
    }
  }

  return (
    <main className="editor-page">
      <header className="editor-heading">
        <div>
          <p className="eyebrow dark">MARKDOWN WORKBENCH</p>
          <h1>{existing ? '继续这篇记录' : '写一篇新记录'}</h1>
        </div>
        <button className="save-button" type="button" onClick={handleSave}>
          <Check size={17} /> 保存到本机
        </button>
      </header>

      <section className="editor-metadata" aria-label="文章信息">
        <label className="title-field">
          <span>标题</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="给这篇文章一个准确的名字" />
        </label>
        <label>
          <span>一句简介</span>
          <textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} rows={2} placeholder="它讨论了什么，为什么值得读？" />
        </label>
        <div className="metadata-row">
          <label><span>日期</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
          <label><span>标签（逗号分隔）</span><input value={tags} onChange={(event) => setTags(event.target.value)} /></label>
          <label><span>封面图片 URL</span><input value={cover} onChange={(event) => setCover(event.target.value)} placeholder="https://…" /></label>
        </div>
      </section>

      <section className={githubOpen ? 'github-publish is-open' : 'github-publish'} aria-labelledby="github-publish-title">
        <header>
          <div className="github-publish-title">
            <GitBranch size={19} />
            <div>
              <h2 id="github-publish-title">发布到 GitHub</h2>
              <p>提交 {githubPostsPath}，由 GitHub Pages 自动重新部署。</p>
            </div>
          </div>
          <button
            className="github-toggle"
            type="button"
            aria-expanded={githubOpen}
            onClick={() => setGithubOpen((value) => !value)}
          >
            {githubOpen ? '收起配置' : '配置发布'} <ChevronDown size={15} />
          </button>
        </header>

        {githubOpen && (
          <div className="github-config">
            <div className="github-fields">
              <label>
                <span>仓库所有者</span>
                <input
                  value={githubConfig.owner}
                  onChange={(event) => setGithubConfig((config) => ({ ...config, owner: event.target.value.trim() }))}
                  placeholder="your-github-name"
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
              <label>
                <span>仓库名称</span>
                <input
                  value={githubConfig.repo}
                  onChange={(event) => setGithubConfig((config) => ({ ...config, repo: event.target.value.trim() }))}
                  placeholder="my-blog"
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
              <label>
                <span>发布分支</span>
                <input
                  value={githubConfig.branch}
                  onChange={(event) => setGithubConfig((config) => ({ ...config, branch: event.target.value.trim() }))}
                  placeholder="main"
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
              <label className="token-field">
                <span>Fine-grained token</span>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(event) => setGithubToken(event.target.value)}
                  placeholder="github_pat_…"
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
            </div>

            <div className="github-security-note">
              <ShieldCheck size={17} />
              <p>
                令牌仅保存在当前页面内存，刷新即清除。请创建只授权此仓库、仅含 <strong>Contents: write</strong> 的令牌。
                <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">创建令牌 ↗</a>
              </p>
            </div>

            <div className="github-actions">
              <code>{githubPostsPath}</code>
              {commitUrl && <a href={commitUrl} target="_blank" rel="noreferrer">查看提交 ↗</a>}
              <button type="button" disabled={publishing} onClick={handleGitHubPublish}>
                {publishing ? <LoaderCircle className="spin" size={16} /> : <CloudUpload size={16} />}
                {publishing ? '正在发布' : '提交并发布'}
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="editor-toolbar" aria-label="Markdown 工具栏">
        <ToolButton label="二级标题" icon={<Heading2 size={16} />} onClick={() => insertMarkdown('\n## ', '\n', '小标题')} />
        <ToolButton label="粗体" icon={<Bold size={16} />} onClick={() => insertMarkdown('**', '**', '重点文字')} />
        <ToolButton label="链接" icon={<Link2 size={16} />} onClick={() => insertMarkdown('[', '](https://)', '链接文字')} />
        <ToolButton label="代码块" icon={<Code2 size={16} />} onClick={() => insertMarkdown('\n```ts\n', '\n```\n', 'const value = true')}/>
        <ToolButton label="行内代码" icon={<Braces size={16} />} onClick={() => insertMarkdown('`', '`', 'code')} />
        <ToolButton label="公式" icon={<Sigma size={16} />} onClick={() => insertMarkdown('\n$$\n', '\n$$\n', 'E = mc^2')} />
        <ToolButton label="插入图片" icon={<ImagePlus size={16} />} onClick={() => imageInputRef.current?.click()} />
        <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={handleImage} />
        <span className="syntax-hint">支持 GFM · KaTeX · 代码高亮</span>
      </div>

      {notice && <p className="editor-notice" role="status">{notice}</p>}

      <section className="editor-workspace">
        <div className="editor-pane">
          <div className="pane-label"><span>01</span> MARKDOWN</div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            spellCheck={false}
            aria-label="Markdown 正文"
          />
        </div>
        <div className="preview-pane">
          <div className="pane-label"><span>02</span> PREVIEW</div>
          <div className="preview-scroll">
            <h1 className="preview-title">{title || '文章标题'}</h1>
            <MarkdownBody content={content} />
          </div>
        </div>
      </section>
    </main>
  )
}
