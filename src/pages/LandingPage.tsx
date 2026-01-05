import { Link } from 'react-router-dom';
import { Instagram, Youtube } from 'lucide-react';
import LandingImage from '../assets/LandingImage.jpg'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-purple-600">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-12">
              <Link to="/" className="text-3xl font-bold text-white">
                Groovia
              </Link>
              <nav className="hidden md:flex space-x-8">
                <Link to="/login" className="text-gray-300 hover:text-white transition">
                  Workshops
                </Link>
                <Link to="/login" className="text-gray-300 hover:text-white transition">
                  Competitions
                </Link>
                <Link to="/login" className="text-gray-300 hover:text-white transition">
                  Dancers
                </Link>
                {/* <Link to="/contact"  */}
                <h2 className="text-gray-300 hover:text-white transition">
                  Contact
                </h2>
                {/* </Link> */}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-white hover:text-purple-300 transition px-4 py-2"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-transparent border-2 border-white text-white px-6 py-2 rounded-full hover:bg-white hover:text-purple-900 transition"
              >
                Signup
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-light mb-6 tracking-wider">
            MOVE LOUDER. SHINE BRIGHTER.
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            A boutique studio for creators and beginners alike. Build technique,
            perform with confidence, and find your groove.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-full hover:from-pink-600 hover:to-purple-600 transition font-medium"
            >
              Explore Workshops
            </Link>
            <Link
              to="/signup"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full hover:bg-white hover:text-purple-900 transition font-medium"
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg overflow-hidden h-96">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <img src={LandingImage} alt="Landing Image" />
                  {/* <div className="text-6xl mb-4">💃🕺</div>
                  <p className="text-gray-300">Dance Image Placeholder</p> */}
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-lg p-8">
              <h1 className="text-pink-400 text-2xl mb-4">
                For dancers, instructors, organizers and clients
              </h1>
              <h1 className="text-4xl md:text-6xl font-light mb-6">
                Learn, compete and book unforgettable dance experiences
              </h1>
              <p className="text-gray-300 mb-4">
                <span className="text-pink-400 font-bold ">Groovia</span> is the all-in-one platform for workshops, competitions and program bookings.
              </p>
              <p className="text-gray-300">
                Discover events, manage registrations and get paid—effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Connect Learn Perform Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-4">
            <span className="text-pink-400">Connect.</span>{' '}
            <span className="text-purple-400">Learn.</span>{' '}
            <span className="text-pink-400">Perform.</span>
          </h2>
          <p className="text-gray-300 text-lg mb-16">
            Your comprehensive platform for everything dance – from learning new skills to showcasing your talent
          </p>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Workshops Card */}
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-purple-600">
              <div className="h-64 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-gray-300">Workshop Image</p>
                </div>
              </div>
              <div className="p-6 text-left">
                <h3 className="text-2xl font-semibold mb-3 text-pink-400">Workshops</h3>
                <p className="text-gray-300 mb-6">
                  Level up your skills with expert-led sessions covering various dance styles and techniques.
                </p>
                <Link
                  to="/login"
                  className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition inline-block"
                >
                  Explore Workshops
                </Link>
              </div>
            </div>

            {/* Competitions Card */}
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-purple-600">
              <div className="h-64 bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏆</div>
                  <p className="text-gray-300">Competition Image</p>
                </div>
              </div>
              <div className="p-6 text-left">
                <h3 className="text-2xl font-semibold mb-3 text-pink-400">Competitions</h3>
                <p className="text-gray-300 mb-6">
                  Showcase your talent and compete with dancers from around the world in exciting competitions.
                </p>
                <Link
                  to="/login"
                  className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition inline-block"
                >
                  View Competitions
                </Link>
              </div>
            </div>

            {/* Hire Dancers Card */}
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-purple-600">
              <div className="h-64 bg-gradient-to-br from-blue-800 to-purple-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">✨</div>
                  <p className="text-gray-300">Performance Image</p>
                </div>
              </div>
              <div className="p-6 text-left">
                <h3 className="text-2xl font-semibold mb-3 text-pink-400">Hire Dancers</h3>
                <p className="text-gray-300 mb-6">
                  Find exceptional talent for your productions, events, or creative projects.
                </p>
                <Link
                  to="/login"
                  className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition inline-block"
                >
                  Find Talent
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light mb-8">
            Ready to take the next step in your dance journey?
          </h2>
          <Link
            to="/signup"
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-10 py-4 rounded-md hover:from-pink-600 hover:to-purple-600 transition font-medium text-lg inline-block"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-600 to-pink-600 py-8 px-6 mt-16">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div>
              <h3 className="font-semibold mb-4">Contact Us</h3>
              <p className="text-sm text-gray-100">Monday - Friday: 8am - 9pm PST</p>
              <p className="text-sm text-gray-100">9870 S Winchester St</p>
              <p className="text-sm text-gray-100">Englewood, CO 80110</p>
            </div>

            {/* About Links */}
            <div>
              <h3 className="font-semibold mb-4">About Us</h3>
              <ul className="space-y-2">
                <li>
                  {/* <Link to="/about"  */}
                  <h2 className="text-sm text-gray-100 hover:text-white transition">
                    Our Story
                  </h2>
                  {/* </Link> */}
                </li>
                <li>
                  {/* <Link to="/careers"  */}
                  <h2 className="text-sm text-gray-100 hover:text-white transition">
                    Careers
                  </h2>
                  {/* </Link> */}
                </li>
                <li>
                  {/* <Link to="/blog"  */}
                  <h2 className="text-sm text-gray-100 hover:text-white transition">
                    Groovia Blog
                  </h2>
                  {/* </Link> */}
                </li>
              </ul>
            </div>

            {/* Logo and Social */}
            <div className="flex flex-col items-start md:items-end">
              <h2 className="text-4xl font-bold mb-4">Groovia</h2>
              <div className="flex space-x-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-300 transition"
                >
                  <Instagram size={24} />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-300 transition"
                >
                  <Youtube size={24} />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-purple-400 text-center">
            <p className="text-sm text-gray-100">
              ©{new Date().getFullYear()} Groovia. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;