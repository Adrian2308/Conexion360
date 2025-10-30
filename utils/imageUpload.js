import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabaseClient';

// seleccionar y subir imagen
export async function pickAndUploadImage() {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
  });

  // En versiones recientes de Expo, la propiedad es 'canceled' (no 'cancelled')
  if (res.canceled) return null;

  // obtener URI de la imagen seleccionada
  const asset = res.assets[0];
  const response = await fetch(asset.uri);
  const blob = await response.blob();

  const fileName = `${Date.now()}.jpg`;

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, blob, { upsert: false });

  if (error) {
    console.error('Upload error', error);
    return null;
  }

  // obtener URL pública (si el bucket es público)
  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(data.path);

  return publicUrl;
}
