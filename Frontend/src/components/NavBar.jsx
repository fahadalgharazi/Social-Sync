import React, { useState } from 'react';
import { Heart, Home, FileText, LogIn, UserPlus, User, Menu, X, CalendarSearch} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from "react-router-dom";

export default function Navbar({ variant = 'dashboard' }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Landing page navbar (centered logo)
  if (variant === 'landing') {
    return (
      <>
        <nav className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100 relative z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-20 relative">
              {/* Logo - Left positioned on mobile, centered on desktop */}
              <div className="absolute left-4 md:left-0 md:relative flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <span className="hidden md:block text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  SocialSync
                </span>
              </div>

              {/* Center Navigation - Hidden on mobile */}
              <div className="hidden md:flex items-center space-x-8 mx-auto">
                <Button variant="ghost" className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/70 rounded-xl px-6">
                  <Home className="w-4 h-4 mr-2" />
                  HomeEvents
                </Button>
                <Button variant="ghost" className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/70 rounded-xl px-6">
                  <FileText className="w-4 h-4 mr-2" />
                  Questionnaire
                </Button>
              </div>

              {/* Right Actions */}
              <div className="absolute right-4 md:right-0 md:relative flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-3">
                  <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50 rounded-lg">
                    <LogIn className="w-4 h-4 mr-1" />
                    Login
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg">
                    <UserPlus className="w-4 h-4 mr-1" />
                    Sign Up
                  </Button>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                  <User className="w-5 h-5 text-white" />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="md:hidden ml-2"
                  onClick={toggleMobileMenu}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/70 rounded-xl">
                <Home className="w-4 h-4 mr-3" />
                HomeEvents
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/70 rounded-xl">
                <FileText className="w-4 h-4 mr-3" />
                Questionnaire
              </Button>
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <Button variant="outline" className="w-full border-gray-200 hover:bg-gray-50 rounded-lg">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Dashboard navbar (glassmorphism bar) - for future use
  if (variant === 'dashboard') {
    return (
      <nav className="bg-white/80 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={"/"}>
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Heart className="w-9 h-9 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                SocialSync
              </span>
            </div>
            </Link>

            {/* Center Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to={"/events"}>
                <Button variant="ghost" className="text-base text-gray-700 hover:text-indigo-700 hover:bg-indigo-50/50 [&>svg]:!size-7">
                  <CalendarSearch className="w-6 h-6 mr-2" />
                  Events
                </Button>
              </Link>
              <Link to={"/questionnaire"}>
                <Button variant="ghost" className="text-base text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 [&>svg]:!size-7">
                  <FileText className="w-6 h-6 mr-2" />
                  Questionnaire
                </Button>
              </Link>
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>
    );
  }

  return null;
}





// import { Link } from "react-router-dom";

// export default function Navbar() {
//   return (
//     <nav style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #eee" }}>
//       <Link to="/">Home</Link>
//       <Link to="/events">Events</Link>
//       <Link to="/questionnaire">Questionnaire</Link>
//       <Link to="/login">Login</Link>
//       <Link to="/signup">Sign Up</Link>
//     </nav>
//   );
// }
