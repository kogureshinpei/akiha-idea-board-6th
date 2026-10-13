import { Link } from 'react-router'
import { useCurrentUser } from '../hooks/useCurrentUser.js'

export default function Header() {
  const { users, currentUserId, selectUser } = useCurrentUser()

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-title">秋ハアイデアボード</Link>
        <div className="site-header__actions">
          <label className="user-switch">
            操作ユーザー
            <select
              value={currentUserId ?? ''}
              onChange={(e) => selectUser(Number(e.target.value))}
              disabled={users.length === 0}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </label>
          <Link to="/posts/new" className="btn btn--primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            投稿する
          </Link>
        </div>
      </div>
    </header>
  )
}
