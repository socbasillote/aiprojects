import { createSlice } from '@reduxjs/toolkit'

const token = localStorage.getItem('editor_token')
const user = JSON.parse(localStorage.getItem('editor_user') || 'null')

const authSlice = createSlice({
  name: 'auth',
  initialState: { token, user, status: token ? 'checking' : 'signedOut', error: null },
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.status = 'authenticated'
      state.error = null
      localStorage.setItem('editor_token', action.payload.token)
      localStorage.setItem('editor_user', JSON.stringify(action.payload.user))
    },
    authChecking: (state) => { state.status = 'checking'; state.error = null },
    authFailed: (state, action) => { state.status = 'signedOut'; state.error = action.payload || null },
    logout: (state) => {
      state.token = null
      state.user = null
      state.status = 'signedOut'
      state.error = null
      localStorage.removeItem('editor_token')
      localStorage.removeItem('editor_user')
    },
  },
})

export const { setCredentials, authChecking, authFailed, logout } = authSlice.actions
export default authSlice.reducer
