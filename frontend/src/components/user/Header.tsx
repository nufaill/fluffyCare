"use client"

import { LogIn, UserPlus, Menu, X } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import logo from "@/assets/user/logo.png"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import  DefaultAvatar  from "@/assets/user/default-avatar.jpeg"

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { userDatas: user } = useSelector((state: RootState) => state.user)

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Book Now", path: "/book-now" },
    { name: "Gallery", path: "/gallery" },
    { name: "About", path: "/about" },
    { name: "Join us", path: "/join-us" },
  ]

  // Component for user profile image with fallback
  const UserProfileImage = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) => {
    const [imageError, setImageError] = useState(false)

    const sizeClasses = {
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-12 h-12",
    }

    if (user?.profileImage && !imageError) {
      return (
        <img
          src={user.profileImage || "/placeholder.svg"}
          alt="profile"
          className={`${sizeClasses[size]} rounded-full object-cover border group-hover:border-gray-400 transition-colors ${className}`}
          onError={() => setImageError(true)}
        />
      )
    }

    return (
  <img
    src={DefaultAvatar}
    alt="default avatar"
    className={`${sizeClasses[size]} rounded-full object-cover border group-hover:border-gray-400 transition-colors ${className}`}
  />
)

  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-2 -ml-6 md:-ml-10 lg:-ml-25 w-16 h-10">
            <img
              src={logo || "/placeholder.svg?height=44&width=57"}
              alt="logo"
              className="max-w-57 max-h-44 object-contain"
            />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map(({ name, path }) => (
              <Link
                key={name}
                to={path}
                className="text-black px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 border-2 border-transparent hover:border-black"
              >
                {name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-black focus:outline-none">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Login/Signup or User Info - Desktop */}
          <div className="hidden md:flex items-center space-x-3 -mr-25">
            {user ? (
              <Link
                to="/profile"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-md group cursor-pointer"
              >
                <UserProfileImage size="sm" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold group-hover:text-gray-700 transition-colors">
                    {user.fullName}
                  </span>
                </div>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <button className="group relative overflow-hidden px-4 py-2 text-sm font-medium text-black border-2 border-black rounded-lg transition-all duration-300 hover:bg-black hover:text-white hover:shadow-lg hover:scale-105">
                    <span className="absolute inset-0 bg-black transform translate-x-full transition-transform duration-300 group-hover:translate-x-0"></span>
                    <span className="relative flex items-center space-x-2">
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </span>
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="group relative overflow-hidden px-4 py-2 text-sm font-medium text-white bg-black border-2 border-black rounded-lg transition-all duration-300 hover:bg-transparent hover:text-black hover:shadow-lg hover:scale-105">
                    <span className="absolute inset-0 bg-white transform -translate-x-full transition-transform duration-300 group-hover:translate-x-0"></span>
                    <span className="relative flex items-center space-x-2">
                      <UserPlus className="w-4 h-4" />
                      <span>Sign Up</span>
                    </span>
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Slide Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white text-black shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
      >
        <div className="p-5 space-y-4">
          {/* Close Icon */}
          <div className="flex justify-end">
            <button
              onClick={() => setMenuOpen(false)}
              className="text-3xl font-bold text-black hover:text-gray-700 transition duration-200"
              aria-label="Close menu"
            >
              &times;
            </button>
          </div>

          {/* Navigation Links */}
          {navItems.map(({ name, path }) => (
            <Link
              key={name}
              to={path}
              className="block text-black text-base font-medium border-b border-gray-300 py-2 transition-all hover:border-black"
              onClick={() => setMenuOpen(false)}
            >
              {name}
            </Link>
          ))}

          {/* Mobile Login/Signup or User Info */}
          <div className="mt-6 space-y-3">
            {user ? (
              <Link
                to="/profile"
                className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 cursor-pointer"
                onClick={() => setMenuOpen(false)}
              >
                <UserProfileImage size="lg" />
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-semibold">{user.fullName}</span>
                  <span className="text-xs text-gray-400 mt-1">View Profile</span>
                </div>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-black border-2 border-black rounded-lg transition-all duration-300 hover:bg-black hover:text-white">
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-black border-2 border-black rounded-lg transition-all duration-300 hover:bg-white hover:text-black">
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
