'use client'

interface CategoryFilterProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

const categoryLabels: Record<string, string> = {
  all: 'All Software',
  shell: 'Shells',
  editor: 'Editors',
  terminal: 'Terminals',
  vcs: 'Version Control',
  package_manager: 'Package Managers',
  tools: 'Tools',
}

export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${selectedCategory === category
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }
          `}
        >
          {categoryLabels[category] || category}
        </button>
      ))}
    </div>
  )
}