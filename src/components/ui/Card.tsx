import {
  User as UserIcon, Heart, Briefcase, Link as LinkIcon,
  Instagram, Youtube, Facebook
} from "lucide-react";
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
  updatedAt:string;
  portfolioLinks?: string[];
}

interface DancerCardProps {
  dancer: Dancer;
  onSendRequest: (dancer: Dancer) => void;
}

const DancerCard = ({ dancer, onSendRequest }: DancerCardProps) => {
  console.log("DancerCard in Card.tsx : ", dancer)
  const navigate = useNavigate();
  const primaryStyle = dancer.danceStyles?.[0] || 'Dancer';

  return (
    <div className="bg-gradient-to-br from-purple-600 via-blue-500 to-pink-500 p-1 rounded-3xl transform hover:-translate-y-2 transition-all duration-300 shadow-xl hover:shadow-2xl h-full">
      <div className="bg-purple-800 rounded-3xl p-4 h-full flex flex-col text-white">

        <img
          src={dancer.profileImage || `https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=300&fit=crop`}
          alt={dancer.username}
          className="w-full h-56 object-cover rounded-2xl mb-4"
        />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
          <UserIcon className="text-purple-400 mr-2" size={18} />
          <h3 className="text-xl font-bold">{dancer.username}</h3>
          </div>
          <div className="flex items-center space-x-2">
          <Heart className="text-pink-400" size={18} />
          <span className="text-sm font-medium">{dancer.likes || 0} likes</span>
          </div>
        </div>
        {/* Dance styles */}
        <div className="flex items-center justify-between mb-3">
          <span className="bg-purple-600 text-xs font-semibold px-3 py-1 rounded-full">
            {primaryStyle}
          </span>
        </div>

        {/* Bio */}
        <p className="text-purple-200 text-sm mb-3 line-clamp-2 flex-grow">
          {dancer.bio || `A passionate ${primaryStyle} dancer with a love for performance.`}
        </p>

        {/* Experience */}
        <div className="flex items-center justify-between mb-3">
        <div>
        <label className="text-purple-200 text-sm">Experience</label>
        <p>{dancer.experienceYears} year</p>
        </div>

        {/* Social Links */}
          <div className="flex items-center space-x-3">
            {dancer?.portfolioLinks && dancer.portfolioLinks.length > 0 ? (
              dancer.portfolioLinks.map((link, index) => {
                const getSocialIcon = (url: string) => {
                  try {
                    const hostname = new URL(url).hostname.toLowerCase();
                    if (hostname.includes('instagram.com')) return <Instagram className="text-white hover:text-pink-500 transition-colors" />;
                    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return <Youtube className="text-white hover:text-red-500 transition-colors" />;
                    // if (hostname.includes('linkedin.com')) return <Linkedin className="text-white hover:text-blue-500 transition-colors" />;
                    // if (hostname.includes('twitter.com') || hostname.includes('x.com')) return <Twitter className="text-white hover:text-sky-400 transition-colors" />;
                    if (hostname.includes('facebook.com')) return <Facebook className="text-white hover:text-blue-600 transition-colors" />;
                  } catch (e) { /* Invalid URL */ }
                  return <LinkIcon className="text-white hover:text-purple-300 transition-colors" />;
                };
                return (
                  <a key={index} href={link} target="_blank" rel="noopener noreferrer">
                    {getSocialIcon(link)}
                  </a>
                );
              })
            ) : (
              <p className="text-white text-lg">No links provided</p>
            )}
          </div>
        </div>
          {/* Buttons*/}
          <div className="flex justify-end space-x-3 mt-auto">
          <button className=" w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
            View Profile
          </button>
            <button
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
              onClick={() => onSendRequest(dancer)}
            >
              Send Request
            </button>
          </div>

      </div>
    </div>
  );
};

export default DancerCard;


