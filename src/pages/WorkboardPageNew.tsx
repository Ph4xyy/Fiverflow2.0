import React, { useState } from 'react';
import Layout from '../components/Layout';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MoreHorizontal,
  Filter,
  Search,
  Calendar,
  User,
  Flag,
  MessageSquare
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  dueDate: string;
  tags: string[];
  comments: number;
}

const WorkboardPageNew: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Refonte du design de la page d\'accueil',
      description: 'Moderniser l\'interface utilisateur selon les nouvelles directives',
      status: 'in_progress',
      priority: 'high',
      assignee: 'Marie Dubois',
      dueDate: '2024-01-20',
      tags: ['Design', 'Frontend'],
      comments: 3
    },
    {
      id: '2',
      title: 'Optimisation des performances',
      description: 'Réduire le temps de chargement des pages',
      status: 'todo',
      priority: 'medium',
      assignee: 'Pierre Martin',
      dueDate: '2024-01-25',
      tags: ['Performance', 'Backend'],
      comments: 1
    },
    {
      id: '3',
      title: 'Tests d\'intégration',
      description: 'Valider le fonctionnement des nouvelles fonctionnalités',
      status: 'review',
      priority: 'high',
      assignee: 'Sophie Leroy',
      dueDate: '2024-01-18',
      tags: ['Testing', 'QA'],
      comments: 5
    },
    {
      id: '4',
      title: 'Documentation API',
      description: 'Mettre à jour la documentation des endpoints',
      status: 'done',
      priority: 'low',
      assignee: 'Alexandre Petit',
      dueDate: '2024-01-15',
      tags: ['Documentation', 'API'],
      comments: 0
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-500';
      case 'in_progress': return 'bg-blue-500';
      case 'review': return 'bg-yellow-500';
      case 'done': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'À faire';
      case 'in_progress': return 'En cours';
      case 'review': return 'En révision';
      case 'done': return 'Terminé';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 border-red-400';
      case 'high': return 'text-orange-400 border-orange-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'low': return 'text-green-400 border-green-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle size={16} />;
      case 'high': return <Flag size={16} />;
      case 'medium': return <Clock size={16} />;
      case 'low': return <CheckCircle2 size={16} />;
      default: return <Flag size={16} />;
    }
  };

  const columns = [
    { id: 'todo', title: 'À faire', color: 'border-gray-500' },
    { id: 'in_progress', title: 'En cours', color: 'border-blue-500' },
    { id: 'review', title: 'En révision', color: 'border-yellow-500' },
    { id: 'done', title: 'Terminé', color: 'border-green-500' }
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Workboard</h1>
            <p className="text-gray-400">Gérez vos tâches et projets efficacement</p>
          </div>
          <div className="flex gap-3">
            <ModernButton variant="outline" size="sm">
              <Filter size={16} className="mr-2" />
              Filtres
            </ModernButton>
            <ModernButton size="sm">
              <Plus size={16} className="mr-2" />
              Nouvelle Tâche
            </ModernButton>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {columns.map(column => {
            const taskCount = getTasksByStatus(column.id).length;
            return (
              <ModernCard key={column.id}>
                <div className="relative">
                  <div>
                    <p className="text-sm text-gray-400">{column.title}</p>
                    <p className="text-2xl font-bold text-white">{taskCount}</p>
                  </div>
                  <div className="absolute top-0 right-0 opacity-50">
                    {column.id === 'todo' && <Clock size={20} className="text-gray-400" />}
                    {column.id === 'in_progress' && <Clock size={20} className="text-gray-400" />}
                    {column.id === 'review' && <AlertTriangle size={20} className="text-gray-400" />}
                    {column.id === 'done' && <CheckCircle2 size={20} className="text-gray-400" />}
                  </div>
                </div>
              </ModernCard>
            );
          })}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {columns.map(column => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{column.title}</h3>
                <span className="text-sm text-gray-400 bg-[#35414e] px-2 py-1 rounded-full">
                  {getTasksByStatus(column.id).length}
                </span>
              </div>
              
              <div className="space-y-3 min-h-[400px]">
                {getTasksByStatus(column.id).map(task => (
                  <ModernCard key={task.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-semibold text-white leading-tight">
                          {task.title}
                        </h4>
                        <button className="p-1 hover:bg-[#35414e] rounded">
                          <MoreHorizontal size={16} className="text-gray-400" />
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-xs bg-[#35414e] text-gray-300 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Priority */}
                      <div className={`flex items-center gap-1 text-xs border rounded px-2 py-1 w-fit ${getPriorityColor(task.priority)}`}>
                        {getPriorityIcon(task.priority)}
                        <span className="capitalize">{task.priority}</span>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#35414e]">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#9c68f2] rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">
                              {task.assignee.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">{task.assignee}</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar size={12} />
                            {formatDate(task.dueDate)}
                          </div>
                          
                          {task.comments > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <MessageSquare size={12} />
                              {task.comments}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </ModernCard>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <ModernCard title="Actions rapides" icon={<Plus size={20} className="text-white" />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ModernButton variant="outline" className="h-16 flex-col">
              <Plus size={20} />
              <span className="mt-1">Nouvelle tâche</span>
            </ModernButton>
            <ModernButton variant="outline" className="h-16 flex-col">
              <Calendar size={20} />
              <span className="mt-1">Planifier</span>
            </ModernButton>
            <ModernButton variant="outline" className="h-16 flex-col">
              <User size={20} />
              <span className="mt-1">Assigner</span>
            </ModernButton>
          </div>
        </ModernCard>
      </div>
    </Layout>
  );
};

export default WorkboardPageNew;
