import { Bold, Braces, Check, Code2, Heading2, ImagePlus, Link2, Sigma } from 'lucide-react'
import { type ChangeEvent, type ReactNode, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MarkdownBody } from '../components/MarkdownBody'
import { createSlug, getPosts, savePost } from '../lib/posts'
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

  function handleSave() {
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      setNotice('请填写标题、简介与正文。')
      return
    }

    const post: Post = {
      id: existing?.id ?? crypto.randomUUID(),
      slug: existing?.slug ?? createSlug(title),
      title: title.trim(),
      excerpt: excerpt.trim(),
      date,
      readTime: Math.max(1, Math.ceil(content.length / 500)),
      tags: tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean),
      cover: cover.trim() || undefined,
      content,
    }

    try {
      savePost(post)
      setNotice('已保存。正在打开文章…')
      window.setTimeout(() => navigate(`/post/${post.slug}`), 450)
    } catch {
      setNotice('保存失败：浏览器本地空间可能不足，请移除大图后重试。')
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
          <Check size={17} /> 保存并发布
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

      <div className="editor-toolbar" aria-label="Markdown 工具栏">
        <ToolButton label="二级标题" icon={<Heading2 size={16} />} onClick={() => insertMarkdown('\n## ', '\n', '小标题')} />
        <ToolButton label="粗体" icon={<Bold size={16} />} onClick={() => insertMarkdown('**', '**', '重点文字')} />
        <ToolButton label="链接" icon={<Link2 size={16} />} onClick={() => insertMarkdown('[', '](https://)', '链接文字')} />
        <ToolButton label="代码块" icon={<Code2 size={16} />} onClick={() => insertMarkdown('\n```ts\n', '\n```\n', 'const value = true')}/>
        <ToolButton label="行内代码" icon={<Braces size={16} />} onClick={() => insertMarkdown('`', '`', 'code')} />
        <ToolButton label="公式" icon={<Sigma size={16} />} onClick={() => insertMarkdown('\n$$\n', '\n$$\n', 'E = mc^2')} />
        <ToolButton label="插入图片" icon={<ImagePlus size={16} />} onClick={() => imageInputRef.current?.click()} />
        <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleImage} />
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
