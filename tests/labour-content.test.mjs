import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../',import.meta.url))
const folder = root + 'src/content/posts/macroeconomics/'
const files = readdirSync(folder).filter(name=>name.endsWith('.md'))
const slugs = new Set(files.map(name=>name.slice(0,-3)))
const newNames = ['macroeconomics-05-labour-market.md','macroeconomics-06-inflation-expectations.md','macroeconomics-07-medium-run.md']

test('all new articles have metadata, local images and resolvable story links', () => {
  let images=0
  for (const name of newNames) {
    const source=readFileSync(folder+name,'utf8')
    for (const key of ['title','excerpt','date','readTime','tags']) assert.match(source,new RegExp(`^${key}: .+`,'m'))
    assert.match(source,/^date: 2026-10-25$/m)
    for (const [,path] of source.matchAll(/!\[[^\]]*\]\((\/images\/[^)]+)\)/g)) {
      assert.ok(existsSync(root+'public'+path),`Missing image ${path}`)
      const svg=readFileSync(root+'public'+path,'utf8')
      assert.match(svg,/<title[ >]/);assert.match(svg,/<desc[ >]/)
      assert.doesNotMatch(svg,/<script|https?:\/\/(?!www.w3.org)/)
      images++
    }
    for (const [,slug] of source.matchAll(/\]\(#\/post\/([^)]+)\)/g)) assert.ok(slugs.has(slug),`Missing post ${slug}`)
    assert.doesNotMatch(source,/TODO|FIXME|待补充|此处插入/)
  }
  assert.equal(images,7)
})

test('six new fences are explicitly registered and used once', () => {
  const renderer=readFileSync(root+'src/components/MarkdownBody.tsx','utf8')
  const all=newNames.map(name=>readFileSync(folder+name,'utf8')).join('\n')
  for (const fence of ['labour-count','wage-price','expectations-lab','price-level','medium-run','deflation-lab']) {
    assert.ok(renderer.includes(`'${fence}':`),`Unregistered fence ${fence}`)
    assert.equal(all.split('```'+fence+'\n').length-1,1,`Fence use ${fence}`)
  }
})
