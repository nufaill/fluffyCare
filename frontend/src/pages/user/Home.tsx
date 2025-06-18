import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Header from "@/components/user/Header"
import Footer from "@/components/user/Footer"
import { ArrowRight, Phone, Calendar, Clock, Heart, Facebook, Linkedin, Twitter, Sparkles, Shield, Star } from "lucide-react"
import image from '@/assets/user/image.png'
import imagecat1 from '@/assets/user/imagecat1.png'
import imageDog from '@/assets/user/imageDog.png'
import imageGroupofDog from '@/assets/user/imageGroupofDog.png'
import whiteImage from '@/assets/user/whiteImage.png'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-screen filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-300 rounded-full mix-blend-screen filter blur-xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative bottom-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                  <Sparkles className="w-4 h-4 mr-2 text-white" />
                  <span className="text-sm font-medium text-white">Premium Pet Service</span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
                  At FluffyCare,
                  <span className="block bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    we treat your pets like family
                  </span>
                  <span className="block">Partner</span>
                </h1>

                <p className="text-xl text-gray-300 mb-8 max-w-lg leading-relaxed">
                  Our dedicated team understands the unique bond you share with your furry companions,
                  ensuring a seamless and stress-free experience for both you and your pets.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-full text-lg font-semibold group transition-all duration-300 transform hover:scale-105">
                    Get a Quote
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" className="border-2 border-white/30 bg-white/10 px-8 py-4 rounded-full text-lg backdrop-blur-sm">
                    Learn More
                  </Button>
                </div>
              </div>

              <div className="relative">
                <img
                  src={image}
                  alt="Happy pets - cats and dogs"
                  className="w-full h-auto rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Modern wave decoration */}
        <div className="absolute -bottom-14 left-0 right-0">
          <img
            src={whiteImage}
            alt=""
          />
        </div>

      </section>

      {/* Pet Shop Section */}
      <section className="py-8 lg:py-12 bg-white text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-black text-white text-sm">
                <Heart className="w-4 h-4 mr-2" />
                <span>Pet Shop</span>
              </div>

              <h2 className="text-3xl lg:text-5xl font-black text-black leading-snug">
                Your Pet’s Comfort, Our Priority
                <span className="block text-gray-600">Explore Nearby Pet Experts !</span>
              </h2>

              <p className="text-base text-gray-600 leading-relaxed">
                Experience premium pet care services designed with love and expertise.
                Your pet's comfort and happiness is our priority.
              </p>

              <Button className="bg-black text-white hover:bg-gray-800 px-6 py-3 rounded-full text-base font-semibold group transition-all duration-300 transform hover:scale-105">
                Book Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="relative left-20">
              <img src={imagecat1} alt="Cute kitten" className="w-full h-auto rounded-lg scale-125" />
            </div>
          </div>
        </div>
      </section>


      {/* Booking Steps Section */}
      <section className="py-24 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-white text-black text-sm font-bold rounded-full mb-8 shadow-lg">
              <Shield className="w-4 h-4 mr-2" />
              Simple Process
            </div>
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 leading-tight">
              Quick and Easy Booking in
              <span className="block bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                3 Simple Steps!
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Phone,
                title: "Select Service",
                description: "Choose from our comprehensive range of pet relocation services tailored to your specific needs and requirements."
              },
              {
                icon: Calendar,
                title: "Book Your Day",
                description: "Schedule your preferred date and time with our intelligent booking system designed for maximum convenience."
              },
              {
                icon: Clock,
                title: "Relax & Trust",
                description: "Sit back and relax while our expert team of professionals takes care of your pet's safe and comfortable journey."
              }
            ].map((step, index) => (
              <div key={index} className="text-center group relative">
                <div className="relative mb-10">
                  {/* Connecting line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-white/30 to-transparent z-0"></div>
                  )}

                  <div className="relative z-10 w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto group-hover:bg-gray-200 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 shadow-2xl">
                    <step.icon className="w-12 h-12 text-black transition-all duration-300 group-hover:scale-110" />
                  </div>

                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-black border-3 border-white rounded-full flex items-center justify-center text-sm font-black text-white shadow-lg">
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-2xl font-black text-white mb-6 group-hover:text-gray-200 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-300 leading-relaxed max-w-sm mx-auto text-lg">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Caring Section */}
      <section className="py-20 lg:py-32 bg-white text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <img src={imageDog} alt="Border Collie puppy" className="w-full h-auto" />
            </div>

            <div className="space-y-8 order-1 lg:order-2">
              <h2 className="text-4xl lg:text-6xl font-black text-black leading-tight">
                Caring for your pets,
                <span className="block text-gray-600">the Fluffy way!</span>
              </h2>

              <p className="text-xl text-gray-600 leading-relaxed">
                Comprehensive grooming, boarding, and veterinary care – all delivered with premium service
                and genuine care for your beloved companions.
              </p>

              <div className="flex flex-wrap gap-4">
                {['Grooming', 'Boarding'].map((service, index) => (
                  <div key={index} className="flex items-center px-4 py-2 bg-gray-100 rounded-full">
                    <Star className="w-4 h-4 mr-2 text-black" />
                    <span className="font-medium">{service}</span>
                  </div>
                ))}
              </div>

              <Button className="bg-black text-white hover:bg-gray-800 px-8 py-4 rounded-full text-lg font-semibold group transition-all duration-300 transform hover:scale-105">
                Explore Services
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section */}


      <section className="pt-16 pb-0 bg-gradient-to-b from-white to-gray-100">
        <div className="text-center mb-12 px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-black leading-tight">
            Give Your Pet the Love They Deserve
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mt-4 font-medium">
            Find Top-Rated Caregivers Now!
          </p>
        </div>
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={imageGroupofDog}
              alt="Group of happy dogs"
              className="w-full max-w-4xl h-auto"
            />
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="bg-gradient-to-br from-black via-gray-900 to-black pt-0 pb-20 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-300 rounded-full mix-blend-screen filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-white">
            <div className="space-y-8">
              <h3 className="mt-6 text-2xl font-black text-white">
                Want to Talk?
                <span className="block text-gray-300">Please Call Us</span>
              </h3>
              <div className="space-y-8">
                <div className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <Phone className="w-5 h-5 mr-3 text-white" />
                  <span className="text-lg font-medium">+2456783656748</span>
                </div>
                <div className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <Phone className="w-5 h-5 mr-3 text-white" />
                  <span className="text-lg font-medium">+2456783656567</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="mt-6 text-2xl font-black text-white">Subscribe to get latest updates</h3>
              <p className="text-gray-300 leading-relaxed">
                Stay informed about our latest services, special offers, and pet care tips
                delivered directly to your inbox.
              </p>
              <Button className="bg-white text-black hover:bg-gray-200 w-full py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105">
                Subscribe Now
              </Button>
            </div>

            <div className="space-y-8">
              <h3 className="mt-6 text-2xl font-black text-white">Get in touch</h3>
              <div className="flex space-x-4">
                {[Facebook, Linkedin, Twitter].map((Icon, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                  >
                    <Icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                  </div>
                ))}
              </div>
              <div className="flex rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
                <Input
                  placeholder="Enter your email"
                  className="bg-transparent text-white placeholder:text-gray-300 border-none rounded-r-none flex-1"
                />
                <Button className="bg-white text-black hover:bg-gray-200 rounded-l-none px-6 font-semibold">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <Footer />
    </div>
  )
}