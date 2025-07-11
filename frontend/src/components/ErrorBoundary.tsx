import { Component, type ReactNode, type ErrorInfo } from 'react';
// import logo from "@/assets/user/logo.png"
interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
            {/* <img 
              src={logo} 
              alt="FluffyCare Logo" 
              className="w-32 h-32 mx-auto mb-4"
            /> */}
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Oops! Something Went Wrong at FluffyCare
            </h2>
            <p className="text-black mb-6 animate-pulse duration-1000">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <p className="text-black mb-4">
              Don't worry, our team is already on it! At FluffyCare, your pet's happiness is our priority, and we're committed to getting things back on track.
            </p>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-red-600 mb-2">What You Can Do:</h3>
              <ul className="text-black list-disc list-inside">
                <li>Refresh the page to try again.</li>
                <li>Contact our support team at <a href="mailto:support@fluffycare.com" className="text-red-600 hover:underline">fluffycare.team@gmail.com</a>.</li>
                <li>Call us at <a href="tel:+91 7902536866" className="text-red-600 hover:underline">+91 7902536866</a> for immediate assistance.</li>
              </ul>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Our Commitment to You:</h3>
              <p className="text-black">
                At FluffyCare, we strive for 100% customer and pet satisfaction. If this error has caused any inconvenience, please reach out, and we'll make it right with a special treat for your furry friend!
              </p>
            </div>
            <a
              href="/"
              className="inline-block bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition"
            >
              Back to Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;