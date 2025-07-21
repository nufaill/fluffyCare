"use client"

import { Component, type ReactNode, type ErrorInfo } from "react"
import { Bug, RefreshCw, Mail, Phone, Home, AlertTriangle } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white border-2 border-gray-200 p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center">
            {/* Bug Icon with Animation */}
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                <Bug className="w-10 h-10 text-white animate-bounce" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-black mb-4">Oops! Something Went Wrong</h2>

            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-red-600 font-medium animate-pulse">
                {this.state.error?.message || "An unexpected error occurred."}
              </p>
            </div>

            <p className="text-gray-800 mb-6 leading-relaxed">
              Don't worry, our team is already on it! At <span className="font-semibold text-black">FluffyCare</span>,
              your pet's happiness is our priority, and we're committed to getting things back on track.
            </p>

            <div className="mb-6 text-left">
              <h3 className="text-lg font-semibold text-black mb-3 flex items-center">
                <RefreshCw className="w-5 h-5 mr-2 text-gray-600" />
                What You Can Do:
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                  Refresh the page to try again
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                  Contact our support team at{" "}
                  <a
                    href="mailto:fluffycare.team@gmail.com"
                    className="text-black hover:text-gray-600 font-medium ml-1 inline-flex items-center underline"
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    fluffycare.team@gmail.com
                  </a>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                  Call us at{" "}
                  <a
                    href="tel:+917902536866"
                    className="text-black hover:text-gray-600 font-medium ml-1 inline-flex items-center underline"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    +91 7902536866
                  </a>
                </li>
              </ul>
            </div>

            <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-black mb-2">Our Commitment to You:</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                At FluffyCare, we strive for 100% customer and pet satisfaction. If this error has caused any
                inconvenience, please reach out, and we'll make it right with a special treat for your furry friend! 🐾
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>

              <a
                href="/"
                className="inline-flex items-center bg-white text-black border-2 border-black px-6 py-3 rounded-full hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
