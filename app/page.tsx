'use client'

import { useRouter } from 'next/navigation'
import { Settings, FolderOpen, Clock, FileText, ArrowRight } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  const features = [
    {
      icon: Settings,
      title: 'Software Configuration',
      description: 'Manage configurations for popular development tools',
      action: () => router.push('/software'),
      color: 'bg-blue-500',
    },
    {
      icon: FolderOpen,
      title: 'Project Configs',
      description: 'Handle environment variables and project settings',
      action: () => router.push('/projects'),
      color: 'bg-green-500',
    },
    {
      icon: Clock,
      title: 'Version History',
      description: 'Track changes and restore previous configurations',
      action: () => router.push('/history'),
      color: 'bg-purple-500',
    },
    {
      icon: FileText,
      title: 'Templates',
      description: 'Use and create configuration templates',
      action: () => router.push('/templates'),
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Rei Config Manager</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Your unified solution for managing configuration files
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div
              key={index}
              onClick={feature.action}
              className="group cursor-pointer p-6 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${feature.color} text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-primary">
                    <span className="text-sm font-medium">Get Started</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-8">
        <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Multi-Format Support</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              JSON, YAML, TOML, INI, XML, .env and more
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Smart Editor</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Intelligent form fields based on configuration type
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Version Control</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatic backups with easy restore options
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Powered by Tauri and Next.js • Version 0.1.0
        </p>
      </div>
    </div>
  )
}