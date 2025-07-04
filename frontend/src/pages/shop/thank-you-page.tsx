
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Star, CheckCircle, Clock, Bell, ArrowRight } from "lucide-react";

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [typewriterText, setTypewriterText] = useState("");
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const fullText = "WELCOME TO FLUFFYCARE SHOP PORTAL";

  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);

    // Initial reveal animation
    setTimeout(() => setIsVisible(true), 400);

    // Typewriter effect
    let index = 0;
    const typewriterTimer = setInterval(() => {
      if (index < fullText.length) {
        setTypewriterText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typewriterTimer);
        setShowCelebration(true);
      }
    }, 100);

    // Progressive step reveals
    const stepTimers = [
      setTimeout(() => setCurrentStep(1), 2500),
      setTimeout(() => setCurrentStep(2), 4000),
      setTimeout(() => setCurrentStep(3), 5500),
    ];

    return () => {
      clearInterval(typewriterTimer);
      stepTimers.forEach(clearTimeout);
    };
  }, []);

  const containerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
        ease: [0.25, 0.1, 0.25, 1],
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const stepVariants = {
    hidden: {
      opacity: 0,
      x: -50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0">
        {/* Geometric Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Floating Elements */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 bg-black/5 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Gradient Accents */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-black/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-black/5 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Celebration Effect */}
      <AnimatePresence>
        {showCelebration && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -20,
                  rotate: 0,
                  scale: 0,
                }}
                animate={{
                  y: window.innerHeight + 20,
                  rotate: 360,
                  scale: [0, 1, 0.5, 0],
                }}
                transition={{
                  duration: 4,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
              >
                <div className="w-4 h-4 bg-black rounded-full" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="max-w-6xl w-full"
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Content Section */}
            <motion.div variants={itemVariants} className="space-y-10">
              
              {/* Brand Header */}
              <div className="flex items-center gap-4 mb-8">
                <motion.div
                  className="relative"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-16 h-16 bg-black rounded-3xl flex items-center justify-center shadow-xl">
                    <Heart className="w-8 h-8 text-white" fill="currentColor" />
                  </div>
                  <motion.div
                    className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-black rounded-full flex items-center justify-center"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-3 h-3 text-black" />
                  </motion.div>
                </motion.div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-black text-black tracking-tight">
                    Fluffy<span className="text-gray-600">Care</span>
                  </h1>
                  <p className="text-lg text-gray-600 font-medium">Shop Partner Portal</p>
                </div>
              </div>

              {/* Main Headline */}
              <motion.div variants={itemVariants} className="space-y-6">
                <motion.h2
                  className="text-5xl lg:text-7xl font-black leading-tight text-black"
                  style={{
                    textShadow: "0 0 0 transparent",
                  }}
                >
                  {typewriterText}
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-gray-400"
                  >
                    |
                  </motion.span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3, duration: 0.8 }}
                  className="text-2xl text-gray-700 font-light leading-relaxed"
                >
                  Your shop registration is under review 🏪
                </motion.p>
              </motion.div>

              {/* Verification Status Cards */}
              <div className="space-y-6">
                {[
                  {
                    icon: CheckCircle,
                    title: "Shop Application Under Review",
                    description: "Our AI-powered system is analyzing your pet care profile for optimal matching.",
                    status: "In Review",
                    progress: 95,
                    bgColor: "bg-gray-50",
                    iconBg: "bg-black",
                  },
                  {
                    icon: Clock,
                    title: "Processing Timeline: 24 Hours",
                    description: "Quality assurance protocols ensure perfect pet-owner compatibility.",
                    status: "Processing",
                    progress: 100,
                    bgColor: "bg-gray-100",
                    iconBg: "bg-gray-800",
                  },
                  {
                    icon: Bell,
                    title: "Admin Verification Required",
                    description: "Once approved by our admin team, you'll gain access to your complete shop dashboard.",
                    status: "Pending",
                    progress: 70,
                    bgColor: "bg-black",
                    iconBg: "bg-white",
                  },
                ].map((service, index) => (
                  <motion.div
                    key={index}
                    initial="hidden"
                    animate={currentStep > index ? "visible" : "hidden"}
                    variants={stepVariants}
                    transition={{
                      delay: index * 0.2,
                    }}
                    className="group cursor-pointer"
                  >
                    <div className={`relative overflow-hidden rounded-2xl ${service.bgColor} p-8 transition-all duration-500 hover:shadow-2xl hover:scale-105`}>
                      
                      {/* Animated Border Accent */}
                      <motion.div
                        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-black to-transparent"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                      />
                      
                      <div className="flex items-start gap-6">
                        <motion.div
                          className={`flex-shrink-0 w-16 h-16 ${service.iconBg} rounded-2xl flex items-center justify-center shadow-lg`}
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <service.icon className={`w-8 h-8 ${service.bgColor === 'bg-black' ? 'text-black' : 'text-white'}`} />
                        </motion.div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className={`font-bold text-2xl ${service.bgColor === 'bg-black' ? 'text-white' : 'text-black'} group-hover:tracking-wide transition-all`}>
                              {service.title}
                            </h3>
                            <motion.span
                              className={`px-4 py-2 rounded-full text-sm font-bold ${service.bgColor === 'bg-black' ? 'bg-white text-black' : 'bg-black text-white'}`}
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              {service.status}
                            </motion.span>
                          </div>
                          
                          <p className={`${service.bgColor === 'bg-black' ? 'text-gray-300' : 'text-gray-700'} mb-6 leading-relaxed text-lg`}>
                            {service.description}
                          </p>
                          
                          <div className="relative">
                            <div className={`w-full ${service.bgColor === 'bg-black' ? 'bg-gray-800' : 'bg-gray-300'} rounded-full h-3 overflow-hidden`}>
                              <motion.div
                                className={`h-full ${service.bgColor === 'bg-black' ? 'bg-white' : 'bg-black'} rounded-full`}
                                initial={{ width: 0 }}
                                animate={{ width: `${service.progress}%` }}
                                transition={{ duration: 2, delay: index * 0.3, ease: "easeOut" }}
                              />
                            </div>
                            <span className={`text-sm ${service.bgColor === 'bg-black' ? 'text-gray-400' : 'text-gray-600'} mt-2 block font-medium`}>
                              {service.progress}% Complete
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Call to Action Section */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: currentStep >= 3 ? 1 : 0, y: currentStep >= 3 ? 0 : 40 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="relative"
              >
                <div className="relative overflow-hidden rounded-3xl bg-black p-10">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                  
                  <div className="relative z-10">
                    <h3 className="font-black text-3xl mb-4 text-white">What Happens Next?</h3>
                    <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                      Our admin team will review your shop credentials and verify your business details. Once approved, you'll receive full access to your shop dashboard with all management tools.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-black px-10 py-5 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 group"
                      >
                        Check Status
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="border-2 border-white text-white hover:bg-white hover:text-black px-10 py-5 rounded-2xl font-black text-lg transition-all duration-300 flex items-center justify-center gap-3 group"
                      >
                        Contact Support
                        <Star className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Visual Section */}
            <motion.div
              variants={itemVariants}
              className="relative flex items-center justify-center"
            >
              <div className="relative">
                {/* Main Visual Container */}
                <motion.div
                  className="relative overflow-hidden rounded-[2rem]"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.8 }}
                >
                  {/* Border Animation */}
                  <motion.div
                    className="absolute -inset-4 bg-gradient-to-r from-black via-gray-600 to-black rounded-[2.5rem] blur-sm"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                  
                  <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-[2rem] p-4">
                    <div className="w-full h-[500px] bg-gradient-to-br from-gray-100 to-gray-50 rounded-[1.5rem] flex items-center justify-center overflow-hidden border-4 border-black/5">
                      {/* Shop Verification Visual */}
                      <motion.div
                        className="text-center px-8"
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <div className="w-40 h-40 bg-black rounded-full flex items-center justify-center mb-8 mx-auto shadow-2xl">
                          <Heart className="w-20 h-20 text-white" fill="currentColor" />
                        </div>
                        <h3 className="text-3xl font-black text-black mb-4">Shop Verification</h3>
                        <p className="text-gray-600 text-lg font-medium">Pending Admin Approval</p>
                        
                        {/* Verification Icons */}
                        <div className="flex justify-center gap-6 mt-8">
                          {['🏪', '✅', '⏰', '🔒'].map((emoji, index) => (
                            <motion.div
                              key={index}
                              className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-black/10"
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 2, delay: index * 0.2, repeat: Infinity }}
                            >
                              {emoji}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Service Elements */}
                <div className="absolute inset-0 pointer-events-none">
                  {[
                    { icon: "🏪", delay: 0, radius: 180, duration: 12, position: "top-left" },
                    { icon: "📋", delay: 3, radius: 160, duration: 10, position: "top-right" },
                    { icon: "✅", delay: 6, radius: 200, duration: 14, position: "bottom-left" },
                    { icon: "👨‍💼", delay: 2, radius: 170, duration: 11, position: "bottom-right" },
                  ].map((orbit, index) => (
                    <motion.div
                      key={index}
                      className="absolute top-1/2 left-1/2 w-16 h-16 -ml-8 -mt-8"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: orbit.duration,
                        delay: orbit.delay,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{
                        transformOrigin: `${orbit.radius}px 0px`,
                      }}
                    >
                      <motion.div
                        className="w-16 h-16 bg-white rounded-2xl border-2 border-black/10 flex items-center justify-center text-2xl shadow-xl"
                        whileHover={{ scale: 1.3 }}
                        animate={{ rotate: -360 }}
                        transition={{
                          rotate: {
                            duration: orbit.duration,
                            repeat: Infinity,
                            ease: "linear",
                          },
                        }}
                      >
                        {orbit.icon}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
