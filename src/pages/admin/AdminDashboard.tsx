import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import Sidebar from "../../components/admin/Sidebar"


const AdminDashboard: React.FC = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    return (
        <div className="flex h-screen bg-[#0B1120]">
            <Sidebar />
            <div className="flex-1 ml-64 overflow-y-auto">
                <main className="min-h-screen p-8">
                    <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
                    {/* Dashboard content will go here */}
                    {/* <div className="text-center py-20 bg-[#1a2332] rounded-lg border border-gray-800">
                        <p className="text-gray-400">Dashboard components will be built here.</p>
                    </div> */}
                </main>
            </div>
        </div>
    )
}
export default AdminDashboard;