import { defaultPosts } from '../data/defaultPosts'
import type { Post } from '../types'

const STORAGE_KEY = 'cayole-notes.posts.v1'

function byNewest(a: Post, b: Post) {
  return new Date(b.date).getTime() - new Date(a.date).getTime()
}

export function getPosts(): Post[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return [...defaultPosts].sort(byNewest)
    return (JSON.parse(saved) as Post[]).sort(byNewest)
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

  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts.sort(byNewest)))
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
