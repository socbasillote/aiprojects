import { createSlice } from '@reduxjs/toolkit'

const user = JSON.parse(localStorage.getItem('editor_user') || 'null')

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: null, user, status: 'checking', error: null },
  reducers: {
    setCredentials: (state, action) => {
      state.token = null
      state.user = action.payload.user
      state.status = 'authenticated'
      state.error = null
      localStorage.setItem('editor_user', JSON.stringify(action.payload.user))
    },
    authChecking: (state) => { state.status = 'checking'; state.error = null },
    updateAiCredits: (state, action) => {
      if (state.user) {
        state.user.aiCredits = action.payload
        localStorage.setItem('editor_user', JSON.stringify(state.user))
      }
    },
    authFailed: (state, action) => {
      state.token = null
      state.user = null
      state.status = 'signedOut'
      state.error = action.payload || null
      localStorage.removeItem('editor_user')
    },
    logout: (state) => {
      state.token = null
      state.user = null
      state.status = 'signedOut'
      state.error = null
      localStorage.removeItem('editor_user')
    },
  },
})

export const { setCredentials, authChecking, updateAiCredits, authFailed, logout } = authSlice.actions
export default authSlice.reducer
