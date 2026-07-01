import type { Post } from '../types'

const markdownFiles = import.meta.glob('../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function byNewest(a: Post, b: Post) {
  return new Date(b.date).getTime() - new Date(a.date).getTime()
}

function parseFrontmatter(source: string) {
  const normalized = source.replace(/\r\n/g, '\n')
  if (!normalized.startsWith('---\n')) return null

  const closingIndex = normalized.indexOf('\n---\n', 4)
  if (closingIndex < 0) return null

  const metadata = new Map<string, string>()
  normalized.slice(4, closingIndex).split('\n').forEach((line) => {
    const separator = line.indexOf(':')
    if (separator < 1) return
    metadata.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim())
  })

  return {
    metadata,
    content: normalized.slice(closingIndex + 5).trim(),
  }
}

function postFromFile(path: string, source: string): Post | null {
  const parsed = parseFrontmatter(source)
  if (!parsed) return null

  const slug = path.split('/').pop()?.replace(/\.md$/i, '') ?? ''
  const title = parsed.metadata.get('title') ?? ''
  const excerpt = parsed.metadata.get('excerpt') ?? ''
  const date = parsed.metadata.get('date') ?? ''
  const tags = (parsed.metadata.get('tags') ?? '')
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
  const configuredReadTime = Number(parsed.metadata.get('readTime'))

  if (!slug || !title || !excerpt || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !parsed.content) {
    console.warn(`Skipped invalid post: ${path}`)
    return null
  }

  return {
    id: slug,
    slug,
    title,
    excerpt,
    date,
    readTime: Number.isFinite(configuredReadTime) && configuredReadTime > 0
      ? Math.ceil(configuredReadTime)
      : Math.max(1, Math.ceil(parsed.content.length / 500)),
    tags,
    cover: parsed.metadata.get('cover') || undefined,
    content: parsed.content,
  }
}

const posts = Object.entries(markdownFiles)
  .map(([path, source]) => postFromFile(path, source))
  .filter((post): post is Post => Boolean(post))
  .sort(byNewest)

export function getPosts() {
  return posts
}

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug)
}

export function formatPostDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(new Date(`${date}T00:00:00`))
    .replaceAll('/', '.')
}
