import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
    CalendarCheck,
    Users,
    CreditCard,
    ArrowRight,
    Star,
    CheckCircle,
    ChevronDown,
    Zap,
    Shield,
    Award,
    Clock,
    DollarSign,
    BarChart,
    MessageSquare,
    Smartphone,
    Settings,
    PawPrint,
} from "lucide-react"
import Header from "@/components/shop/Header"
import Footer from "@/components/user/Footer"
import serviceGirl from '@/assets/shop/serviceGirl.png';
import careImage from '@/assets/shop/careImage.png';

// Type definitions
interface AnimatedCounterProps {
    value: string | number;
    duration?: number;
    prefix?: string;
    suffix?: string;
}

interface FAQItemProps {
    question: string;
    answer: string;
}

interface ProcessStepProps {
    number: string | number;
    title: string;
    description: string;
    isLast?: boolean;
}

interface FeatureCardProps {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    title: string;
    description: string;
}

interface PricingPlanProps {
    title: string;
    price: string | number;
    features: string[];
    isPopular?: boolean;
    ctaText?: string;
}

interface TestimonialCardProps {
    image?: string;
    quote: string;
    name: string;
    role: string;
    rating?: number;
}

// Custom animated counter component
const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, duration = 2000, prefix = "", suffix = "" }) => {
    const [count, setCount] = useState(0)
    const countRef = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        let start = 0
        const end = Number.parseInt(value.toString())

        if (start === end) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    const timer = setInterval(() => {
                        start = start + Math.ceil(end / (duration / 50))
                        if (start > end) {
                            setCount(end)
                            clearInterval(timer)
                        } else {
                            setCount(start)
                        }
                    }, 50)

                    if (countRef.current) {
                        observer.unobserve(countRef.current)
                    }
                }
            },
            { threshold: 0.5 },
        )

        if (countRef.current) {
            observer.observe(countRef.current)
        }

        return () => {
            if (countRef.current) {
                observer.unobserve(countRef.current)
            }
        }
    }, [value, duration])

    return (
        <span ref={countRef} className="text-5xl md:text-6xl font-bold text-[#cbab74]">
            {prefix}
            {count.toLocaleString()}
            {suffix}
        </span>
    )
}

// FAQ Item component
const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border-b border-gray-200 last:border-0">
            <button className="flex justify-between items-center w-full py-5 text-left" onClick={() => setIsOpen(!isOpen)}>
                <h3 className="text-lg font-semibold text-[#121d28]">{question}</h3>
                <ChevronDown
                    className={`h-5 w-5 text-[#cbab74] transition-transform duration-300 ${isOpen ? "transform rotate-180" : ""}`}
                />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 pb-5" : "max-h-0"}`}>
                <p className="text-gray-600">{answer}</p>
            </div>
        </div>
    )
}

// Process Step component
const ProcessStep: React.FC<ProcessStepProps> = ({ number, title, description, isLast = false }) => {
    return (
        <div className="flex">
            <div className="flex flex-col items-center mr-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#cbab74] text-[#121d28] font-bold text-xl">
                    {number}
                </div>
                {!isLast && <div className="w-0.5 h-full bg-[#cbab74]/30 my-2"></div>}
            </div>
            <div className="pb-10">
                <h3 className="text-xl font-bold text-[#121d28] mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
            </div>
        </div>
    )
}

// Feature Card component
const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 h-24 w-24 -translate-y-1/2 translate-x-1/2 transform rounded-full bg-gradient-to-br from-[#cbab74]/20 to-[#cbab74]/5"></div>
            <div className="relative z-10">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#121d28] text-[#cbab74] transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-[#121d28]">{title}</h3>
                <p className="text-gray-600">{description}</p>
            </div>
        </div>
    )
}

// Pricing Plan component
const PricingPlan: React.FC<PricingPlanProps> = ({ title, price, features, isPopular = false, ctaText = "Get Started" }) => {
    return (
        <div
            className={`relative rounded-2xl overflow-hidden ${isPopular ? "border-2 border-[#cbab74] shadow-xl scale-105 z-10 my-4 md:my-0" : "border border-gray-200 shadow-lg"}`}
        >
            {isPopular && (
                <div className="absolute top-0 right-0 bg-[#cbab74] text-[#121d28] font-medium py-1 px-4 rounded-bl-lg">
                    Most Popular
                </div>
            )}
            <div className="p-8">
                <h3 className="text-2xl font-bold text-[#121d28] mb-2">{title}</h3>
                <div className="mb-6">
                    <span className="text-4xl font-bold text-[#121d28]">${price}</span>
                    <span className="text-gray-500 ml-1">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                    {features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-[#cbab74] mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{feature}</span>
                        </li>
                    ))}
                </ul>
                <Button
                    className={`w-full py-6 ${isPopular
                            ? "bg-[#cbab74] hover:bg-[#cbab74]/90 text-[#121d28]"
                            : "bg-[#121d28] hover:bg-[#121d28]/90 text-white"
                        }`}
                >
                    {ctaText}
                </Button>
            </div>
        </div>
    )
}

// Testimonial Card component with hover effect
const TestimonialCard: React.FC<TestimonialCardProps> = ({ image, quote, name, role, rating = 5 }) => {
    return (
        <div className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#121d28]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <img
                src={image || "/placeholder.svg"}
                alt={name}
                className="w-full h-full object-cover aspect-[4/5] transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex mb-3">
                    {[...Array(rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-[#cbab74] fill-[#cbab74]" />
                    ))}
                </div>
                <p className="text-white font-medium italic mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    "{quote}"
                </p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                    <h4 className="font-bold text-white">{name}</h4>
                    <p className="text-sm text-gray-300">{role}</p>
                </div>
            </div>
        </div>
    )
}
const TrustBadge: React.FC<{ name: string }> = ({ name }) => (
    <div className="bg-white/10 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/15">
        <span className="text-white/80">{name}</span>
    </div>
);

const MetricCard: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <div className="bg-[#cbab74] rounded-lg p-4 shadow-xl transform transition-transform duration-300 hover:scale-105">
        <div className="flex items-center space-x-3">
            <div className="bg-white rounded-full p-2">
                <ArrowRight className="h-5 w-5 text-[#cbab74]" />
            </div>
            <div>
                <p className="font-bold text-[#121d28]">{value}</p>
                <p className="text-xs text-[#121d28]/80">{label}</p>
            </div>
        </div>
    </div>
);

export default function VendorLandingPage() {
    return (
        <main className="flex flex-col min-h-screen bg-white">
            <Header />

            {/* Hero Section - Enhanced with animated background and split layout */}
            <section className="relative py-20 md:py-32 px-6 md:px-16 overflow-hidden bg-[#121d28] text-white">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#121d28] to-[#121d28]/80"></div>
                    <div className="absolute inset-0 opacity-10">
                        <img
                            src="https://images.pexels.com/photos/46024/pexels-photo-46024.jpeg?auto=compress&cs=tinysrgb&w=1200"
                            alt="Background pattern"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Animated circles */}
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#cbab74]/10 animate-pulse"></div>
                    <div
                        className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-[#cbab74]/5 animate-pulse"
                        style={{ animationDelay: "1s", animationDuration: "4s" }}
                    ></div>
                    <div
                        className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-[#cbab74]/8 animate-pulse"
                        style={{ animationDelay: "2s", animationDuration: "5s" }}
                    ></div>
                </div>

                <div className="container mx-auto relative z-10">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col space-y-6">
                            <div
                                className="inline-flex items-center px-4 py-2 rounded-full bg-[#cbab74]/20 text-[#cbab74] text-sm font-medium mb-2 transform transition-transform duration-300 hover:scale-105"
                            >
                                <PawPrint className="h-4 w-4 mr-2" />
                                <span>Trusted by 2,000+ Pet Care Professionals</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                                Grow Your Pet Care Business with <span className="text-[#cbab74]">FluffyCare</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                                Join thousands of pet care providers expanding their reach and transforming their business with our
                                all-in-one platform designed specifically for pet services.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button
                                    size="lg"
                                    className="bg-[#cbab74] hover:bg-[#cbab74]/90 text-[#121d28] font-medium px-8 py-6 text-lg rounded-full shadow-lg shadow-[#cbab74]/20 transform transition-transform duration-300 hover:translate-y-[-2px]"
                                >
                                    Get Started
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white text-black hover:bg-white/10 px-8 py-6 text-lg rounded-full transform transition-transform duration-300 hover:translate-y-[-2px]"
                                >
                                    Watch Demo
                                </Button>
                            </div>

                            {/* Trust indicators */}
                            <div className="pt-8 border-t border-white/10 mt-8">
                                <p className="text-sm text-gray-400 mb-4 tracking-wider">TRUSTED BY PET CARE BUSINESSES WORLDWIDE</p>
                                <div className="flex flex-wrap gap-4 items-center">
                                    {["PawPartners", "PetPro", "FurryFriends", "WagWise"].map((brand, i) => (
                                        <TrustBadge key={i} name={brand} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="relative hidden md:block">
                            <div className="absolute -top-6 -left-6 w-full h-full rounded-2xl border border-[#cbab74]/30 animate-pulse"></div>
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-500 hover:scale-[1.02]">
                                <img
                                    src="https://images.pexels.com/photos/1139793/pexels-photo-1139793.jpeg?auto=compress&cs=tinysrgb&w=1200"
                                    alt="Pet care professional using FluffyCare"
                                    className="w-full h-auto"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#121d28] to-transparent opacity-20"></div>
                            </div>
                            <div className="absolute -bottom-8 -right-8">
                                <MetricCard value="+65%" label="Average Revenue Growth" />
                            </div>
                            <div className="absolute top-[-30px] right-[30px]">
                                <MetricCard value="2.3x" label="Client Base Expansion" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section - New */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div className="p-6">
                            <AnimatedCounter value="2000" suffix="+" />
                            <p className="mt-2 text-lg font-medium text-gray-600">Vendors</p>
                        </div>
                        <div className="p-6">
                            <AnimatedCounter value="50000" suffix="+" />
                            <p className="mt-2 text-lg font-medium text-gray-600">Pet Owners</p>
                        </div>
                        <div className="p-6">
                            <AnimatedCounter value="98" suffix="%" />
                            <p className="mt-2 text-lg font-medium text-gray-600">Satisfaction Rate</p>
                        </div>
                        <div className="p-6">
                            <AnimatedCounter value="500000" prefix="$" suffix="+" />
                            <p className="mt-2 text-lg font-medium text-gray-600">Revenue Generated</p>
                        </div>
                    </div>
                </div>
            </section>


            {/* Why Join Us Section - Enhanced with better cards */}
            <section className="py-20 px-4 bg-gray-50">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-[#121d28]/10 text-[#121d28] rounded-full text-sm font-medium mb-4">
                            WHY CHOOSE US
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#121d28] mb-4">
                            Why Pet Care Professionals Choose FluffyCare
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Partner with FluffyCare and transform how you manage your pet care business with our comprehensive
                            platform
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Users}
                            title="Reach More Pet Owners"
                            description="Connect with pet owners in your area looking for quality care services for their furry friends. Our matching algorithm ensures you get clients that fit your services."
                        />
                        <FeatureCard
                            icon={CalendarCheck}
                            title="Easy Appointment Management"
                            description="Our intuitive platform helps you manage bookings, schedules, and client communications all in one place. Never double-book or miss an appointment again."
                        />
                        <FeatureCard
                            icon={CreditCard}
                            title="Zero Setup Cost"
                            description="Get started without any upfront investment. We only earn when you do, with our fair commission structure designed to help your business grow."
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Verified Pet Owners"
                            description="All pet owners on our platform are verified, ensuring you work with reliable clients who value quality pet care services."
                        />
                        <FeatureCard
                            icon={BarChart}
                            title="Business Analytics"
                            description="Access detailed reports and analytics to understand your business performance and identify growth opportunities."
                        />
                        <FeatureCard
                            icon={MessageSquare}
                            title="Client Communication"
                            description="Built-in messaging system allows for seamless communication with pet owners before, during, and after service."
                        />
                    </div>
                </div>
            </section>

            {/* How It Works Section - New */}
            <section className="py-20 px-4 bg-white">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="inline-block px-4 py-1.5 bg-[#121d28]/10 text-[#121d28] rounded-full text-sm font-medium mb-4">
                                HOW IT WORKS
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#121d28] mb-6">
                                Simple Process to Start Growing Your Business
                            </h2>
                            <p className="text-gray-600 mb-10">
                                Getting started with FluffyCare is easy. Follow these simple steps to begin expanding your pet care
                                business today.
                            </p>

                            <div className="space-y-2">
                                <ProcessStep
                                    number="1"
                                    title="Create Your Profile"
                                    description="Sign up and build your professional profile showcasing your services, experience, and availability."
                                />
                                <ProcessStep
                                    number="2"
                                    title="Set Your Services & Rates"
                                    description="Define what services you offer, your service area, and set competitive rates that work for your business."
                                />
                                <ProcessStep
                                    number="3"
                                    title="Get Matched With Pet Owners"
                                    description="Our algorithm connects you with pet owners seeking your specific services in your area."
                                />
                                <ProcessStep
                                    number="4"
                                    title="Provide Great Service & Grow"
                                    description="Deliver excellent care, collect reviews, and watch your business expand through our platform."
                                    isLast={true}
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    src={serviceGirl}
                                    alt="FluffyCare app demonstration"
                                    className="w-full h-auto"
                                />
                            </div>
                            <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-[#cbab74] rounded-full p-6 shadow-xl">
                                <Smartphone className="h-8 w-8 text-[#121d28]" />
                            </div>
                            <div className="absolute bottom-1/4 right-0 transform translate-x-1/3 bg-[#121d28] rounded-full p-5 shadow-xl">
                                <Settings className="h-7 w-7 text-[#cbab74]" />
                            </div>
                            <div className="absolute -bottom-6 left-1/4 transform -translate-x-1/2 bg-white rounded-lg p-4 shadow-xl border border-gray-100">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-[#cbab74]/20 rounded-full p-2">
                                        <Clock className="h-5 w-5 text-[#cbab74]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Success Stories Section - Enhanced with modern cards */}
            <section className="py-20 px-4 bg-[#121d28]/5">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-[#121d28]/10 text-[#121d28] rounded-full text-sm font-medium mb-4">
                            SUCCESS STORIES
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#121d28] mb-4">Hear From Our Successful Vendors</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            These pet care professionals have transformed their businesses with FluffyCare
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        <TestimonialCard
                            image="https://www.travenix.com/wp-content/uploads/2023/12/Dogzadda.jpg"
                            quote="Since joining FluffyCare, my dog walking business has grown by 70%. The platform makes scheduling and payments seamless."
                            name="Sarah Johnson"
                            role="Happy Paws Dog Walking, Chicago"
                        />
                        <TestimonialCard
                            image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQox4RG8HdecP349IfMgG2dQZg7gvzyY7JL75H1q0FPiwZE_lwlyuzeEIo59k3ccaL8Kmo&usqp=CAU"
                            quote="FluffyCare transformed my small grooming salon into a thriving business. The exposure to new clients has been game-changing."
                            name="Marcus Chen"
                            role="Pristine Pets Grooming, San Francisco"
                        />
                        <TestimonialCard
                            image="https://t4.ftcdn.net/jpg/05/84/45/67/240_F_584456742_A7CPueb91bV08wOwRkKKrxNUagaYOHXU.jpg"
                            quote="As a pet sitter, I've doubled my client base in just 3 months. The platform handles all the admin work I used to struggle with."
                            name="Jessica Williams"
                            role="Cozy Pet Sitting, Austin"
                        />
                        <TestimonialCard
                            image="https://t3.ftcdn.net/jpg/06/33/49/50/240_F_633495027_t3vBhGC6moxs6LUodwt0rIMt160ztHdX.jpg"
                            quote="The business analytics tools helped me understand which services were most profitable. I've increased revenue by 45%."
                            name="David Rodriguez"
                            role="Elite Pet Training, Miami"
                        />
                    </div>

                    <div className="mt-16 text-center">
                        <Button className="bg-[#121d28] hover:bg-[#121d28]/90 text-white px-8 py-6 rounded-full">
                            Read More Success Stories
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Pricing Section - New */}
            <section className="py-20 px-4 bg-white">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-[#121d28]/10 text-[#121d28] rounded-full text-sm font-medium mb-4">
                            PRICING
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#121d28] mb-4">Simple, Transparent Pricing</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Choose the plan that works best for your pet care business
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <PricingPlan
                            title="Basic"
                            price="0"
                            features={[
                                "Profile listing",
                                "Up to 5 bookings per month",
                                "Basic analytics",
                                "Email support",
                                "10% service fee",
                            ]}
                            ctaText="Start Free"
                        />
                        <PricingPlan
                            title="Professional"
                            price="29"
                            features={[
                                "Enhanced profile listing",
                                "Unlimited bookings",
                                "Advanced analytics",
                                "Priority support",
                                "5% service fee",
                                "Client management tools",
                            ]}
                            isPopular={true}
                        />
                        <PricingPlan
                            title="Business"
                            price="79"
                            features={[
                                "Premium profile placement",
                                "Unlimited bookings",
                                "Comprehensive analytics",
                                "24/7 dedicated support",
                                "3% service fee",
                                "Marketing tools & promotion",
                                "Multiple staff accounts",
                            ]}
                        />
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-gray-500">
                            All plans include secure payments, client messaging, and calendar management
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Showcase - New */}
            <section className="py-20 px-4 bg-gradient-to-b from-[#121d28] to-[#1a2a3a] text-white">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-white/10 text-white rounded-full text-sm font-medium mb-4">
                            POWERFUL FEATURES
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            Our comprehensive platform provides all the tools you need to manage and grow your pet care business
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1">
                            <div className="space-y-10">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-12 w-12 rounded-lg bg-[#cbab74] flex items-center justify-center">
                                            <CalendarCheck className="h-6 w-6 text-[#121d28]" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Smart Scheduling</h3>
                                        <p className="text-gray-300">
                                            Intelligent calendar system that prevents double-bookings and optimizes your daily route between
                                            clients.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-12 w-12 rounded-lg bg-[#cbab74] flex items-center justify-center">
                                            <DollarSign className="h-6 w-6 text-[#121d28]" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
                                        <p className="text-gray-300">
                                            Automated billing and payment processing with instant deposits and detailed financial reporting.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-12 w-12 rounded-lg bg-[#cbab74] flex items-center justify-center">
                                            <Award className="h-6 w-6 text-[#121d28]" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Reputation Management</h3>
                                        <p className="text-gray-300">
                                            Collect and showcase reviews from satisfied clients to build trust and attract new business.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-12 w-12 rounded-lg bg-[#cbab74] flex items-center justify-center">
                                            <Zap className="h-6 w-6 text-[#121d28]" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Marketing Tools</h3>
                                        <p className="text-gray-300">
                                            Automated marketing campaigns, promotional tools, and client retention strategies to grow your
                                            business.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 md:order-2 relative">
                            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                                <img
                                    src={careImage}
                                    alt="FluffyCare professional pet care in action"
                                    className="w-full h-auto object-cover rounded-2xl"
                                />
                            </div>
                            <div className="absolute -top-6 -right-6 w-full h-full rounded-2xl border border-[#cbab74]/30"></div>
                            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-[#cbab74]/20 backdrop-blur-xl"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section - New */}
            <section className="py-20 px-4 bg-white">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-[#121d28]/10 text-[#121d28] rounded-full text-sm font-medium mb-4">
                            FAQ
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#121d28] mb-4">Frequently Asked Questions</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Everything you need to know about becoming a FluffyCare vendor
                        </p>
                    </div>

                    <div className="space-y-1">
                        <FAQItem
                            question="How much does it cost to join FluffyCare?"
                            answer="Joining FluffyCare is completely free. We offer a Basic plan with no monthly fees, where we only take a 10% service fee on completed bookings. For more features and lower service fees, you can upgrade to our Professional or Business plans."
                        />
                        <FAQItem
                            question="How do I receive payments for my services?"
                            answer="All payments are processed securely through our platform. Clients pay through the app, and funds are automatically transferred to your linked bank account within 2 business days after service completion."
                        />
                        <FAQItem
                            question="Can I set my own prices and availability?"
                            answer="You have complete control over your pricing, service offerings, and availability. You can set different rates for different services, add peak time surcharges, and block off times when you're unavailable."
                        />
                        <FAQItem
                            question="What happens if a client cancels a booking?"
                            answer="Our cancellation policy protects vendors. If a client cancels within 24 hours of the scheduled service, you'll receive a 50% payment. Cancellations with less than 4 hours notice result in full payment to you."
                        />
                        <FAQItem
                            question="Do I need insurance to join FluffyCare?"
                            answer="While not required for basic services, we strongly recommend professional liability insurance. For certain premium services, proof of insurance may be required. We offer discounted insurance packages through our partners."
                        />
                        <FAQItem
                            question="How does FluffyCare help me find new clients?"
                            answer="Our platform uses a sophisticated matching algorithm to connect you with pet owners seeking your specific services in your area. We also provide marketing tools, promotional opportunities, and a referral program to help grow your client base."
                        />
                    </div>
                </div>
            </section>

            {/* Final CTA Section - Enhanced */}
            <section className="py-20 px-4 bg-[#121d28] text-white">
                <div className="container mx-auto max-w-5xl">
                    <div className="relative">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 rounded-full bg-[#cbab74]/20 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-60 h-60 rounded-full bg-[#cbab74]/10 blur-3xl"></div>

                        <div className="relative z-10 text-center">
                            <span className="inline-block px-4 py-1.5 bg-white/10 text-white rounded-full text-sm font-medium mb-4">
                                GET STARTED TODAY
                            </span>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Transform Your Pet Care Business?</h2>
                            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
                                Join our community of professional pet care providers and start expanding your client base today. The
                                future of pet care is here.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Button
                                    size="lg"
                                    className="bg-[#cbab74] hover:bg-[#cbab74]/90 text-[#121d28] font-medium px-10 py-6 text-lg rounded-full"
                                >
                                    Become a Vendor
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white text-black hover:bg-white/10 px-10 py-6 text-lg rounded-full"
                                >
                                    Schedule a Demo
                                </Button>
                            </div>
                            <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8">
                                <div className="flex items-center">
                                    <div className="flex -space-x-4">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="w-12 h-12 rounded-full border-2 border-[#121d28] overflow-hidden">
                                                <img
                                                    src={`/placeholder.svg?height=100&width=100&text=${i + 1}`}
                                                    alt={`Vendor ${i + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="ml-4 text-gray-300">Joined this month</p>
                                </div>
                                <div className="h-10 border-l border-white/20 hidden md:block"></div>
                                <div className="flex items-center gap-2">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 text-[#cbab74] fill-[#cbab74]" />
                                        ))}
                                    </div>
                                    <p className="text-gray-300">4.9/5 vendor satisfaction</p>
                                </div>
                            </div>
                            <p className="mt-8 text-sm text-gray-400">
                                No contracts. No setup fees. Start growing your business today.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
