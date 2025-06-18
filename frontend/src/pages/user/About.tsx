import type React from "react"
import { Users, Cat, Clock, Footprints, Star, ArrowRight } from "lucide-react"
import Header from "@/components/user/Header"
import Footer from "@/components/user/Footer"
import catFace from "@/assets/aboutPage/image.png"
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted")
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white h-200">
          <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 z-10 pl-4 md:pl-8 lg:pl-16">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase">ABOUT US</h1>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase mt-2 mb-6">
                OUR CORE BELIEFS, VALUES AND PROMISE
              </h2>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Peace of Mind Grooming.</span> 100% Safe for Your Beloved Pets.
              </p>
              <p className="text-gray-700 mb-6">
                Gentle, expert care with guaranteed well-being. Trust our dedicated team!
              </p>
              <a
                href="/book-now"
                className="inline-block bg-[#c5bc7d] hover:bg-[#b5ac6d] text-black font-medium py-3 px-6 rounded-md transition-colors"
              >
                Book Appointment
              </a>
            </div>
            <div className="md:w-1/2 relative mt-8 md:mt-0">
              <div className="w-full h-max md:absolute md:-right-66 -top-45 -rotate-90">
                {/* Semi Circle Design */}
                <div
                  className="hidden md:block bg-[#c5bc7d] w-[999px] h-[350px] relative -top-12"

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

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10">Customer Satisfaction Stats</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center text-center"
                >
                  <stat.icon className="h-8 w-8 mb-2 text-gray-700" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <a
                href="/team"
                className="inline-block border border-gray-300 text-gray-800 font-medium py-3 px-6 rounded-md hover:bg-gray-50 transition-colors"
              >
                View all Team Member
              </a>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-white px-4 md:px-8 lg:px-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Introducing Our Talented Team</h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Team Members */}
              {teamMembers.map((member, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-40 h-40 rounded-full overflow-hidden mb-4">
                    <img
                      src={`https://images.unsplash.com/photo-${1500000000000 + index}?w=160&h=160&fit=crop&crop=face`}
                      alt={member.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Role:</span> {member.role}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Experience:</span> {member.experience}
                  </p>
                  <p className="text-gray-600 text-sm text-center">
                    <span className="font-medium">Expertise:</span> {member.expertise}
                  </p>
                </div>
              ))}

              {/* Rating section - positioned in the grid */}
              <div className="flex flex-col md:col-start-3 md:row-start-1">
                <h3 className="text-xl text-gray-400 mb-2">Customer Ratings</h3>

                <div className="flex items-center mb-4">
                  <span className="text-4xl font-bold mr-2">4.9</span>
                  <Star className="h-6 w-6 text-yellow-400" />
                </div>

                <div className="space-y-2 mb-6">
                  {/* Rating 1 */}
                  <div className="flex items-center">
                    <span className="text-sm mr-2">1</span>
                    <div className="h-2 bg-gray-200 flex-grow rounded-full">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                    <span className="text-sm ml-2">0%</span>
                  </div>
                  {/* Rating 2 */}
                  <div className="flex items-center">
                    <span className="text-sm mr-2">2</span>
                    <div className="h-2 bg-gray-200 flex-grow rounded-full">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                    <span className="text-sm ml-2">0%</span>
                  </div>
                  {/* Rating 3 */}
                  <div className="flex items-center">
                    <span className="text-sm mr-2">3</span>
                    <div className="h-2 bg-gray-200 flex-grow rounded-full">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: "20%" }}></div>
                    </div>
                    <span className="text-sm ml-2">20%</span>
                  </div>
                  {/* Rating 4 */}
                  <div className="flex items-center">
                    <span className="text-sm mr-2">4</span>
                    <div className="h-2 bg-gray-200 flex-grow rounded-full">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: "45%" }}></div>
                    </div>
                    <span className="text-sm ml-2">45%</span>
                  </div>
                  {/* Rating 5 */}
                  <div className="flex items-center">
                    <span className="text-sm mr-2">5</span>
                    <div className="h-2 bg-gray-200 flex-grow rounded-full">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: "70%" }}></div>
                    </div>
                    <span className="text-sm ml-2">70%</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">Click the button to add a review.</p>
                <button className="text-blue-500 text-sm flex items-center">+ Add Review</button>
              </div>

            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-white px-4 md:px-8 lg:px-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h2 className="text-3xl font-bold mb-1">What People Say</h2>
                <h3 className="text-2xl text-[#c5bc7d] font-semibold mb-6">About Our Company</h3>

                <p className="text-gray-700 mb-6">
                  Lorem ipsum dolor sit amet consectetur. Tempor vulputate adipiscing suscipit pellentesque orci quam
                  dis venenatis. Arcu pulvinar eget ac sit nullam aenean quam consectetur. Quam blandit diam blandit
                  duis nisi magna id sit morbi. Dictum volutpat tempus facilisi eget. Vel lorem qui accumsan sagittis
                  elementum. Vulputate orci pellentesque sit tempus nisi arcu vel elementum. Blandit turpis molestie
                  gravida nunc risus malesuada.
                </p>

                <button className="bg-[#c5bc7d] hover:bg-[#b5ac6d] text-black font-medium py-3 px-6 rounded-md transition-colors">
                  Add Review
                </button>
              </div>

              <div className="md:w-1/2 md:pl-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop"
                      alt="Happy customer with pet"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop"
                      alt="Happy customer with pet"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-white px-4 md:px-8 lg:px-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12">
              Why Should <span className="text-gray-300">Choose Us</span>
            </h2>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face"
                      alt="Philip Adam"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h3 className="text-xl font-semibold">Philip Adam</h3>
                  <p className="text-gray-600 mb-6">(HR Manager)</p>

                  <p className="text-gray-700 text-sm text-center">
                    Lorem ipsum dolor sit amet consectetur. Tempor vulputate adipiscing suscipit pellentesque orci quam
                    nullam sit venenatis. Arcu pulvinar eget ac sit nullam aenean quam consequat. Diam aliquet duis
                    vitae magna id sit morbi.
                  </p>

                  <button className="flex items-center mt-6 border border-gray-300 rounded-full px-6 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                    Get a Quote <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="md:w-2/3">
                <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
                  <div className="col-span-1">
                    <label htmlFor="firstName" className="block text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      placeholder="Enter your first name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c5bc7d]"
                    />
                  </div>

                  <div className="col-span-1">
                    <label htmlFor="lastName" className="block text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      placeholder="Enter your last name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c5bc7d]"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="email" className="block text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter a valid email address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c5bc7d]"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="message" className="block text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder="Write your message here"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c5bc7d]"
                    ></textarea>
                  </div>

                  <div className="col-span-2">
                    <button
                      type="submit"
                      className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
                    >
                      Send Message
                    </button>
                  </div>
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
