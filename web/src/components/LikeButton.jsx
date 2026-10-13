import { useRef, useState } from 'react'
import { likePost, unlikePost } from '../api/likes.js'

// いいねボタン。post の likes_count / liked_by_me を表示し、変更は onChange で親に伝える
export default function LikeButton({ post, onChange }) {
  const pendingRef = useRef(false) // 通信中かどうか（ref は即座に変わるので、素早い連打でも確実に止められる）
  const [pending, setPending] = useState(false) // 画面表示用
  const [error, setError] = useState('')
  const liked = post.liked_by_me

  const handleClick = async () => {
    if (pendingRef.current) return // 通信中の連打は無視する（二重送信防止）
    pendingRef.current = true

    const before = { liked_by_me: post.liked_by_me, likes_count: post.likes_count }

    // 楽観的更新：サーバーの返事を待たずに画面を先に変える
    onChange({ liked_by_me: !liked, likes_count: post.likes_count + (liked ? -1 : 1) })
    setPending(true)
    setError('')

    try {
      const result = liked ? await unlikePost(post.id) : await likePost(post.id)
      // サーバーの正しい値で上書き（他の人のいいねも反映される）
      onChange({ liked_by_me: result.liked_by_me, likes_count: result.likes_count })
    } catch (err) {
      onChange(before) // 失敗したら元に戻す
      setError(err.message)
    } finally {
      pendingRef.current = false
      setPending(false)
    }
  }

  return (
    <span className="like">
      <button
        type="button"
        className={`like-btn${liked ? ' is-liked' : ''}`}
        aria-pressed={liked}
        aria-busy={pending}
        aria-label={`${liked ? 'いいねを取り消す' : 'いいねする'}（${post.likes_count}件）`}
        onClick={handleClick}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
        {post.likes_count}
      </button>
      {error && <span className="like-error" role="alert">{error}</span>}
    </span>
  )
}
