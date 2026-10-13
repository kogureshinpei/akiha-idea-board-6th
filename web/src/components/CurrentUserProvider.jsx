import { useEffect, useState } from 'react'
import { fetchUsers } from '../api/users.js'
import { getStoredUserId, storeUserId } from '../lib/userStorage.js'
import { CurrentUserContext } from '../hooks/useCurrentUser.js'

// 「操作ユーザー」をアプリ全体で共有する。どのコンポーネントからでも useCurrentUser() で使える
export default function CurrentUserProvider({ children }) {
  const [users, setUsers] = useState([])
  const [currentUserId, setCurrentUserId] = useState(() => Number(getStoredUserId()) || null)

  useEffect(() => {
    fetchUsers()
      .then((list) => {
        setUsers(list)
        // 未選択、または存在しない ID が保存されていたら先頭のユーザーにする
        setCurrentUserId((id) => {
          const next = list.some((u) => u.id === id) ? id : list[0]?.id ?? null
          if (next) storeUserId(next)
          return next
        })
      })
      .catch(() => setUsers([]))
  }, [])

  const selectUser = (id) => {
    storeUserId(id)
    setCurrentUserId(id)
  }

  const currentUser = users.find((u) => u.id === currentUserId) ?? null

  return (
    <CurrentUserContext.Provider value={{ users, currentUser, currentUserId, selectUser }}>
      {children}
    </CurrentUserContext.Provider>
  )
}
