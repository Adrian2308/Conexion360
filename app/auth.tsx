import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../supabaseClient";

export default function AuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const newId = uuidv4();

      // Crear perfil en la tabla "profiles"
      const { error } = await supabase.from("profiles").upsert(
        [
          {
            id: newId,
            user_id: newId,
            email: email.trim(),
            name: "",
            bio: "",
            photo_url: "",
          },
        ],
        { onConflict: "user_id" }
      );

      if (error) {
        Alert.alert("Error al crear usuario", error.message);
        setLoading(false);
        return;
      }

      setLoading(false);

      // Ir a completar perfil
      router.replace({
        pathname: "/complete-profile",
        params: { userId: newId },
      } as any);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo crear el usuario");
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator size="large" color="#E1006F" style={{ marginTop: 16 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: "#E1006F", padding: 14, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
