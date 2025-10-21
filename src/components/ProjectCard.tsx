import React, { useState, useEffect } from 'react';
import { Heart, Eye, ExternalLink, Calendar, User, Tag } from 'lucide-react';
import { ProjectsService, Project } from '../services/projectsService';
import { ActivityService } from '../services/activityService';

interface ProjectCardProps {
  project: Project;
  showAuthor?: boolean;
  authorName?: string;
  authorAvatar?: string;
  onLike?: (projectId: string) => void;
  onView?: (projectId: string) => void;
  isLiked?: boolean;
  className?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  showAuthor = false,
  authorName,
  authorAvatar,
  onLike,
  onView,
  isLiked = false,
  className = ''
}) => {
  const [likes, setLikes] = useState(project.likes_count);
  const [views, setViews] = useState(project.views_count);
  const [liked, setLiked] = useState(isLiked);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      await ProjectsService.likeProject(project.id, 'current-user-id');
      
      if (liked) {
        setLikes(prev => Math.max(0, prev - 1));
        setLiked(false);
      } else {
        setLikes(prev => prev + 1);
        setLiked(true);
        await ActivityService.logProjectLiked(project.id, project.title);
      }
      
      onLike?.(project.id);
    } catch (error) {
      console.error('Erreur lors du like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async () => {
    try {
      await ProjectsService.viewProject(project.id, 'current-user-id');
      setViews(prev => prev + 1);
      onView?.(project.id);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la vue:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div 
      className={`bg-[#1e2938] border border-[#35414e] rounded-xl overflow-hidden hover:border-[#9c68f2]/50 transition-all duration-300 ${className}`}
      onClick={handleView}
    >
      {/* Image du projet */}
      {project.image_url && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={project.image_url} 
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <div className="p-6">
        {/* Header avec auteur si nécessaire */}
        {showAuthor && authorName && (
          <div className="flex items-center gap-3 mb-4">
            {authorAvatar ? (
              <img 
                src={authorAvatar} 
                alt={authorName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#9c68f2] flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-white">{authorName}</p>
              <p className="text-xs text-gray-400">{formatDate(project.created_at)}</p>
            </div>
          </div>
        )}

        {/* Titre et description */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
            {project.title}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-3">
            {project.description}
          </p>
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-[#35414e] text-gray-300 text-xs rounded-full"
              >
                <Tag size={12} />
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{project.tags.length - 3} autres
              </span>
            )}
          </div>
        )}

        {/* Stats et actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              disabled={isLoading}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                liked 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-[#35414e] text-gray-400 hover:text-white hover:bg-[#9c68f2]/20'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart size={16} className={liked ? 'fill-current' : ''} />
              <span className="text-sm font-medium">{likes}</span>
            </button>

            <div className="flex items-center gap-2 text-gray-400">
              <Eye size={16} />
              <span className="text-sm">{views}</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              // Ouvrir le projet dans une nouvelle fenêtre ou modal
            }}
            className="flex items-center gap-2 px-3 py-2 bg-[#9c68f2] text-white rounded-lg hover:bg-[#8b5cf6] transition-colors"
          >
            <ExternalLink size={16} />
            <span className="text-sm">Voir</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
