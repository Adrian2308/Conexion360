import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../../supabaseClient"; // <-- ruta corregida

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) return;
      setUser(data.session.user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.session.user.id)
        .single();

      if (profile) {
        setName(profile.name);
        setBio(profile.bio);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ name, bio })
      .eq("id", user.id);
    alert("Perfil actualizado");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Bio</Text>
      <TextInput style={styles.input} value={bio} onChangeText={setBio} multiline />

      <Button title="Guardar" onPress={handleSave} color="#E1006F" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 12 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 8, marginTop: 4 },
});
