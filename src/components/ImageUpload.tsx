import React, { useState, useRef } from 'react';
import { Camera, X, Upload, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (file: File) => Promise<string | null>;
  onImageRemove: () => Promise<boolean>;
  type: 'avatar' | 'banner';
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageChange,
  onImageRemove,
  type,
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAvatar = type === 'avatar';
  const sizeClass = isAvatar ? 'w-32 h-32' : 'w-full h-48';
  const roundedClass = isAvatar ? 'rounded-full' : 'rounded-lg';

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide.');
      return;
    }

    const maxSize = isAvatar ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB pour avatar, 10MB pour bannière
    if (file.size > maxSize) {
      alert(`Le fichier est trop volumineux. Taille maximale: ${isAvatar ? '5MB' : '10MB'}`);
      return;
    }

    // Créer une prévisualisation
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload du fichier
    setIsUploading(true);
    try {
      const result = await onImageChange(file);
      if (!result) {
        alert('Erreur lors de l\'upload de l\'image.');
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload de l\'image.');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setIsUploading(true);
    try {
      const success = await onImageRemove();
      if (success) {
        setPreviewUrl(null);
      } else {
        alert('Erreur lors de la suppression de l\'image.');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const displayUrl = previewUrl || currentImageUrl;

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-2 p-4">
          <Loader2 size={24} className="animate-spin text-white" />
          <span className="text-sm text-white">Upload...</span>
        </div>
      ) : displayUrl ? (
        <div className="flex flex-col items-center gap-2 p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white text-sm font-medium"
          >
            Changer l'image
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="px-4 py-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors text-white text-sm font-medium"
          >
            Supprimer
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 p-4">
          <Camera size={32} className="text-white" />
          <button
            onClick={handleClick}
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white text-sm font-medium"
          >
            {isAvatar ? 'Ajouter une photo' : 'Ajouter une bannière'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;