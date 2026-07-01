import { Menu, PenLine, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Cayole Notes 首页">
        <span className="brand-mark">C</span>
        <span className="brand-copy">
          CAYOLE
          <small>NOTES / 2026</small>
        </span>
      </Link>

      <button
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((value) => !value)}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <nav className={menuOpen ? 'site-nav is-open' : 'site-nav'} aria-label="主导航">
        <NavLink to="/" onClick={() => setMenuOpen(false)}>首页</NavLink>
        <Link to="/#archive" onClick={() => setMenuOpen(false)}>文章</Link>
        <NavLink className="write-link" to="/editor" onClick={() => setMenuOpen(false)}>
          <PenLine size={15} /> 写一篇
        </NavLink>
      </nav>
    </header>
  )
}
