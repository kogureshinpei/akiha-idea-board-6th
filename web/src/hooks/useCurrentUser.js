import { createContext, useContext } from 'react'

export const CurrentUserContext = createContext(null)

// { users, currentUser, currentUserId, selectUser } を返す
export function useCurrentUser() {
  return useContext(CurrentUserContext)
}
