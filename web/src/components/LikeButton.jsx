import { likePost, unlikePost } from '../api/likes.js'
import { useCurrentUser } from '../hooks/useCurrentUser.js'

// いいねボタン。押すとすぐに画面を更新し、裏で API に保存する
export default function LikeButton({ post, onChange }) {
  const { currentUserId } = useCurrentUser()
  const liked = post.liked_by_me

  const handleClick = async () => {
    if (liked) {
      onChange({ liked_by_me: false, likes_count: post.likes_count - 1, my_like_id: null })
      try {
        await unlikePost(post.my_like_id)
      } catch (err) {
        console.error(err)
      }
    } else {
      onChange({ liked_by_me: true, likes_count: post.likes_count + 1 })
      try {
        const like = await likePost(post.id, currentUserId)
        onChange({ my_like_id: like.id })
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <button
      type="button"
      className={`like-btn${liked ? ' is-liked' : ''}`}
      aria-pressed={liked}
      aria-label={`${liked ? 'いいねを取り消す' : 'いいねする'}（${post.likes_count}件）`}
      onClick={handleClick}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
      {post.likes_count}
    </button>
  )
}
