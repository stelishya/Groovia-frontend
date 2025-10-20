import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import Sidebar from "../../components/admin/Sidebar"


const AdminDashboard: React.FC = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* <Header /> */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-8">
                    <h1 className="text-2xl font-semibold ml-86 mb-6">Dashboard</h1>
                    {/* Dashboard content will go here */}
                    {/* <div className="text-center py-20 bg-gray-800 rounded-lg">
                        <p>Dashboard components will be built here.</p>
                    </div> */}
                </main>
            </div>
        </div>
    )
}
export default AdminDashboard;