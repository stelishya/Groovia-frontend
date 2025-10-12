// // import React from 'react';
// import { FiHome, FiMessageSquare, FiCalendar, FiBriefcase, FiTrophy, FiCreditCard, FiUser, FiLogOut, FiSettings, FiSearch, FiBell } from 'react-icons/fi';

// const Sidebar = () => {
//     const navItems = [
//         { icon: <FiHome />, name: 'Home', active: true },
//         { icon: <FiMessageSquare />, name: 'Messages' },
//         { icon: <FiCalendar />, name: 'Bookings' },
//         { icon: <FiBriefcase />, name: 'Workshops' },
//         { icon: <FiTrophy />, name: 'Competitions' },
//         { icon: <FiCreditCard />, name: 'Payments' },
//     ];

//     const bottomItems = [
//         { icon: <FiUser />, name: 'Profile' },
//         { icon: <FiLogOut />, name: 'Log Out' },
//         { icon: <FiSettings />, name: 'Settings' },
//     ];

//     return (
//         <aside className="w-64 bg-purple-900 text-white flex flex-col p-4">
//             <div className="text-3xl font-bold mb-10 ml-4">Groovia</div>
//             <nav className="flex-grow">
//                 <ul>
//                     {navItems.map(item => (
//                         <li key={item.name} className={`flex items-center p-3 my-1 rounded-lg cursor-pointer ${item.active ? 'bg-purple-700' : 'hover:bg-purple-800'}`}>
//                             <span className="mr-4 text-xl">{item.icon}</span>
//                             <span>{item.name}</span>
//                         </li>
//                     ))}
//                 </ul>
//             </nav>
//             <nav>
//                 <ul>
//                     {bottomItems.map(item => (
//                         <li key={item.name} className="flex items-center p-3 my-1 rounded-lg cursor-pointer hover:bg-purple-800">
//                             <span className="mr-4 text-xl">{item.icon}</span>
//                             <span>{item.name}</span>
//                         </li>
//                     ))}
//                 </ul>
//             </nav>
//         </aside>
//     );
// };

// const Header = () => (
//     <header className="flex justify-end items-center p-4">
//         <div className="relative w-80 mr-6">
//             <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
//             <input type="text" placeholder="Search Workshops, Competitions..." className="w-full bg-purple-700 text-white placeholder-purple-300 rounded-lg py-2 pl-10 focus:outline-none" />
//         </div>
//         <FiBell className="text-white text-2xl mr-6 cursor-pointer" />
//         <img src="https://i.pravatar.cc/40?img=32" alt="User" className="w-10 h-10 rounded-full cursor-pointer" />
//     </header>
// );

// const Dashboard = () => (
//     <main className="flex-grow p-8 bg-gray-900 text-white overflow-y-auto">
//         <Header />
//         <div className="mt-8">
//             <h1 className="text-5xl font-light leading-tight">LEARN, PERFORM, COMPETE,<br />TEACH – ALL IN ONE PLATFORM</h1>
//             <p className="text-gray-400 mt-4 max-w-lg">Your ultimate destination for dance education, competitive showcases, and community engagement.</p>
//             <button className="mt-8 px-10 py-4 font-bold text-white rounded-full bg-gradient-to-r from-pink-500 to-orange-400 hover:opacity-90">Explore Oppurtunities</button>
//         </div>

//         <div className="mt-12 p-6 bg-purple-800/50 rounded-xl flex items-center justify-between">
//             <div className="flex items-center">
//                 <img src="https://i.pravatar.cc/80?img=32" alt="Elena Petrova" className="w-16 h-16 rounded-full border-2 border-purple-400" />
//                 <div className="ml-4">
//                     <div className="flex items-center">
//                         <h3 className="text-xl font-bold">Elena Petrova</h3>
//                         <span className="ml-3 text-xs bg-blue-500 rounded-full px-2 py-0.5">Verified Instructor</span>
//                     </div>
//                     <p className="text-sm text-gray-300">Contemporary & Hip-Hop Dance Instructor</p>
//                 </div>
//             </div>
//             <div className="flex space-x-12 text-center">
//                 <div><div className="text-2xl font-bold">24</div><div className="text-sm text-gray-300">Workshops</div></div>
//                 <div><div className="text-2xl font-bold">156</div><div className="text-sm text-gray-300">Bookings</div></div>
//                 <div><div className="text-2xl font-bold">4.8</div><div className="text-sm text-gray-300">Reviews</div></div>
//                 <div><div className="text-2xl font-bold">8</div><div className="text-sm text-gray-300">Competitions</div></div>
//             </div>
//         </div>

//         <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
//             <div className="bg-purple-800/50 p-6 rounded-xl">
//                 <h4 className="text-xl font-semibold mb-6">Earnings Overview</h4>
//                 <div className="space-y-4 text-gray-300">
//                     <div className="flex justify-between"><span>This Month</span><span className="text-white font-bold">₹ 2,84,000</span></div>
//                     <div className="flex justify-between"><span>Workshops</span><span>₹ 1,9200</span></div>
//                     <div className="flex justify-between"><span>Event Bookings</span><span>₹ 92100</span></div>
//                     <div className="flex justify-between border-t border-purple-700 pt-4 mt-4"><span>Last Month</span><span>₹ 31,220</span></div>
//                 </div>
//                 <button className="mt-6 w-full py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-white">View Detailed Report</button>
//             </div>
//             <div className="bg-purple-800/50 p-6 rounded-xl">
//                 <h4 className="text-xl font-semibold mb-6">Notifications</h4>
//                 <div className="space-y-4">
//                     <div className="bg-purple-700/70 p-4 rounded-lg flex items-start"><FiBriefcase className="mr-3 mt-1 text-purple-300"/><div><p>New registration for Contemporary Flow Basics</p><p className="text-xs text-gray-400">2 hours ago</p></div></div>
//                     <div className="bg-purple-700/70 p-4 rounded-lg flex items-start"><FiCalendar className="mr-3 mt-1 text-purple-300"/><div><p>Booking request from Emily & James</p><p className="text-xs text-gray-400">5 hours ago</p></div></div>
//                     <div className="bg-purple-700/70 p-4 rounded-lg flex items-start"><FiTrophy className="mr-3 mt-1 text-purple-300"/><div><p>Competition registration deadline approaching</p><p className="text-xs text-gray-400">1 day ago</p></div></div>
//                 </div>
//                 <button className="mt-6 w-full py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600">View All Notifications</button>
//             </div>
//         </div>
//     </main>
// );

// export default function Home() {
//     return (
//         <div className="flex h-screen bg-gray-900">
//             <Sidebar />
//             <Dashboard />
//         </div>
//     );
// }