"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  actualTheme: "light" | "dark"
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  // Get system theme
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return "light"
  }

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme
    const initialTheme = savedTheme || "system"
    
    setThemeState(initialTheme)
    setMounted(true)
  }, [])

  // Update actual theme based on theme setting
  useEffect(() => {
    if (mounted) {
      let newActualTheme: "light" | "dark"
      
      if (theme === "system") {
        newActualTheme = getSystemTheme()
      } else {
        newActualTheme = theme as "light" | "dark"
      }
      
      setActualTheme(newActualTheme)
      
      // Apply theme to document
      const root = document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(newActualTheme)
      
      // Save to localStorage
      localStorage.setItem("theme", theme)
    }
  }, [theme, mounted])

  // Listen for system theme changes
  useEffect(() => {
    if (mounted && theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      
      const handleChange = () => {
        setActualTheme(getSystemTheme())
        const root = document.documentElement
        root.classList.remove("light", "dark")
        root.classList.add(getSystemTheme())
      }
      
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    if (theme === "light") {
      setThemeState("dark")
    } else if (theme === "dark") {
      setThemeState("system")
    } else {
      setThemeState("light")
    }
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  // Prevent hydration mismatch by showing loading state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
