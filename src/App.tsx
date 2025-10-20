import { BrowserRouter as Router } from 'react-router-dom'
import './App.css'
import UserRoutes from './routers/User.routes'
import { Toaster } from 'react-hot-toast'
import AdminRoutes from './routers/Admin.routes'

function App() {
  return (
    <Router>
      <>
        <Toaster position="top-right" reverseOrder={false}/>
        <UserRoutes/>
        <AdminRoutes/>
      </>
    </Router>
  )
}

export default App
