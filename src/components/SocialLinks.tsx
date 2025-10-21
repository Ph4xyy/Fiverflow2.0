import React from 'react';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Globe, 
  MessageCircle,
  ExternalLink
} from 'lucide-react';

interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

interface SocialLinksProps {
  socialNetworks: SocialLink[];
  className?: string;
}

const SocialLinks: React.FC<SocialLinksProps> = ({ 
  socialNetworks, 
  className = '' 
}) => {
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github':
        return <Github size={20} className="text-white" />;
      case 'linkedin':
        return <Linkedin size={20} className="text-white" />;
      case 'twitter':
        return <Twitter size={20} className="text-white" />;
      case 'discord':
        return <MessageCircle size={20} className="text-white" />;
      case 'website':
        return <Globe size={20} className="text-white" />;
      default:
        return <Globe size={20} className="text-white" />;
    }
  };

  const getSocialColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github':
        return 'bg-[#333] hover:bg-[#444]';
      case 'linkedin':
        return 'bg-[#0077b5] hover:bg-[#005885]';
      case 'twitter':
        return 'bg-[#1da1f2] hover:bg-[#0d8bd9]';
      case 'discord':
        return 'bg-[#7289da] hover:bg-[#5b6eae]';
      case 'website':
        return 'bg-[#6c757d] hover:bg-[#5a6268]';
      default:
        return 'bg-[#6c757d] hover:bg-[#5a6268]';
    }
  };

  const formatUrl = (url: string, platform: string) => {
    if (!url) return '';
    
    // Si l'URL commence déjà par http, la retourner telle quelle
    if (url.startsWith('http')) return url;
    
    // Sinon, ajouter le protocole approprié selon la plateforme
    switch (platform.toLowerCase()) {
      case 'github':
        return url.startsWith('github.com/') ? `https://${url}` : `https://github.com/${url}`;
      case 'linkedin':
        return url.startsWith('linkedin.com/') ? `https://${url}` : `https://linkedin.com/in/${url}`;
      case 'twitter':
        return url.startsWith('twitter.com/') ? `https://${url}` : `https://twitter.com/${url}`;
      case 'discord':
        return url.startsWith('discord.gg/') ? `https://${url}` : `https://discord.gg/${url}`;
      default:
        return url.startsWith('http') ? url : `https://${url}`;
    }
  };

  const getDisplayName = (url: string, platform: string) => {
    if (!url) return '';
    
    // Extraire le nom d'utilisateur ou le domaine
    try {
      const urlObj = new URL(formatUrl(url, platform));
      const pathname = urlObj.pathname;
      
      switch (platform.toLowerCase()) {
        case 'github':
        case 'twitter':
          return pathname.startsWith('/') ? pathname.slice(1) : pathname;
        case 'linkedin':
          return pathname.includes('/in/') ? pathname.split('/in/')[1] : pathname;
        case 'discord':
          return urlObj.hostname;
        default:
          return urlObj.hostname;
      }
    } catch {
      return url;
    }
  };

  // Filtrer les réseaux sociaux qui ont une URL
  const activeSocialNetworks = socialNetworks.filter(social => social.url && social.url.trim());

  if (activeSocialNetworks.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {activeSocialNetworks.map(social => (
        <a
          key={social.id}
          href={formatUrl(social.url, social.id)}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:scale-105 ${getSocialColor(social.id)}`}
        >
          <div className="flex-shrink-0">
            {getSocialIcon(social.id)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {getDisplayName(social.url, social.id)}
            </p>
            <p className="text-xs text-gray-300 capitalize">
              {social.name}
            </p>
          </div>
          <ExternalLink size={16} className="text-white/70 flex-shrink-0" />
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
