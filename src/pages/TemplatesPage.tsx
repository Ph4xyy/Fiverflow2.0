import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, Search, Copy, Edit, Trash2, Eye } from 'lucide-react';

const TemplatesPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const templates = [
    {
      id: 1,
      title: 'Project Completion Notice',
      content: 'Hi [CLIENT_NAME], I\'m excited to let you know that your [PROJECT_TYPE] project has been completed! Please review the deliverables and let me know if you need any revisions.',
      category: 'Project Updates',
      lastUsed: '2024-01-10',
      usageCount: 15
    },
    {
      id: 2,
      title: 'Initial Project Discussion',
      content: 'Hello [CLIENT_NAME], Thank you for choosing my services! I\'d love to discuss your [PROJECT_TYPE] project in more detail. When would be a good time for a quick call?',
      category: 'Client Onboarding',
      lastUsed: '2024-01-08',
      usageCount: 23
    },
    {
      id: 3,
      title: 'Revision Request Response',
      content: 'Hi [CLIENT_NAME], I\'ve received your revision request for the [PROJECT_TYPE]. I\'ll implement the changes and have the updated version ready by [DEADLINE].',
      category: 'Revisions',
      lastUsed: '2024-01-05',
      usageCount: 8
    },
    {
      id: 4,
      title: 'Payment Reminder',
      content: 'Hello [CLIENT_NAME], This is a friendly reminder that the payment for your [PROJECT_TYPE] project is due on [DUE_DATE]. Please let me know if you have any questions.',
      category: 'Billing',
      lastUsed: '2024-01-03',
      usageCount: 5
    },
  ];

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [...new Set(templates.map(t => t.category))];

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('templates.title')}</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">{t('templates.subtitle')}</p>
          </div>
          <button className="mt-4 sm:mt-0 inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={16} className="mr-2" />
{t('templates.new.template')}
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
placeholder={t('templates.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>All Categories</option>
              {categories.map(category => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 min-w-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 truncate">{template.title}</h3>
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {template.category}
                  </span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4 flex-shrink-0">
                  <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                    <Eye size={14} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50">
                    <Copy size={14} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                    <Edit size={14} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 text-xs sm:text-sm break-words">
                  {template.content}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-gray-500 pt-4 border-t border-gray-100 gap-1 sm:gap-0">
                <span>Used {template.usageCount} times</span>
                <span>Last used: {new Date(template.lastUsed).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Template Variables Help */}
        <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3">Template Variables</h3>
          <p className="text-sm sm:text-base text-blue-800 mb-4">Use these variables in your templates to automatically insert client-specific information:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg p-2 sm:p-3 min-w-0">
              <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">[CLIENT_NAME]</code>
              <p className="text-gray-600 text-xs mt-1">Client's name</p>
            </div>
            <div className="bg-white rounded-lg p-2 sm:p-3 min-w-0">
              <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">[PROJECT_TYPE]</code>
              <p className="text-gray-600 text-xs mt-1">Type of project</p>
            </div>
            <div className="bg-white rounded-lg p-2 sm:p-3 min-w-0">
              <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">[DEADLINE]</code>
              <p className="text-gray-600 text-xs mt-1">Project deadline</p>
            </div>
            <div className="bg-white rounded-lg p-2 sm:p-3 min-w-0">
              <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">[DUE_DATE]</code>
              <p className="text-gray-600 text-xs mt-1">Payment due date</p>
            </div>
            <div className="bg-white rounded-lg p-2 sm:p-3 min-w-0">
              <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">[AMOUNT]</code>
              <p className="text-gray-600 text-xs mt-1">Project amount</p>
            </div>
            <div className="bg-white rounded-lg p-2 sm:p-3 min-w-0">
              <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">[PLATFORM]</code>
              <p className="text-gray-600 text-xs mt-1">Client's platform</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TemplatesPage;