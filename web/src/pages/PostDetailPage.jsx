import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { fetchPost } from '../api/posts.js'
import BackLink from '../components/BackLink.jsx'
import { ErrorMessage, Loading } from '../components/Status.jsx'
import { useCurrentUser } from '../hooks/useCurrentUser.js'
import { formatDate } from '../lib/formatDate.js'

export default function PostDetailPage() {
  const { id } = useParams()
  const { currentUserId } = useCurrentUser()
  const [post, setPost] = useState(null)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let ignore = false // 古いリクエストの結果で上書きしないための目印
    fetchPost(id)
      .then((data) => {
        if (!ignore) setPost(data)
      })
      .catch((err) => {
        if (!ignore) setError(err)
      })
    return () => {
      ignore = true
    }
  }, [id, currentUserId, reloadKey])

  const retry = () => {
    setError(null)
    setPost(null)
    setReloadKey((k) => k + 1)
  }

  return (
    <main className="container container--narrow">
      <BackLink />
      {error?.status === 404 && <ErrorMessage error={{ message: '投稿が見つかりませんでした。' }} />}
      {error && error.status !== 404 && <ErrorMessage error={error} onRetry={retry} />}
      {!error && post === null && <Loading />}
      {!error && post && (
        <article className="card card--detail">
          <h1 className="card__title">{post.title}</h1>
          <span className="meta">{post.user.name}・{formatDate(post.created_at)}</span>
          <p className="card__body">{post.body}</p>
        </article>
      )}
    </main>
  )
}
