import { Route, Routes } from 'react-router'
import Header from './components/Header.jsx'
import PostListPage from './pages/PostListPage.jsx'
import PostNewPage from './pages/PostNewPage.jsx'
import PostDetailPage from './pages/PostDetailPage.jsx'

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<PostListPage />} />
        <Route path="/posts/new" element={<PostNewPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="*" element={<main className="container"><p className="status">ページが見つかりません。</p></main>} />
      </Routes>
    </>
  )
}
