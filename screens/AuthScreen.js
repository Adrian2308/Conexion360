import { useState } from 'react';
import { Alert, Button, TextInput, View } from 'react-native';
import { supabase } from '../supabaseClient';

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSignUp() {
    const { user, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      // después de registrarse pedimos completar perfil
      navigation.replace('CompleteProfile', { user });
    }
  }

  async function handleSignIn() {
    const { user, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      navigation.replace('Home');
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput placeholder="Contraseña" value={password} secureTextEntry onChangeText={setPassword} />
      <Button title="Registrarse" onPress={handleSignUp} />
      <Button title="Iniciar sesión" onPress={handleSignIn} />
    </View>
  );
}
