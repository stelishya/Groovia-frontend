import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ErrorPage from './pages/shared/ErrorPage'
import './App.css'
import UserRoutes from './routers/User.routes'
import { Toaster } from 'react-hot-toast'
import AdminRoutes from './routers/Admin.routes'
import DancerRoutes from './routers/Dancer.routes'
import ClientRoutes from './routers/Client.routes'
import { VideoCallProvider } from './context/VideoCallContext'

function App() {
  return (
    <Router>
      <>
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              border: '2px solid #9333ea',
              background: '#6b21a8',
              color: "white",
              padding: '16px',
              borderRadius: '8px',
            },
            success: {
              style: {
                border: '2px solid #9333ea',
                background: '#6b21a8',
                color: "white"
              },
            },
            error: {
              style: {
                border: '2px solid #c23e06ff',
                background: '#6b21a8',
                color: "white"
              },
            },
          }}
        />
        <VideoCallProvider>
          <Routes>
            {UserRoutes()}
            {AdminRoutes()}
            {DancerRoutes()}
            {ClientRoutes()}
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </VideoCallProvider>
      </>
    </Router>
  )
}

export default App
