import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Bot
} from 'lucide-react'

interface AdminTopNavigationProps {
  className?: string
}

const AdminTopNavigation: React.FC<AdminTopNavigationProps> = ({ className = '' }) => {
  const location = useLocation()

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Utilisateurs',
      href: '/admin/users',
      icon: Users
    },
    {
      name: 'Statistiques',
      href: '/admin/stats',
      icon: BarChart3
    },
    {
      name: 'IA',
      href: '/admin/ai',
      icon: Bot
    }
  ]

  const isActive = (href: string) => {
    return location.pathname === href
  }

  return (
    <nav className={`bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 ${className}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h1>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon 
                    className={`w-4 h-4 mr-2 ${
                      active 
                        ? 'text-gray-600 dark:text-gray-300' 
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }`} 
                  />
                  <span className="hidden sm:block">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default AdminTopNavigation
