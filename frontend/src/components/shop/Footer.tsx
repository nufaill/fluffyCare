import type React from "react"
import { Heart, MapPin, Phone, Mail } from "lucide-react"

export interface FooterSection {
  title: string
  links: Array<{
    label: string
    href: string
    isNew?: boolean
  }>
}

export interface FooterProps {
  className?: string
  logoText?: string
  logoIcon?: React.ReactNode
  description?: string
  sections?: FooterSection[]
  contactInfo?: {
    address?: string[]
    phone?: string
    email?: string
  }
  socialLinks?: Array<{
    icon: React.ReactNode
    href: string
    label: string
    color?: string
  }>
}

export function Footer({
  className = "",
  logoText = "fluffyCare",
  logoIcon = "🐾",
  description = "Providing exceptional pet care services with love, dedication, and professional expertise. Your furry friends deserve the best care possible.",
  sections = [],
  contactInfo,
  socialLinks = [],
}: FooterProps) {
  return (
    <footer className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white ${className}`}>
      {/* Main Footer Content */}
      <div className="px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <span className="text-xl font-bold text-white">{logoIcon}</span>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {logoText}
                </span>
                <p className="text-sm text-gray-400">Pet Care Platform</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">{description}</p>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gray-800 hover:bg-gradient-to-r transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                      social.color || "hover:from-blue-500 hover:to-purple-500"
                    }`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Sections */}
          {sections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-white mb-4 text-lg">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">{link.label}</span>
                      {link.isNew && (
                        <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Information */}
          {contactInfo && (
            <div>
              <h3 className="font-semibold text-white mb-4 text-lg">Get in Touch</h3>
              <div className="space-y-4">
                {contactInfo.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-gray-300">
                      {contactInfo.address.map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                  </div>
                )}
                {contactInfo.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <a href={`tel:${contactInfo.phone}`} className="text-gray-300 hover:text-white transition-colors">
                      {contactInfo.phone}
                    </a>
                  </div>
                )}
                {contactInfo.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-purple-400 flex-shrink-0" />
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © 2024 {logoText}. All rights reserved. Made with <Heart className="inline h-4 w-4 text-red-400 mx-1" />
            for pets everywhere.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
