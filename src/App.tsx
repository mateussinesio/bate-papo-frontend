import { BrowserRouter, Route, Routes } from 'react-router'
import './App.css'
import Login from './components/Login'
import Chat from './components/Chat'
import { AuthProvider } from './context/AuthContext'
import Register from './components/Register'

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          <Route path='/' element={<Login />} />
            <Route path='/login' element={<Login />} />
            <Route path='/chat' element={<Chat />} />
            <Route path='/register' element={<Register />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App
