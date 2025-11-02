import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../supabaseClient";

export default function Home() {
  const params = useLocalSearchParams();
  const userId = params.userId as string;

  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!userId) {
        console.log("⚠️ No hay userId");
        setLoading(false);
        return;
      }

      try {
        const { data: swipes } = await supabase.from("swipes").select("to_user").eq("from_user", userId);
        const swipedIds = swipes?.map((s: any) => s.to_user) || [];
        const excludeIds = [userId, ...swipedIds];
        const formattedIds = `(${excludeIds.map((id) => `"${id}"`).join(",")})`;

        const { data: profilesData } = await supabase.from("profiles").select("*").not("id", "in", formattedIds);
        setProfiles(profilesData || []);
      } catch (err) {
        console.error("❌ Error en fetchProfiles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [userId]);

  const handleSwipe = async (profileId: string, direction: "like" | "dislike") => {
    try {
      await supabase.from("swipes").insert([{ from_user: userId, to_user: profileId, type: direction }]);
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    } catch (err) {
      console.error("❌ Error al registrar swipe:", err);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#E1006F" style={{ flex: 1 }} />;
  if (profiles.length === 0) return <Text style={{ textAlign: "center", marginTop: 50 }}>No hay perfiles nuevos 😔</Text>;

  const profile = profiles[0];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ImageBackground source={{ uri: profile.photo_url }} style={styles.photo} imageStyle={{ borderRadius: 20 }}>
          <View style={styles.overlay}>
            <Text style={styles.name}>{profile.name}, {profile.age}</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>
        </ImageBackground>

        <View style={styles.buttons}>
          <TouchableOpacity style={[styles.button, styles.dislike]} onPress={() => handleSwipe(profile.id, "dislike")}>
            <Text style={styles.buttonText}>❌</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.like]} onPress={() => handleSwipe(profile.id, "like")}>
            <Text style={styles.buttonText}>❤️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  card: { width: 320, alignItems: "center" },
  photo: { width: 320, height: 450, justifyContent: "flex-end" },
  overlay: { backgroundColor: "rgba(0,0,0,0.35)", padding: 16, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  name: { fontSize: 26, fontWeight: "bold", color: "#fff" },
  bio: { fontSize: 16, color: "#fff", marginTop: 4 },
  buttons: { flexDirection: "row", justifyContent: "space-between", width: "70%", marginTop: 20 },
  button: { width: 70, height: 70, borderRadius: 35, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  like: { backgroundColor: "#E1006F" },
  dislike: { backgroundColor: "#ccc" },
  buttonText: { fontSize: 28, color: "#fff" },
});
