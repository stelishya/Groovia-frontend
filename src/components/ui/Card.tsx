import { User as UserIcon } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

interface Dancer {
 _id: string;
 username: string;
 profileImage?: string;
 danceStyles?: string[];
 likes?: number;
 bio?: string;
 preferredLocation?: string;
 experienceYears?: number;
 createdAt: string;
}

const DancerCard = ({ dancer }: { dancer: Dancer }) => {
    console.log("DancerCard in Card.tsx : ",dancer)
    const navigate = useNavigate();
    const primaryStyle = dancer.danceStyles?.[0] || 'Dancer';

  return (
    // <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-4 flex flex-col items-center">
    //   <img
    //     src={dancer.profileImage || "/default-avatar.png"}
    //     alt={dancer.name}
    //     className="w-full h-56 object-cover rounded-xl mb-4"
    //   />
    //   <h3 className="text-lg font-semibold text-gray-800">{dancer.name}</h3>
    //   <p className="text-sm text-gray-500">{dancer.category}</p>
    //   <p className="text-sm text-gray-500">{dancer.city}</p>
    //   <p className="text-sm text-gray-600 mt-1">
    //     {dancer.experience} years experience
    //   </p>
    //   <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
    //     View Profile
    //   </button>
    // </div>
     <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-1 rounded-3xl transform hover:-translate-y-2 transition-all duration-300 shadow-xl hover:shadow-2xl h-full">
 <div className="bg-gray-800 rounded-3xl p-4 h-full flex flex-col text-white">
 <img
 src={dancer.profileImage || `https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=300&fit=crop`}
 alt={dancer.username}
 className="w-full h-56 object-cover rounded-2xl mb-4"
 />
 <div className="flex items-center mb-3">
 <UserIcon className="text-purple-400 mr-2" size={18} />
 <h3 className="text-xl font-bold">{dancer.username}</h3>
 </div>
 <div className="flex items-center justify-between mb-3">
 <span className="bg-purple-600 text-xs font-semibold px-3 py-1 rounded-full">
 {primaryStyle}
 </span>
 <span className="text-sm font-medium">{dancer.likes || 0} likes</span>
 </div>
 <p className="text-purple-200 text-sm mb-3 line-clamp-2 flex-grow">
 {dancer.bio || `A passionate ${primaryStyle} with a love for performance.`}
 </p>
 <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
 View Profile
 </button>
 </div>
 </div>
  );
};

export default DancerCard;
