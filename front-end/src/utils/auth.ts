import { useEffect, useState } from 'react'

export type User = {
  id: number
  userName: string
  firstName: string
  secondName: string
  userType: string
  profilePicturePath?: string | null
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/auth/me', {
          credentials: 'include',
        })
        if (response.ok) {
          const user: User = await response.json()
          setCurrentUser(user)
        } else {
          setCurrentUser(null)
        }
      } catch (error) {
        setCurrentUser(null)
      } finally {
        setChecking(false)
      }
    }

    load()
  }, [])

  const login = (user: User) => {
    setCurrentUser(user)
  }

  const logout = async () => {
    try {
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setCurrentUser(null)
    }
  }

  const updateUser = (user: User) => {
    setCurrentUser(user)
  }

  return {
    currentUser,
    checking,
    login,
    logout,
    updateUser,
  }
}
