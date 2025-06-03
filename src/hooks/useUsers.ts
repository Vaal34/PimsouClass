import { useQuery } from '@tanstack/react-query'

// Type pour un utilisateur de JSONPlaceholder
export interface User {
  id: number
  name: string
  username: string
  email: string
  address: {
    street: string
    suite: string
    city: string
    zipcode: string
    geo: {
      lat: string // Latitude géographique
      lng: string // Longitude géographique
    }
  }
  phone: string // Numéro de téléphone
  website: string // Site web personnel
  company: {
    name: string
    catchPhrase: string
    bs: string
  }
}

// Hook pour récupérer tous les utilisateurs
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      const response = await fetch('https://jsonplaceholder.typicode.com/users')
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
} 