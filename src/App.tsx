import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import ErrorPage from './pages/shared/ErrorPage'
import './App.css'
import { UserPublicRoutes, UserPrivateRoutes } from './routers/User.routes'
import { Toaster } from 'react-hot-toast'
import { AdminPublicRoutes, AdminPrivateRoutes } from './routers/Admin.routes'
import DancerRoutes from './routers/Dancer.routes'
import ClientRoutes from './routers/Client.routes'
import { VideoCallProvider, useVideoCall } from './context/VideoCallContext'
import VideoRoom from './components/video/VideoRoom'
import MainLayout from './layouts/MainLayout'
import PageLoader from './components/ui/PageLoader'

const VideoRoomWrapper: React.FC = () => {
  const { isConnected } = useVideoCall();
  return isConnected ? <VideoRoom /> : null;
};

function App() {
  return (
    <Router>
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
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public/Auth routes (No Shell) */}
            {UserPublicRoutes()}
            {AdminPublicRoutes()}

            {/* Private/Dashboard routes (With Shell) */}
            <Route element={<MainLayout />}>
              {UserPrivateRoutes()}
              {DancerRoutes()}
              {ClientRoutes()}
            </Route>

            {/* Admin Private Routes (Separated to avoid layout collision) */}
            {AdminPrivateRoutes()}

            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Suspense>
        <VideoRoomWrapper />
      </VideoCallProvider>
    </Router>
  )
}

export default App;
