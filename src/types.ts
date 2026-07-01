export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: number
  tags: string[]
  cover?: string
  content: string
}
