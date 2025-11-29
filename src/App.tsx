import { BrowserRouter as Router } from 'react-router-dom'
import './App.css'
import UserRoutes from './routers/User.routes'
import { Toaster } from 'react-hot-toast'
import AdminRoutes from './routers/Admin.routes'
import DancerRoutes from './routers/Dancer.routes'
import ClientRoutes from './routers/Client.routes'

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
              background:'#6b21a8',
                color:"white",
              padding: '16px',
              borderRadius: '8px',
            },
            success: {
              style: {
                border: '2px solid #9333ea',
                background:'#6b21a8',
                color:"white"
              },
            },
            error: {
              style: {
                border: '2px solid #c23e06ff',
                background:'#6b21a8',
                color:"white"
              },
            },
          }}
        />
        <UserRoutes/>
        <AdminRoutes/>
        <DancerRoutes/>
        <ClientRoutes/>
      </>
    </Router>
  )
}

export default App
