import { ArrowLeft, Clock3 } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MarkdownBody } from '../components/MarkdownBody'
import { formatPostDate, getPost } from '../lib/posts'
import { safeImageUrl } from '../lib/urls'

export function PostPage() {
  const { slug = '' } = useParams()
  const post = getPost(slug)

  useEffect(() => {
    document.title = post ? `${post.title} / CAYOLE` : '文章未找到 / CAYOLE'
    return () => { document.title = 'CAYOLE / NOTES' }
  }, [post])

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
