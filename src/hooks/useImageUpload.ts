import { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface UseImageUploadProps {
  bucketName: string;
  folder?: string;
}

export const useImageUpload = ({ bucketName, folder = 'uploads' }: UseImageUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File, userId: string): Promise<string | null> => {
    if (!supabase) {
      toast.error('Supabase non configuré');
      return null;
    }

    try {
      setUploading(true);

      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload du fichier
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erreur upload:', uploadError);
        toast.error('Erreur lors de l\'upload de l\'image');
        return null;
      }

      // Récupérer l'URL publique
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      toast.success('Image uploadée avec succès');
      return data.publicUrl;

    } catch (error) {
      console.error('Erreur upload image:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    if (!supabase) {
      return false;
    }

    try {
      // Extraire le chemin du fichier depuis l'URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex(part => part === bucketName);
      
      if (bucketIndex === -1) {
        console.error('Impossible de trouver le bucket dans l\'URL');
        return false;
      }

      const filePath = pathParts.slice(bucketIndex + 1).join('/');

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Erreur suppression:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur suppression image:', error);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading
  };
};
