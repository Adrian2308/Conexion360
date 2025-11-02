import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../supabaseClient";
import { pickAndUploadImage } from "../utils/imageUpload";

export default function CompleteProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = params.userId as string;

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) console.error(error);
      else if (data) {
        setName(data.name || "");
        setBio(data.bio || "");
        setAvatarUrl(data.photo_url || "");
      }
    };
    fetchProfile();
  }, [userId]);

  const handleImage = async () => {
    const url = await pickAndUploadImage();
    if (url) setAvatarUrl(url);
  };

  const saveProfile = async () => {
    if (!userId) return Alert.alert("Error", "Usuario no válido");
    if (!name.trim()) return Alert.alert("Error", "Debes ingresar un nombre");

    const { error } = await supabase
      .from("profiles")
      .update({ name, bio, photo_url: avatarUrl })
      .eq("user_id", userId);

    if (error) Alert.alert("Error", error.message);
    else router.replace({ pathname: "/home", params: { userId } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completa tu Perfil</Text>

      <TouchableOpacity style={styles.avatarContainer} onPress={handleImage}>
        {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.avatar} /> : <Text style={styles.avatarPlaceholder}>Selecciona Foto</Text>}
      </TouchableOpacity>

      <TextInput placeholder="Nombre" style={styles.input} value={name} onChangeText={setName} placeholderTextColor="#2E2E2E88" />
      <TextInput placeholder="Bio" style={[styles.input, { height: 80 }]} value={bio} onChangeText={setBio} multiline placeholderTextColor="#2E2E2E88" />

      <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
        <Text style={styles.saveButtonText}>Guardar Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", justifyContent: "center", padding: 24 },
  title: { fontSize: 26, fontWeight: "bold", color: "#2E2E2E", textAlign: "center", marginBottom: 20 },
  avatarContainer: { alignSelf: "center", marginBottom: 20, borderWidth: 3, borderColor: "#E1006F", borderRadius: 80, width: 120, height: 120, justifyContent: "center", alignItems: "center", backgroundColor: "#F8C6D0" },
  avatar: { width: 114, height: 114, borderRadius: 57 },
  avatarPlaceholder: { color: "#2E2E2E", textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#C6A0DE", borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 16, color: "#2E2E2E", backgroundColor: "#F8C6D0" },
  saveButton: { backgroundColor: "#E1006F", paddingVertical: 16, borderRadius: 12, marginTop: 10 },
  saveButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold", textAlign: "center" },
});
