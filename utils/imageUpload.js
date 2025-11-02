import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { supabase } from '../supabaseClient';

export async function pickAndUploadImage() {
  // Seleccionar imagen
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.7,
    base64: Platform.OS === 'web', // solo web necesita base64
  });

  if (result.canceled) return null;

  let fileUri;
  let fileBuffer;

  if (Platform.OS === 'web') {
    // Web: usar base64 directamente
    const base64 = result.assets[0].base64;
    fileBuffer = decode(base64);
    fileUri = `${Date.now()}.jpg`;
  } else {
    // Móvil: usar FileSystem
    fileUri = result.assets[0].uri;
    const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' });
    fileBuffer = decode(base64);
    fileUri = `${Date.now()}.jpg`;
  }

  // Subir a Supabase Storage
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileUri, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) {
    console.error('Upload error', error);
    return null;
  }

  // Obtener URL pública
  const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(data.path);
  return publicData.publicUrl;
}
