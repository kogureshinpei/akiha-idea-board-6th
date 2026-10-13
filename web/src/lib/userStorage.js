// 操作ユーザーの ID をブラウザ（localStorage）に保存する。ログインの代わり
const KEY = 'akiha.currentUserId'

export function getStoredUserId() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function storeUserId(id) {
  try {
    localStorage.setItem(KEY, String(id))
  } catch {
    // 保存できない環境（プライベートモードなど）では何もしない
  }
}
