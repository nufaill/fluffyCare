export interface Pet {
  id: string
  userId: string
  petCategoryId: string
  profileImage: string
  name: string
  breed: string
  age: number
  gender: "Male" | "Female"
  weight: number
  additionalNotes: string
  friendlyWithPets: boolean
  friendlyWithOthers: boolean
  trainedBefore: boolean
  vaccinationStatus: boolean
  medication: string
  createdAt: Date
  updatedAt: Date
}

