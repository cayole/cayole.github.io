import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync,readdirSync,existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { byNewest } from '../src/lib/post-order.ts'

const root=fileURLToPath(new URL('../',import.meta.url))
const folder=root+'src/content/posts/macroeconomics/'
const allNames=readdirSync(folder).filter(n=>n.endsWith('.md'))
const names=allNames.filter(n=>/^macroeconomics-(08|09|10|11)-/.test(n))
const slugs=new Set(allNames.map(n=>n.slice(0,-3)))

test('four growth articles use existing frontmatter, local accessible diagrams and valid links',()=>{
  assert.equal(names.length,4)
  const images=new Set()
  for(const name of names){
    const text=readFileSync(folder+name,'utf8')
    for(const key of ['title','excerpt','date','readTime','tags'])assert.match(text,new RegExp(`^${key}: .+`,'m'))
    assert.match(text,/^readTime: \d+$/m);assert.doesNotMatch(text,/^tags: \[/m)
    assert.match(text,/^date: 2026-10-25$/m)
    for(const [,path] of text.matchAll(/!\[[^\]]*\]\((\/images\/[^)]+)\)/g)){
      assert.ok(existsSync(root+'public'+path),path);images.add(path)
      assert.ok(text.includes(`](${path})](${path})`),`Image should open separately: ${path}`)
      const svg=readFileSync(root+'public'+path,'utf8')
      assert.match(svg,/<title[ >]/);assert.match(svg,/<desc[ >]/)
      assert.doesNotMatch(svg,/<script|https?:\/\/(?!www.w3.org)/)
    }
    for(const [,slug] of text.matchAll(/\]\(#\/post\/([^)]+)\)/g))assert.ok(slugs.has(slug),slug)
    assert.doesNotMatch(text,/TODO|FIXME|待补充|此处插入/)
  }
  assert.equal(images.size,9)
})

test('eight growth fences explicitly registered, independently used and documented',()=>{
  const all=names.map(n=>readFileSync(folder+n,'utf8')).join('\n')
  const renderer=readFileSync(root+'src/components/MarkdownBody.tsx','utf8')
  const standards=readFileSync(root+'ARTICLE_STANDARDS.md','utf8')
  for(const fence of ['compound-growth','purchasing-power','capital-accumulation','golden-rule','balanced-growth','growth-accounting','productivity-jobs','productivity-wages']) {
    assert.ok(renderer.includes(`'${fence}':`),fence)
    assert.equal(all.split('```'+fence+'\n').length-1,1,fence)
    assert.ok(standards.includes('`'+fence+'`'),fence)
  }
})

test('all eleven real article slugs retain descending chronological story numbering',()=>{
  const posts=allNames.map(n=>({slug:n.slice(0,-3),date:readFileSync(folder+n,'utf8').match(/^date: (.+)$/m)[1]})).sort(byNewest)
  assert.equal(posts.length,11)
  assert.deepEqual(posts.map(p=>Number(p.slug.split('-')[1])),[11,10,9,8,7,6,5,4,3,2,1])
})
