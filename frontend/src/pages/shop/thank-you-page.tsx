"use client"

import type React from "react"
import { useEffect, useState } from "react"

const ThankYouPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [typewriterText, setTypewriterText] = useState("")
  const [showGlitch, setShowGlitch] = useState(false)

  const fullText = "THANK YOU FOR JOINING FLUFFYCARE!"

  useEffect(() => {
    setIsVisible(true)

    // Typewriter effect
    let index = 0
    const typewriterTimer = setInterval(() => {
      if (index < fullText.length) {
        setTypewriterText(fullText.slice(0, index + 1))
        index++
      } else {
        clearInterval(typewriterTimer)
        setShowGlitch(true)
      }
    }, 100)

    // Animate steps with different timings
    const timer1 = setTimeout(() => setCurrentStep(1), 2000)
    const timer2 = setTimeout(() => setCurrentStep(2), 3000)
    const timer3 = setTimeout(() => setCurrentStep(3), 4000)

    return () => {
      clearInterval(typewriterTimer)
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid-background"></div>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-6xl w-full bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left Content Section */}
            <div className="p-8 lg:p-12 flex flex-col justify-center space-y-8 relative">
              {/* Scanning Line Effect */}
              <div className="scan-line"></div>

              {/* Header */}
              <div
                className={`transform transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center rotate-animation">
                    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.1 3.9 21 5 21H11V19H5V3H13V9H21Z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">
                    fluffy<span className="text-gray-400">Care</span>
                  </h1>
                </div>

                <div className="relative">
                  <h2 className={`text-3xl lg:text-5xl font-bold leading-tight font-mono ${showGlitch ? 'glitch-text' : ''}`}>
                    <span className="text-white">{typewriterText}</span>
                    <span className="animate-pulse text-gray-400">|</span>
                  </h2>
                  <div className="text-xl text-gray-400 mt-4 slide-in-left">
                    Welcome to the future of pet care 🚀
                  </div>
                </div>
              </div>

              {/* Status Steps with Morphing Animations */}
              <div className="space-y-6">
                {/* Step 1 */}
                <div
                  className={`flex items-start gap-4 transform transition-all duration-1000 ${currentStep >= 1 ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center morphing-circle">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg mb-2 slide-in-right">
                      Application Under Review
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      Our AI-powered system is analyzing your pet care profile for optimal matching.
                    </p>
                    <div className="mt-2 w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full progress-bar" style={{width: '75%'}}></div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div
                  className={`flex items-start gap-4 transform transition-all duration-1000 delay-300 ${currentStep >= 2 ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center spinning-gear">
                      <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg mb-2 slide-in-right">
                      Processing Timeline: 24 Hours
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      Quality assurance protocols ensure perfect pet-owner compatibility.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse delay-200"></div>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">PROCESSING...</span>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div
                  className={`flex items-start gap-4 transform transition-all duration-1000 delay-500 ${currentStep >= 3 ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center pulsing-notification">
                      <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5S10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg mb-2 slide-in-right">
                      Instant Notification System
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      Real-time alerts delivered directly to your inbox upon approval.
                    </p>
                    <div className="mt-3 text-xs text-green-400 font-mono blink-text">
                      ● NOTIFICATION SYSTEM ACTIVE
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div
                className={`transform transition-all duration-1000 delay-1000 ${currentStep >= 3 ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
              >
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shimmer"></div>
                  <h3 className="font-bold text-xl mb-2 text-white">Next Steps</h3>
                  <p className="mb-4 text-gray-300">Explore our ecosystem while your application processes.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                      Explore Features
                    </button>
                    <button className="border-2 border-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105">
                      Join Community
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image Section */}
            <div className="relative bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-8 border-l border-gray-800">
              <div
                className={`transform transition-all duration-2000 ${isVisible ? "scale-100 rotate-0 opacity-100" : "scale-50 rotate-12 opacity-0"}`}
              >
                <div className="relative">
                  {/* Hexagonal Frame */}
                  <div className="hexagon-frame">
                    <img
                      src="/pets-hero.png"
                      alt="Happy pets in monochrome style"
                      className="w-full max-w-md h-auto object-cover rounded-2xl shadow-2xl filter grayscale contrast-125 brightness-110 hover:grayscale-0 transition-all duration-1000"
                    />
                  </div>

                  {/* Orbiting Elements */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="orbit-container">
                      <div className="orbit-element orbit-1">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <span className="text-black text-sm">🐾</span>
                        </div>
                      </div>
                      <div className="orbit-element orbit-2">
                        <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                          <span className="text-black text-xs">❤️</span>
                        </div>
                      </div>
                      <div className="orbit-element orbit-3">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✨</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Corner Brackets */}
                  <div className="corner-brackets">
                    <div className="corner-bracket top-left"></div>
                    <div className="corner-bracket top-right"></div>
                    <div className="corner-bracket bottom-left"></div>
                    <div className="corner-bracket bottom-right"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThankYouPage
