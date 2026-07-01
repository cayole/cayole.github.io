import { ArrowUpRight, Plus } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

type ToolEntry = {
  path: string
  title: string
  description: string
  label: string
}

// 新增工具页后，在这里加入入口即可显示在工具栏中。
const tools: ToolEntry[] = []

export function ToolsPage() {
  useEffect(() => {
    document.title = '工具 / CAYOLE'
    return () => { document.title = 'CAYOLE / NOTES' }
  }, [])

  return (
    <main className="tools-page">
      <section className="tools-hero" aria-labelledby="tools-title">
        <p className="eyebrow">UTILITY SHELF · 工具栏</p>
        <h1 id="tools-title">把常用的小工具，<br />留在手边。</h1>
        <p>这里预留给计算、转换、生成与整理类的小工具。每个工具会拥有独立页面。</p>
      </section>

      <section className="tools-index" aria-labelledby="tools-index-title">
        <header className="tools-index-header">
          <div>
            <p className="eyebrow dark">TOOL INDEX · 工具索引</p>
            <h2 id="tools-index-title">工具栏</h2>
          </div>
          <span>{String(tools.length).padStart(2, '0')} ITEMS</span>
        </header>

        {tools.length > 0 ? (
          <div className="tool-list">
            {tools.map((tool, index) => (
              <Link className="tool-entry" to={tool.path} key={tool.path}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <small>{tool.label}</small>
                  <h3>{tool.title}</h3>
                  <p>{tool.description}</p>
                </div>
                <ArrowUpRight aria-hidden="true" size={22} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="tools-empty" role="status">
            <Plus aria-hidden="true" size={28} />
            <div>
              <h3>工具位已预留</h3>
              <p>需要第一个工具时，再把它放到这里。</p>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
