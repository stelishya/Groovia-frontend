import { House, MessageSquare, Calendar, Briefcase, Trophy, CreditCard, User as UserIcon, LogOut, Settings, Search, Bell } from "lucide-react"
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../redux/slices/user.slice";
import { type RootState } from "../../redux/store";

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = ()=>{
        console.log("handleLogout")
        dispatch(logoutUser())
        navigate('/login')
    }
    const navItems = [
        { icon: <House />, name: 'Home', active: true },
        { icon: <MessageSquare />, name: 'Messages' },
        { icon: <Calendar />, name: 'Bookings' },
        { icon: <Briefcase />, name: 'Workshops' },
        { icon: <Trophy />, name: 'Competitions' },
        { icon: <CreditCard />, name: 'Payments' },
    ];

    const bottomItems = [
        { icon: <UserIcon />, name: 'Profile', action:()=> navigate('/profile')},
        { icon: <LogOut />, name: 'Log Out', action: handleLogout},
        { icon: <Settings />, name: 'Settings' },
    ];

    return (
        <aside className="w-64 bg-purple-900 text-white flex flex-col p-4">
            <div className="text-3xl font-bold mb-10 ml-4">Groovia</div>
            <nav className="flex-grow">
                <ul>
                    {navItems.map(item => (
                        <li key={item.name} className={`flex items-center p-3 my-1 rounded-lg cursor-pointer ${item.active ? 'bg-purple-700' : 'hover:bg-purple-800'}`}>
                            <span className="mr-4 text-xl">{item.icon}</span>
                            <span>{item.name}</span>
                        </li>
                    ))}
                </ul>
            </nav>
            <nav>
                <ul>
                    {bottomItems.map(item => (
                        <li key={item.name} onClick={item.action} className="flex items-center p-3 my-1 rounded-lg cursor-pointer hover:bg-purple-800">
                            <span className="mr-4 text-xl">{item.icon}</span>
                            <span>{item.name}</span>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

const Header = () => (
    <header className="flex justify-end items-center p-4">
        <div className="relative w-80 mr-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
            <input type="text" placeholder="Search Workshops, Competitions..." className="w-full bg-purple-700 text-white placeholder-purple-300 rounded-lg py-2 pl-10 focus:outline-none" />
        </div>
        <Bell className="text-white text-2xl mr-6 cursor-pointer" />
        <img src="https://i.pravatar.cc/40?img=32" alt="User" className="w-10 h-10 rounded-full cursor-pointer" />
    </header>
);

const Dashboard = ({userData}:{userData:any}) => (
    <main className="flex-grow p-8 bg-gray-900 text-white overflow-y-auto">
        <Header />
        <div className="mt-8">
            <h1 className="text-5xl font-light leading-tight">BOOK, TRACK, ENJOY – <br /> ALL IN ONE PLATFORM</h1>
            <p className="text-gray-400 mt-4 max-w-lg">Your ultimate destination for dance education, competitive showcases, and community engagement.</p>
            <button className="mt-8 px-10 py-4 font-bold text-white rounded-full bg-gradient-to-r from-pink-500 to-orange-400 hover:opacity-90">Explore Oppurtunities</button>
        </div>

        <div className="mt-12 p-6 bg-purple-800/50 rounded-xl flex items-center justify-between">
            <div className="flex items-center">
                <img src="https://i.pravatar.cc/80?img=32" alt="Elena Petrova" className="w-16 h-16 rounded-full border-2 border-purple-400" />
                <div className="ml-4">
                    <div className="flex items-center">
                        <h3 className="text-xl font-bold">{userData?.username?.charAt(0).toUpperCase() + userData?.username?.slice(1)}</h3>
                        <span className="ml-3 text-xs bg-blue-500 rounded-full px-2 py-0.5">{userData?.role?.map((role:string)=>role.charAt(0).toUpperCase() + role.slice(1)).join(', ')}</span>
                    </div>
                    <p className="text-sm text-gray-300">Contemporary & Hip-Hop Dance</p>
                </div>
            </div>
            <div className="flex space-x-12 text-center">
                <div><div className="text-2xl font-bold">24</div><div className="text-sm text-gray-300">Workshops</div></div>
                <div><div className="text-2xl font-bold">156</div><div className="text-sm text-gray-300">Bookings</div></div>
                <div><div className="text-2xl font-bold">4.8</div><div className="text-sm text-gray-300">Reviews</div></div>
                <div><div className="text-2xl font-bold">8</div><div className="text-sm text-gray-300">Competitions</div></div>
            </div>
        </div>
    </main>
);

export default function Home() {
    const {userData} = useSelector((state: RootState)=> state.user)
    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar />
            <Dashboard userData={userData}/>
        </div>
    );
}