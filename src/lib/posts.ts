import { defaultPosts } from '../data/defaultPosts'
import type { Post } from '../types'

const STORAGE_KEY = 'cayole-notes.posts.v1'

function byNewest(a: Post, b: Post) {
  return new Date(b.date).getTime() - new Date(a.date).getTime()
}

function isPost(value: unknown): value is Post {
  if (!value || typeof value !== 'object') return false
  const post = value as Partial<Post>
  return (
    typeof post.id === 'string' && post.id.length > 0 && post.id.length <= 200 &&
    typeof post.slug === 'string' && post.slug.length > 0 && post.slug.length <= 300 &&
    typeof post.title === 'string' && post.title.length <= 300 &&
    typeof post.excerpt === 'string' && post.excerpt.length <= 2000 &&
    typeof post.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(post.date) &&
    typeof post.readTime === 'number' && Number.isFinite(post.readTime) && post.readTime > 0 &&
    Array.isArray(post.tags) && post.tags.every((tag) => typeof tag === 'string' && tag.length <= 50) &&
    (post.cover === undefined || typeof post.cover === 'string') &&
    typeof post.content === 'string'
  )
}

export function parsePosts(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.filter(isPost)
}

function mergePosts(localPosts: Post[], remotePosts: Post[]) {
  const merged = new Map(localPosts.map((post) => [post.id, post]))
  remotePosts.forEach((post) => merged.set(post.id, post))
  return [...merged.values()].sort(byNewest)
}

function storePosts(posts: Post[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts.sort(byNewest)))
}

export function getPosts(): Post[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return [...defaultPosts].sort(byNewest)
    const parsed = parsePosts(JSON.parse(saved))
    return (parsed.length ? parsed : [...defaultPosts]).sort(byNewest)
  } catch {
    return [...defaultPosts].sort(byNewest)
  }
}

export function getPost(slug: string) {
  return getPosts().find((post) => post.slug === slug)
}

export function savePost(post: Post) {
  const posts = getPosts()
  const existingIndex = posts.findIndex((item) => item.id === post.id)

  if (existingIndex >= 0) posts[existingIndex] = post
  else posts.unshift(post)

  storePosts(posts)
}

export async function refreshPostsFromRemote() {
  const localPosts = getPosts()

  try {
    const response = await fetch(new URL('posts.json', document.baseURI), { cache: 'no-store' })
    if (!response.ok) return localPosts

    const remotePosts = parsePosts(await response.json())
    if (!remotePosts.length) return localPosts

    const merged = mergePosts(localPosts, remotePosts)
    storePosts(merged)
    return merged
  } catch {
    return localPosts
  }
}

export function createSlug(title: string) {
  const normalized = title
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-|-$/g, '')

  return `${normalized || 'note'}-${Date.now().toString(36)}`
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
