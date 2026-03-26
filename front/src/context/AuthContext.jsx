import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('dermiq_token')
    const savedUser = localStorage.getItem('dermiq_user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('dermiq_token')
        localStorage.removeItem('dermiq_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const data = await authAPI.login(email, password)
    localStorage.setItem('dermiq_token', data.token)
    localStorage.setItem('dermiq_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const register = async (payload) => {
    const data = await authAPI.register(payload)
    localStorage.setItem('dermiq_token', data.token)
    localStorage.setItem('dermiq_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('dermiq_token')
    localStorage.removeItem('dermiq_user')
    setUser(null)
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    localStorage.setItem('dermiq_user', JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
