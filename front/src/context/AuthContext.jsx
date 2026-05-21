import { createContext, useContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

// Единые ключи для localStorage
const TOKEN_KEY = 'dermiq_token'
const USER_KEY = 'dermiq_user'
const TOKEN_TYPE_KEY = 'dermiq_token_type'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Инициализируем из localStorage при загрузке
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    const savedUser = localStorage.getItem(USER_KEY)

    if (savedToken) {
      setToken(savedToken)
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (e) {
          console.error('Ошибка парсинга пользователя:', e)
        }
      }
      // Опционально: загрузить свежие данные пользователя с сервера
      restoreUser(savedToken)
    }
    setLoading(false)
  }, [])

  const restoreUser = async (accessToken) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || '/api'}/auth/me`,
        {
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setUser(data)
        localStorage.setItem(USER_KEY, JSON.stringify(data))
      } else if (response.status === 401) {
        // Токен истек или невалиден
        logout()
      }
    } catch (err) {
      console.error('Ошибка восстановления пользователя:', err)
    }
  }

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error('Email и пароль обязательны')
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      console.log('Статус ответа:', response.status)

      // Обработка ошибок
      if (!response.ok) {
        let errorMsg = 'Ошибка при входе'

        try {
          const errorData = await response.json()
          errorMsg = errorData.detail || errorData.message || errorMsg
          console.error('Детали ошибки сервера:', errorData)
        } catch (e) {
          console.error('Не удалось спарсить ошибку:', e)
        }

        if (response.status === 401) {
          throw new Error('Email или пароль неверны')
        } else if (response.status === 404) {
          throw new Error('Пользователь не найден. Пожалуйста, зарегистрируйтесь')
        } else if (response.status === 500) {
          throw new Error('Ошибка сервера. Попробуйте позже')
        } else {
          throw new Error(errorMsg)
        }
      }

      const data = await response.json()

      // Валидация ответа
      if (!data.access_token) {
        throw new Error('Сервер не вернул токен доступа')
      }

      if (!data.user) {
        throw new Error('Сервер не вернул данные пользователя')
      }

      // Сохраняем токен и пользователя в localStorage с единым ключом
      localStorage.setItem(TOKEN_KEY, data.access_token)
      localStorage.setItem(TOKEN_TYPE_KEY, data.token_type || 'bearer')
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))

      // Обновляем состояние
      setToken(data.access_token)
      setUser(data.user)

      console.log('✅ Вход выполнен успешно:', data.user.name)

      return data
    } catch (err) {
      console.error('❌ Ошибка логина:', err.message)
      throw err
    }
  }

  const register = async (payload) => {
    if (!payload.name || !payload.email || !payload.password) {
      throw new Error('Заполните все поля')
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          password: payload.password,
        }),
      })

      if (!response.ok) {
        let errorMsg = 'Ошибка регистрации'
        try {
          const errorData = await response.json()
          errorMsg = errorData.detail || errorData.message || errorMsg
        } catch (e) {
          // не удалось спарсить ошибку
        }
        throw new Error(errorMsg)
      }

      const data = await response.json()

      // Автоматический вход после регистрации
      if (data.access_token && data.user) {
        localStorage.setItem(TOKEN_KEY, data.access_token)
        localStorage.setItem(TOKEN_TYPE_KEY, data.token_type || 'bearer')
        localStorage.setItem(USER_KEY, JSON.stringify(data.user))

        setToken(data.access_token)
        setUser(data.user)
      }

      return data
    } catch (err) {
      console.error('Ошибка регистрации:', err)
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_TYPE_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem(USER_KEY, JSON.stringify(updated))
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth должен быть использован внутри AuthProvider')
  }
  return context
}