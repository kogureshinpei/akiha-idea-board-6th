// API を呼ぶときは必ずこの apiFetch を通す。
// - URL の先頭（http://localhost:8000）は .env の VITE_API_URL で決める
// - 操作ユーザーを X-User-Id ヘッダーで送る
// - エラーは ApiError にそろえて投げる（status と、バリデーションエラーの errors を持つ）

import { getStoredUserId } from '../lib/userStorage.js'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.status = status
    this.data = data
    this.errors = data?.errors ?? {}
  }
}

export async function apiFetch(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  const userId = getStoredUserId()
  if (userId) headers['X-User-Id'] = userId
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let res
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('API に接続できませんでした。API（docker compose up -d）が起動しているか確認してください。', 0)
  }

  if (res.status === 204) return null

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(data?.message ?? `エラーが発生しました（${res.status}）`, res.status, data)
  }
  return data
}
