import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHomeActive = location.pathname === '/' && location.hash !== '#archive'
  const isArticlesActive = location.hash === '#archive' || location.pathname.startsWith('/post/')

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
        <Link
          aria-current={isHomeActive ? 'page' : undefined}
          className={isHomeActive ? 'active' : undefined}
          to="/"
          onClick={() => setMenuOpen(false)}
        >首页</Link>
        <Link
          aria-current={isArticlesActive ? 'page' : undefined}
          className={isArticlesActive ? 'active' : undefined}
          to="/#archive"
          onClick={() => setMenuOpen(false)}
        >文章</Link>
        <NavLink to="/tools" onClick={() => setMenuOpen(false)}>工具</NavLink>
      </nav>
    </header>
  )
}
