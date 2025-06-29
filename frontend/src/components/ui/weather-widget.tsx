import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  Wind, 
  Droplets, 
  Eye,
  Thermometer,
  MapPin
} from "lucide-react"
import { useState, useEffect } from "react"

interface WeatherData {
  location: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  visibility: number
  uvIndex: number
  icon: React.ReactNode
  recommendation: string
}

const weatherConditions = [
  {
    condition: "Sunny",
    icon: <Sun className="h-6 w-6 text-yellow-500" />,
    recommendation: "Perfect for outdoor pet activities!"
  },
  {
    condition: "Partly Cloudy",
    icon: <Cloud className="h-6 w-6 text-gray-500" />,
    recommendation: "Great weather for walks and training"
  },
  {
    condition: "Rainy",
    icon: <CloudRain className="h-6 w-6 text-blue-500" />,
    recommendation: "Indoor activities recommended"
  }
]

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData>({
    location: "Kochi, india",
    temperature: 72,
    condition: "Sunny",
    humidity: 65,
    windSpeed: 8,
    visibility: 10,
    uvIndex: 6,
    icon: <Sun className="h-6 w-6 text-yellow-500" />,
    recommendation: "Perfect for outdoor pet activities!"
  })

  // Simulate weather updates
  useEffect(() => {
    const interval = setInterval(() => {
      const conditions = weatherConditions
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]
      
      setWeather(prev => ({
        ...prev,
        temperature: Math.floor(Math.random() * 20) + 65, // 65-85°F
        humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
        windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 mph
        condition: randomCondition.condition,
        icon: randomCondition.icon,
        recommendation: randomCondition.recommendation
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getUVLevel = (uvIndex: number) => {
    if (uvIndex <= 2) return { level: "Low", color: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" }
    if (uvIndex <= 5) return { level: "Moderate", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400" }
    if (uvIndex <= 7) return { level: "High", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" }
    return { level: "Very High", color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" }
  }

  const uvLevel = getUVLevel(weather.uvIndex)

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 min-w-[280px]">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                {weather.location}
              </span>
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Main Weather */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/50 dark:bg-white/10 rounded-lg">
                {weather.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {weather.temperature}°F
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {weather.condition}
                </div>
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 p-2 bg-white/30 dark:bg-white/10 rounded-lg">
              <Droplets className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-100">{weather.humidity}%</div>
                <div className="text-blue-600 dark:text-blue-400">Humidity</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-white/30 dark:bg-white/10 rounded-lg">
              <Wind className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-100">{weather.windSpeed} mph</div>
                <div className="text-blue-600 dark:text-blue-400">Wind</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-white/30 dark:bg-white/10 rounded-lg">
              <Eye className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-100">{weather.visibility} mi</div>
                <div className="text-blue-600 dark:text-blue-400">Visibility</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-white/30 dark:bg-white/10 rounded-lg">
              <Thermometer className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-100">UV {weather.uvIndex}</div>
                <Badge className={`text-xs ${uvLevel.color} border-0`}>
                  {uvLevel.level}
                </Badge>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="p-3 bg-gradient-to-r from-blue-100/50 to-purple-100/50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
            <div className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
              Pet Care Tip
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-400">
              {weather.recommendation}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}