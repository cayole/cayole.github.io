type DatedPost = { date: string; slug: string }

export function byNewest(a: DatedPost, b: DatedPost) {
  // Same-day notes need an explicit tie-breaker; their series order is in the slug.
  return new Date(b.date).getTime() - new Date(a.date).getTime()
    || b.slug.localeCompare(a.slug, 'en', { numeric: true })
}
