import { useEffect, useState } from 'react'
import { fetchPosts } from '../api/posts.js'
import HealthStatus from '../components/HealthStatus.jsx'
import PostCard from '../components/PostCard.jsx'
import { Empty, ErrorMessage, Loading } from '../components/Status.jsx'
import { useCurrentUser } from '../hooks/useCurrentUser.js'

export default function PostListPage() {
  const { currentUserId } = useCurrentUser()
  const [posts, setPosts] = useState(null) // null = まだ読み込んでいない
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  // 操作ユーザーが変わったら読み込み直す（ユーザーごとに表示が変わる機能を足すときに効いてくる）
  useEffect(() => {
    let ignore = false // 古いリクエストの結果で上書きしないための目印
    fetchPosts()
      .then((data) => {
        if (!ignore) setPosts(data)
      })
      .catch((err) => {
        if (!ignore) setError(err)
      })
    return () => {
      ignore = true
    }
  }, [currentUserId, reloadKey])

  // 1件分だけ書き換える（いいねボタンから呼ばれる）
  const updatePost = (id, patch) => {
    setPosts((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  const retry = () => {
    setError(null)
    setPosts(null)
    setReloadKey((k) => k + 1)
  }

  return (
    <main className="container">
      <HealthStatus />
      <div className="page-head">
        <h1>
          アイデア一覧
          {posts && <span className="count">{posts.length}件</span>}
        </h1>
      </div>

      {error && <ErrorMessage error={error} onRetry={retry} />}
      {!error && posts === null && <Loading />}
      {!error && posts?.length === 0 && <Empty>まだ投稿がありません。最初のアイデアを投稿してみましょう。</Empty>}
      {!error && posts?.map((post) => <PostCard key={post.id} post={post} onChange={(patch) => updatePost(post.id, patch)} />)}
    </main>
  )
}
