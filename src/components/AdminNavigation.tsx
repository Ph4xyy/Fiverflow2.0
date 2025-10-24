import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Bot,
  Settings,
  Shield,
  ChevronRight
} from 'lucide-react'

interface AdminNavigationProps {
  className?: string
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({ className = '' }) => {
  const location = useLocation()

  const navigationItems = [
    {
      name: 'Tableau de bord',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      description: 'Vue d\'ensemble des statistiques'
    },
    {
      name: 'Utilisateurs',
      href: '/admin/users',
      icon: Users,
      description: 'Gestion des utilisateurs et rôles'
    },
    {
      name: 'Statistiques',
      href: '/admin/stats',
      icon: BarChart3,
      description: 'Analytics détaillées'
    },
    {
      name: 'Assistant IA',
      href: '/admin/ai',
      icon: Bot,
      description: 'Analyse intelligente des données'
    }
  ]

  const isActive = (href: string) => {
    return location.pathname === href
  }

  return (
    <nav className={`bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 ${className}`}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Shield className="text-white" size={16} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Administration
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Panel de contrôle
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon 
                    className={`w-5 h-5 ${
                      active 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }`} 
                  />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.description}
                    </div>
                  </div>
                </div>
                {active && (
                  <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                )}
              </Link>
            )
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              Accès sécurisé
            </p>
            <p>Réservé aux administrateurs et modérateurs</p>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default AdminNavigation
