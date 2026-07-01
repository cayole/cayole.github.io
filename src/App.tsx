import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { SiteHeader } from './components/SiteHeader'
import { HomePage } from './pages/HomePage'

const EditorPage = lazy(() => import('./pages/EditorPage').then((module) => ({ default: module.EditorPage })))
const PostPage = lazy(() => import('./pages/PostPage').then((module) => ({ default: module.PostPage })))

export default function App() {
  const location = useLocation()
  const isEditor = location.pathname === '/editor'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div id="top" className={isEditor ? 'app editor-mode' : 'app'}>
      <SiteHeader />
      <Suspense fallback={<div className="route-loading">LOADING NOTE…</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:slug" element={<PostPage />} />
          <Route path="/editor" element={<EditorPage />} />
        </Routes>
      </Suspense>
    </div>
  )
}
