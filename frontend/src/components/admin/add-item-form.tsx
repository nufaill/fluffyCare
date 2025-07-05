import type React from "react"

import { useState } from "react"
import { Plus, Save, X } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AddItemFormProps {
  title: string
  placeholder: string
  onAdd: (name: string) => void
  icon?: React.ReactNode
}

export function AddItemForm({ title, placeholder, onAdd, icon }: AddItemFormProps) {
  const [newItem, setNewItem] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [showAddForm, setShowAddForm] = useState<boolean>(false)

  const handleAdd = () => {
    if (!newItem.trim()) {
      setError(`${title.split(" ")[1]} name is required`)
      return
    }

    onAdd(newItem.trim())
    setNewItem("")
    setError("")
    setShowAddForm(false)
  }

  return (
    <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-black dark:bg-white rounded-lg">
              {icon || <Plus className="h-4 w-4 text-white dark:text-black" />}
            </div>
            <span className="text-black dark:text-white">{title}</span>
          </div>
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add {title.split(" ")[1]}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      {showAddForm && (
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                value={newItem}
                onChange={(e) => {
                  setNewItem(e.target.value)
                  setError("")
                }}
                placeholder={placeholder}
                className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAdd()
                  }
                }}
              />
              {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAdd}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setNewItem("")
                  setError("")
                }}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
