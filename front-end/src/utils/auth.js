import { useEffect, useState } from 'react'

const STORAGE_KEY = 'auth_user'

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setCurrentUser(JSON.parse(stored))
    }
  }, [])

  const login = (user) => {
    setCurrentUser(user)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    currentUser,
    login,
    logout,
  }
}
