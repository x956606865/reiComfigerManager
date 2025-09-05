'use client'

import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { softwareDefinitions } from '@/lib/software-definitions'
import { SoftwareDefinition, SoftwareStatus } from '@/types/software'
import { SoftwareCard } from '@/components/software/SoftwareCard'
import { CategoryFilter } from '@/components/software/CategoryFilter'
import { Search } from 'lucide-react'

export default function SoftwarePage() {
  const [software, setSoftware] = useState<Array<{ definition: SoftwareDefinition; status: SoftwareStatus }>>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSoftwareList()
  }, [])

  const loadSoftwareList = async () => {
    try {
      // For now, use client-side definitions
      // In production, this would come from Tauri backend
      const softwareWithStatus = await Promise.all(
        softwareDefinitions.map(async (def) => {
          try {
            const status = await invoke<SoftwareStatus>('get_software_status', { 
              softwareId: def.id 
            })
            return { definition: def, status }
          } catch {
            // If backend call fails, use default status
            return {
              definition: def,
              status: {
                id: def.id,
                installed: false,
                configExists: false,
                configPath: undefined,
                version: undefined,
                lastModified: undefined
              }
            }
          }
        })
      )
      setSoftware(softwareWithStatus)
    } catch (error) {
      console.error('Failed to load software list:', error)
      // Use client-side definitions as fallback
      setSoftware(
        softwareDefinitions.map(def => ({
          definition: def,
          status: {
            id: def.id,
            installed: false,
            configExists: false,
            configPath: undefined,
            version: undefined,
            lastModified: undefined
          }
        }))
      )
    } finally {
      setLoading(false)
    }
  }

  const filteredSoftware = software.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.definition.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      item.definition.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definition.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const categories = ['all', ...Array.from(new Set(software.map(s => s.definition.category)))]

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Software Configuration</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage configurations for your installed software
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search software..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSoftware.map(item => (
            <SoftwareCard
              key={item.definition.id}
              software={item.definition}
              status={item.status}
            />
          ))}
        </div>
      )}

      {!loading && filteredSoftware.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No software found matching your criteria
          </p>
        </div>
      )}
    </div>
  )
}