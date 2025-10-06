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

      // Vérifier la session utilisateur
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        toast.error('Vous devez être connecté pour uploader une image');
        return null;
      }

      // Générer un nom de fichier unique avec extension sécurisée
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
      const safeExt = fileExt.replace(/[^a-z0-9]/g, '') || 'png';
      const uniqueId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const fileName = `${userId}/${uniqueId}.${safeExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload du fichier
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || `image/${safeExt}`
        });

      if (uploadError) {
        console.error('Erreur upload:', uploadError);
        
        // Gestion spécifique des erreurs RLS
        if (uploadError.message.includes('row-level security policy')) {
          toast.error('Erreur de permissions: Les politiques RLS ne sont pas configurées. Utilisez le diagnostic pour corriger cela.');
        } else if (uploadError.message.includes('bucket not found')) {
          toast.error('Erreur: Le bucket n\'existe pas. Utilisez le diagnostic pour le créer.');
        } else {
          toast.error(`Erreur lors de l'upload de l'image: ${uploadError.message}`);
        }
        return null;
      }

      // Récupérer l'URL publique
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      toast.success('Image uploadée avec succès');
      return data.publicUrl;

    } catch (error: any) {
      console.error('Erreur upload image:', error);
      const errorMessage = error?.message || 'Erreur inconnue lors de l\'upload';
      toast.error(`Erreur lors de l'upload de l'image: ${errorMessage}`);
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

