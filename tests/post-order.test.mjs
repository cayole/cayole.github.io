import assert from 'node:assert/strict'
import { test } from 'node:test'
import { byNewest } from '../src/lib/post-order.ts'

test('same-day series posts keep their chronological NO. with latest first', () => {
  const posts = Array.from({length:7},(_,i)=>({
    date:i<4?'2026-10-24':'2026-10-25',slug:`macroeconomics-${String(i+1).padStart(2,'0')}-topic`,
  }))
  const sorted=[...posts].sort(byNewest)
  assert.deepEqual(sorted.map(p=>p.slug),[...posts].reverse().map(p=>p.slug))
  sorted.forEach((post,index)=>assert.equal(sorted.length-index,Number(post.slug.split('-')[1])))
})

test('dates take priority and unpadded same-day sequence numbers sort numerically', () => {
  const posts=[
    {date:'2026-10-24',slug:'series-20'},
    {date:'2026-10-25',slug:'series-2'},
    {date:'2026-10-25',slug:'series-10'},
  ]
  assert.deepEqual([...posts].sort(byNewest).map(p=>p.slug),['series-10','series-2','series-20'])
  assert.deepEqual([...posts].reverse().sort(byNewest).map(p=>p.slug),['series-10','series-2','series-20'])
  assert.equal(byNewest(posts[0],posts[0]),0)
})
