import { ArrowLeft, Clock3, PenLine } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MarkdownBody } from '../components/MarkdownBody'
import { formatPostDate, getPost, refreshPostsFromRemote } from '../lib/posts'
import { safeImageUrl } from '../lib/urls'
import type { Post } from '../types'

export function PostPage() {
  const { slug = '' } = useParams()
  const [post, setPost] = useState<Post | undefined>(() => getPost(slug))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setPost(getPost(slug))
    setLoading(true)

    void refreshPostsFromRemote().then(() => {
      if (!active) return
      setPost(getPost(slug))
      setLoading(false)
    })

    return () => { active = false }
  }, [slug])

  useEffect(() => {
    document.title = post ? `${post.title} / CAYOLE` : '文章 / CAYOLE'
    return () => { document.title = 'CAYOLE / NOTES' }
  }, [post])

  if (!post && loading) {
    return <div className="route-loading">LOADING NOTE…</div>
  }

  if (!post) {
    return (
      <main className="not-found">
        <p className="eyebrow dark">404 / NOTE NOT FOUND</p>
        <h1>这篇记录不在这里。</h1>
        <Link to="/"><ArrowLeft size={16} /> 返回首页</Link>
      </main>
    )
  }

  const coverUrl = safeImageUrl(post.cover)

  return (
    <main className="post-page">
      <article>
        <header className="post-hero">
          <Link className="back-link" to="/"><ArrowLeft size={16} /> 返回日期线</Link>
          <div className="post-hero-meta">
            <span>{formatPostDate(post.date)}</span>
            <span><Clock3 size={14} /> {post.readTime} 分钟阅读</span>
          </div>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div className="post-hero-bottom">
            <div>{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <Link to={`/editor?id=${post.id}`}><PenLine size={15} /> 编辑此文</Link>
          </div>
        </header>

        {coverUrl && (
          <figure className="post-cover">
            <img src={coverUrl} alt="" />
            <figcaption>IMAGE / CAYOLE NOTES</figcaption>
          </figure>
        )}

        <div className="post-content-wrap">
          <aside className="reading-rail" aria-label="文章信息">
            <span>READING</span>
            <strong>{String(post.readTime).padStart(2, '0')} MIN</strong>
          </aside>
          <MarkdownBody content={post.content} />
        </div>

        <footer className="post-end">
          <span>END OF NOTE</span>
          <Link to="/">回到所有文章 <ArrowLeft size={15} /></Link>
        </footer>
      </article>
    </main>
  )
}
