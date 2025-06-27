import type React from "react"
import { Users, Cat, Clock, Footprints, Star, ArrowRight, Calendar, Heart, Shield, Sparkles, Award, Briefcase, ChevronRight, Plus, MessageCircle, Quote, CheckCircle, Mail, MapPin, Phone, Send } from "lucide-react"
import Header from "@/components/user/Header"
import Footer from "@/components/user/Footer"
import catFace from "@/assets/aboutPage/image.png"
import { useEffect, useState, type FormEvent } from "react"
const About: React.FC = () => {

  const stats = [
    {
      value: "5k+",
      label: "Pet Parents",
      icon: Users,
    },
    {
      value: "10k+",
      label: "Happy Pets",
      icon: Cat,
    },
    {
      value: "4+",
      label: "Combined years",
      icon: Clock,
    },
    {
      value: "1000",
      label: "Miles Walked",
      icon: Footprints,
    },
  ]
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Pet Owner",
      rating: 5,
      text: "Exceptional service! My dog has never been happier. The staff truly cares about every pet.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Mike Chen",
      role: "Cat Parent",
      rating: 5,
      text: "Professional, caring, and reliable. I trust them completely with my furry family members.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
  ]

  const features = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Passionate Care",
      description: "We treat every pet like our own family",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Safe & Secure",
      description: "Your pet's safety is our top priority",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24/7 Support",
      description: "Round-the-clock care and assistance",
    },
  ]
  const ratings = [
    { stars: 5, percentage: 70 },
    { stars: 4, percentage: 45 },
    { stars: 3, percentage: 20 },
    { stars: 2, percentage: 0 },
    { stars: 1, percentage: 0 }
  ];
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVisible) {
      ratings.forEach((rating, index) => {
        setTimeout(() => {
          setAnimatedRatings(prev => ({
            ...prev,
            [rating.stars]: rating.percentage
          }));
        }, index * 200);
      });
    }
  }, []);
  const teamMembers = [
    {
      name: "Emily Smith",
      role: "Head Groomer",
      experience: "10+ years",
      expertise: "Breed-specific grooming, creative styling, and gentle care.",
    },
    {
      name: "Jessica Lee",
      role: "Grooming Assistant",
      experience: "5 years",
      expertise: "Bathing, ear cleaning, and soothing massages.",
    },
    {
      name: "Michael Anderson",
      role: "Junior Groomer",
      experience: "2 years",
      expertise: "Teeth cleaning and gland expression, and personalized pet care.",
    },
  ]
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);



  function handleSubmit(_event: FormEvent<HTMLFormElement>): void {
    throw new Error("Function not implemented.")
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-white py-16 px-4 mb-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 z-10 pl-4 md:pl-8 lg:pl-16">
                <div className="animate-fade-in-up">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-inter font-black uppercase text-black tracking-tight">
                    ABOUT US
                  </h1>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-inter font-bold uppercase mt-2 mb-8 text-black leading-tight">
                    OUR CORE BELIEFS, VALUES AND PROMISE
                  </h2>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="flex items-start space-x-4 animate-fade-in-up delay-100">
                    <div className="animate-float">
                      <Shield className="w-8 h-8 text-black" />
                    </div>
                    <div>
                      <p className="text-black font-inter font-semibold text-lg">
                        Peace of Mind Grooming.
                      </p>
                      <p className="text-gray-800 font-inter">
                        100% Safe for Your Beloved Pets.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 animate-fade-in-up delay-200">
                    <div className="animate-pulse-scale">
                      <Heart className="w-8 h-8 text-black" />
                    </div>
                    <div>
                      <p className="text-black font-inter font-semibold text-lg">
                        Gentle Expert Care
                      </p>
                      <p className="text-gray-800 font-inter">
                        With guaranteed well-being for every pet.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 animate-fade-in-up delay-300">
                    <div className="animate-float delay-1000">
                      <Star className="w-8 h-8 text-black" />
                    </div>
                    <div>
                      <p className="text-black font-inter font-semibold text-lg">
                        Trusted by Pet Owners
                      </p>
                      <p className="text-gray-800 font-inter">
                        Our dedicated team ensures the best care possible.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="animate-fade-in-up delay-400">
                  <button className="group inline-flex items-center space-x-3 bg-black hover:bg-gray-800 text-white font-inter font-semibold py-4 px-8 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <Calendar className="w-5 h-5 group-hover:animate-pulse-scale" />
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 relative mt-8 md:mt-0">
              <div className="w-full h-max md:absolute md:-right-240 -top-104 -rotate-90">
                {/* Semi Circle Design */}
                <div
                  className="hidden md:block bg-[#c5c27d] w-[999px] h-[350px] relative -top-12"

                  style={{
                    borderTopLeftRadius: "250px",
                    borderTopRightRadius: "250px",
                  }}
                >
                  <img
                    src={catFace}
                    alt="Close up of a cat's face"
                    className="absolute md:left-11 md:-top-58 w-[400px] h-[760px]  object-left rotate-90"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>


        <section className="relative py-20 bg-black overflow-hidden mt-24">

          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 border border-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-white rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Header with gradient text effect */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-white animate-pulse" />
                <span className="text-white/70 text-sm uppercase tracking-wider font-medium">
                  Excellence in Numbers
                </span>
                <Sparkles className="h-5 w-5 text-white animate-pulse" />
              </div>
              <h2 className={`text-5xl md:text-6xl font-bold text-white mb-4 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}>
                Customer Satisfaction
                <span className="block bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Statistics
                </span>
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-white to-gray-400 mx-auto rounded-full"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 
                         hover:bg-white hover:border-white transition-all duration-700 hover:scale-105 
                         hover:shadow-2xl hover:shadow-white/20 cursor-pointer transform
                         ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                  {/* Icon container with rotation effect */}
                  <div className="relative mb-6">
                    <div className="w-16 h-16 mx-auto bg-white/10 group-hover:bg-black rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12">
                      <stat.icon className="h-8 w-8 text-white group-hover:text-white transition-colors duration-500" />
                    </div>
                    {/* Floating animation dots */}
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-white/30 rounded-full animate-bounce opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-white/30 rounded-full animate-bounce opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ animationDelay: '1s' }}></div>
                  </div>

                  {/* Counter with typewriter effect */}
                  <div className="text-center">
                    <div className="text-white/70 group-hover:text-black/70 transition-colors duration-500 font-medium">
                      {stat.label}
                    </div>
                  </div>

                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/20 transition-all duration-500"></div>
                </div>
              ))}
            </div>

            {/* CTA Button with modern design */}
            <div className="text-center">
              <button className="group relative inline-flex items-center gap-3 bg-white text-black font-semibold py-4 px-8 rounded-full 
                           hover:bg-black hover:text-white transition-all duration-500 hover:shadow-2xl hover:shadow-white/20 
                           border-2 border-transparent hover:border-white/20 transform hover:scale-105">
                <span className="relative z-10">View All Team Members</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />

                {/* Button glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Ripple effect */}
                <div className="absolute inset-0 rounded-full border-2 border-white/0 group-hover:border-white/30 group-hover:scale-150 transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
              </button>
            </div>
          </div>

          {/* Floating particles */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              ></div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="relative py-20 bg-white text-black overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, black 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, black 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}></div>
          </div>

          <div className="absolute top-20 left-10 w-20 h-20 border border-black/10 rounded-xl rotate-45 animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-16 h-16 border border-black/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>

          <div className="container mx-auto px-4 md:px-8 lg:px-16 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-black animate-pulse" />
                <span className="text-black/70 text-sm uppercase tracking-wider font-medium">
                  Meet Our Experts
                </span>
                <Users className="h-5 w-5 text-black animate-pulse" />
              </div>
              <h2 className={`text-5xl md:text-6xl font-bold text-black mb-4 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}>
                Our Talented
                <span className="block bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
                  Team
                </span>
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-black to-gray-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 grid md:grid-cols-3 gap-8">
                {teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className={`group relative bg-white border border-black/10 rounded-3xl p-6
                           hover:bg-black hover:border-black transition-all duration-700 hover:scale-105 
                           hover:shadow-2xl hover:shadow-black/20 cursor-pointer transform
                           ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                    style={{ transitionDelay: `${index * 200}ms` }}
                  >
                    <div className="relative mb-6">
                      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-black/20 group-hover:ring-white/20 transition-all duration-500 group-hover:scale-110">
                        <img
                          src={`https://images.unsplash.com/photo-${1500000000000 + index}?w=160&h=160&fit=crop&crop=face`}
                          alt={member.name}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-black/20 group-hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 animate-bounce">
                        <Sparkles className="h-4 w-4 text-black group-hover:text-black" />
                      </div>
                    </div>

                    <div className="text-center space-y-3">
                      <h3 className="text-2xl font-bold text-black group-hover:text-white transition-colors duration-500">{member.name}</h3>
                      <div className="flex items-center justify-center gap-2 text-black/80 group-hover:text-white/80 transition-colors duration-500">
                        <Briefcase className="h-4 w-4" />
                        <span className="font-medium">{member.role}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-black/70 group-hover:text-white/70 transition-colors duration-500">
                        <Award className="h-4 w-4" />
                        <span className="text-sm">{member.experience}</span>
                      </div>
                      <div className="pt-2 border-t border-black/20 group-hover:border-white/20 transition-colors duration-500">
                        <p className="text-sm text-black/60 group-hover:text-white/60 transition-colors duration-500">
                          <span className="font-medium">Expertise:</span> {member.expertise}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`bg-white border border-black/10 rounded-3xl p-8 h-fit
                          transition-all duration-500
                          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                style={{ transitionDelay: '600ms' }}>
                <div className="flex items-center gap-3 mb-6">
                  <Star className="h-6 w-6 text-yellow-500" />
                  <h3 className="text-xl font-bold text-black">Customer Ratings</h3>
                </div>

                <div className="flex items-center mb-8">
                  <span className="text-5xl font-bold text-black mr-4">4.9</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {ratings.reverse().map((rating) => (
                    <div key={rating.stars} className="flex items-center gap-3">
                      <span className="text-black/70 text-sm w-2">{rating.stars}</span>
                      <div className="flex-1 h-2 bg-black/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `79%`,
                            transitionDelay: `${(5 - rating.stars) * 200}ms`
                          }}
                        ></div>
                      </div>
                      <span className="text-black/70 text-sm w-10 text-right">
                        88%
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-black/60 text-sm mb-6">Share your experience with our team</p>

                <button className="group flex items-center gap-2 w-full bg-black text-white hover:bg-white hover:text-black 
                             border border-black hover:border-black rounded-xl px-4 py-3 transition-all duration-500 
                             hover:shadow-lg hover:shadow-black/20">
                  <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="font-medium">Add Review</span>
                  <ChevronRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-black/10 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              ></div>
            ))}
          </div>
        </section>
        <section className="py-20 bg-black text-white px-4 md:px-8 lg:px-16 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full animate-pulse" />
            <div className="absolute bottom-16 right-16 w-24 h-24 border border-white/20 rounded-full animate-pulse" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/10 rounded-full" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Quote className="w-8 h-8 text-white" />
                <h2 className="text-5xl font-bold">Client Stories</h2>
              </div>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Discover why pet owners trust us with their beloved companions
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-white mr-2" />
                  <span className="text-3xl font-bold">500+</span>
                </div>
                <p className="text-gray-400">Happy Clients</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Heart className="w-6 h-6 text-white mr-2" />
                  <span className="text-3xl font-bold">1000+</span>
                </div>
                <p className="text-gray-400">Pets Cared</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="w-6 h-6 text-white mr-2" />
                  <span className="text-3xl font-bold">5</span>
                </div>
                <p className="text-gray-400">Years Experience</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-6 h-6 text-white mr-2" />
                  <span className="text-3xl font-bold">4.9</span>
                </div>
                <p className="text-gray-400">Rating</p>
              </div>
            </div>

            {/* Testimonials Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-200 mb-6 text-lg leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 border-2 border-white/20"
                    />
                    <div>
                      <h4 className="font-semibold text-white">{testimonial.name}</h4>
                      <p className="text-gray-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <button className="bg-white text-black hover:bg-gray-100 font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto">
                <MessageCircle className="w-5 h-5" />
                Share Your Experience
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Contact Section - White Background */}
        <section className="py-20 bg-white text-black px-4 md:px-8 lg:px-16 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-10 left-10 w-20 h-20 border border-black/10 rounded-lg rotate-45" />
            <div className="absolute bottom-20 right-20 w-16 h-16 border border-black/10 rounded-lg rotate-12" />
            <div className="absolute top-1/3 right-1/4 w-12 h-12 border border-black/10 rounded-full" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-4">
                Why Choose{" "}
                <span className="text-black relative">
                  Us
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-black/20 rounded-full"></div>
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Experience the difference with our professional pet care services
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-2xl border border-gray-200 hover:border-black/20 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Left Column - Team Member */}
              <div className="text-center lg:text-left">
                <div className="relative inline-block mb-6">
                  <div className="w-48 h-48 mx-auto lg:mx-0 rounded-3xl overflow-hidden border-4 border-black/10">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
                      alt="Philip Adam"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center">
                    <Award className="w-8 h-8" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-2">Philip Adam</h3>
                <p className="text-gray-600 mb-4 flex items-center justify-center lg:justify-start gap-2">
                  <Shield className="w-4 h-4" />
                  HR Manager & Pet Care Specialist
                </p>

                <p className="text-gray-700 mb-8 leading-relaxed">
                  With over 5 years of experience in pet care, I ensure every animal receives personalized attention and
                  the highest quality care. Our dedicated team works tirelessly to create a safe, loving environment for
                  your beloved pets.
                </p>

                {/* Contact Info */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-center lg:justify-start gap-3 text-gray-600">
                    <Phone className="w-5 h-5" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-3 text-gray-600">
                    <Mail className="w-5 h-5" />
                    <span>philip@petcare.com</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-3 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>123 Pet Care Street, City</span>
                  </div>
                </div>

                <button className="bg-black text-white hover:bg-gray-900 font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto lg:mx-0">
                  Get a Quote
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Right Column - Contact Form */}
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200">
                <div className="flex items-center gap-2 mb-6">
                  <Send className="w-6 h-6 text-black" />
                  <h3 className="text-2xl font-bold">Send us a Message</h3>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        placeholder="Enter your first name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        placeholder="Enter your last name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter a valid email address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                      Your Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value=""
                      rows={5}
                      placeholder="Tell us about your pet care needs..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 resize-none"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                    <CheckCircle className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default About
function setAnimatedRatings(_arg0: (prev: any) => any) {
  throw new Error("Function not implemented.")
}

