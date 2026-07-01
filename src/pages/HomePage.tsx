import { ArrowDown, ArrowUpRight, ChevronDown, Clock3 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { formatPostDate, getPosts } from '../lib/posts'
import type { Post } from '../types'

const fallbackHitokoto = '日子沿着一条线，慢慢变成文章。'

type HitokotoResponse = {
  hitokoto?: unknown
}

export function HomePage() {
  const posts: Post[] = getPosts()
  const [openPost, setOpenPost] = useState<string | null>(null)
  const [hitokoto, setHitokoto] = useState(fallbackHitokoto)
  const location = useLocation()

  useEffect(() => {
    if (location.hash === '#archive') {
      window.setTimeout(() => document.querySelector('#archive')?.scrollIntoView({ behavior: 'smooth' }), 0)
    }
  }, [location.hash])

  useEffect(() => {
    const controller = new AbortController()

    async function loadHitokoto() {
      try {
        const response = await fetch(
          'https://v1.hitokoto.cn/?c=d&c=i&c=k&encode=json&max_length=30',
          { signal: controller.signal },
        )

        if (!response.ok) return

        const data = await response.json() as HitokotoResponse
        if (typeof data.hitokoto === 'string' && data.hitokoto.trim()) {
          setHitokoto(data.hitokoto.trim())
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    void loadHitokoto()
    return () => controller.abort()
  }, [])

  return (
    <main>
      <section className="home-hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">PERSONAL FIELD NOTES · ZHOUSHAN</p>
          <h1 id="hero-title">
            技术
            <em>改变生活。</em>
          </h1>
          <p className="hero-intro">
            我是 Cayole。这里存放开发手记、设计观察，以及一些无法被归档的日常片段。
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#archive">
              向下阅读 <ArrowDown size={17} />
            </a>
          </div>
        </div>

        <div className="hero-image" role="img" aria-label="光影中的安静书桌">
          <div className="image-index">
            <span>FIELD NOTE</span>
            <strong>027</strong>
          </div>
          <p>WRITE / BUILD / NOTICE</p>
        </div>

        <div className="hero-rail" aria-hidden="true">
          <span>SCROLL TO TRACE THE DAYS</span>
        </div>
      </section>

      <section className="archive" id="archive" aria-labelledby="archive-title">
        <div className="archive-intro">
          <p className="eyebrow dark">RECENT NOTES · 近期记录</p>
          <h2 id="archive-title">{hitokoto}</h2>
          <p>点击标题下方的箭头展开简介，或直接进入全文。</p>
          <span className="post-count">{String(posts.length).padStart(2, '0')} 篇记录</span>
        </div>

        <div className="timeline">
          {posts.map((post, index) => {
            const isOpen = openPost === post.id
            return (
              <article className={isOpen ? 'timeline-item is-open' : 'timeline-item'} key={post.id}>
                <span className="timeline-dot" aria-hidden="true" />
                <div className="post-date">
                  <span>{formatPostDate(post.date)}</span>
                  <small>NO. {String(posts.length - index).padStart(2, '0')}</small>
                </div>
                <div className="post-summary">
                  <div className="post-tags" aria-label="文章标签">
                    {post.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                  <Link className="post-title-link" to={`/post/${post.slug}`}>
                    <h3>{post.title}</h3>
                    <ArrowUpRight size={22} />
                  </Link>
                  <button
                    className="summary-toggle"
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenPost(isOpen ? null : post.id)}
                  >
                    {isOpen ? '收起简介' : '展开简介'}
                    <ChevronDown size={16} />
                  </button>
                  {isOpen && (
                    <div className="summary-content">
                      <p>{post.excerpt}</p>
                      <span><Clock3 size={14} /> {post.readTime} 分钟阅读</span>
                      <Link to={`/post/${post.slug}`}>阅读全文 <ArrowUpRight size={15} /></Link>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <footer className="site-footer">
        <p>Tech otakus save the world</p>
        <div><span>© 2026 CAYOLE</span><a href="#top">回到顶部 ↑</a></div>
      </footer>
    </main>
  )
}
