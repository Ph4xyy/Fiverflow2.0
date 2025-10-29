import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Bot
} from 'lucide-react'

interface AdminNavigationProps {
  className?: string
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({ className = '' }) => {
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
    <nav className={`bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 ${className}`}>
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Admin
          </h2>
        </div>

        <div className="space-y-1">
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
                  className={`w-4 h-4 mr-3 ${
                    active 
                      ? 'text-gray-600 dark:text-gray-300' 
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  }`} 
                />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default AdminNavigation
