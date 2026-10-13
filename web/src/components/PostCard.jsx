import { Link } from 'react-router'
import { formatDate } from '../lib/formatDate.js'

export default function PostCard({ post }) {
  return (
    <article className="card">
      <Link to={`/posts/${post.id}`} className="card__title">{post.title}</Link>
      <p className="card__body card__body--clamp">{post.body}</p>
      <div className="card__footer">
        <span className="meta">{post.user.name}・{formatDate(post.created_at)}</span>
      </div>
    </article>
  )
}
