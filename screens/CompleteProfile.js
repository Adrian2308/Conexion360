import { useState } from 'react';
import { Alert, Button, Image, TextInput, View } from 'react-native';
import { supabase } from '../supabaseClient';
import { pickAndUploadImage } from '../utils/imageUpload'; // 👈 importamos la función

export default function CompleteProfile({ navigation }) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  // función para elegir y subir imagen
  async function handleSelectImage() {
    try {
      setUploading(true);
      const imageUrl = await pickAndUploadImage();
      if (imageUrl) {
        setPhotoUrl(imageUrl);
      } else {
        Alert.alert('Error', 'No se pudo subir la imagen');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setUploading(false);
    }
  }

  // función para guardar perfil en Supabase
  async function saveProfile() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      Alert.alert('Error', userError.message);
      return;
    }

    const currentUser = userData.user;
    if (!currentUser) {
      Alert.alert('Error', 'No hay usuario logueado');
      return;
    }

    const { error } = await supabase.from('profiles').insert([
      {
        id: currentUser.id, // o 'user_id' si así lo nombraste en tu tabla
        name,
        bio,
        email: currentUser.email,
        avatar_url: photoUrl, // 👈 guardamos la URL de la foto
      },
    ]);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Perfil guardado', 'Tu perfil ha sido completado');
      navigation.replace('Home');
    }
  }

  return (
    <View style={{ padding: 20 }}>
      {/* Imagen seleccionada */}
      {photoUrl && (
        <Image
          source={{ uri: photoUrl }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            alignSelf: 'center',
            marginBottom: 10,
          }}
        />
      )}

      {/* Botón para subir imagen */}
      <Button
        title={uploading ? 'Subiendo...' : photoUrl ? 'Cambiar foto' : 'Seleccionar foto'}
        onPress={handleSelectImage}
        disabled={uploading}
      />

      <TextInput
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
        style={{ marginTop: 15, borderBottomWidth: 1, borderColor: '#ccc' }}
      />
      <TextInput
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
        style={{ marginTop: 15, borderBottomWidth: 1, borderColor: '#ccc' }}
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Guardar perfil" onPress={saveProfile} />
      </View>
    </View>
  );
}
