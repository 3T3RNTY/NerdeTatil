import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CreatePostPage } from './pages/CreatePostPage'
import { DetailPage } from './pages/DetailPage'
import { HomePage } from './pages/HomePage'
import { ProfilePage } from './pages/ProfilePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/detay/:id" element={<DetailPage />} />
        <Route path="/profil" element={<ProfilePage />} />
        <Route path="/yeni-paylasim" element={<CreatePostPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
