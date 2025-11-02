import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../../supabaseClient";

export default function MessagesIndex() {
  const [userId, setUserId] = useState<string | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndMatches = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) return;

      setUserId(data.session.user.id);

      const { data: matchData } = await supabase
        .from("matches")
        .select(`
          id,
          user_a,
          user_b,
          user_a_profiles: user_a (id, name, photo_url),
          user_b_profiles: user_b (id, name, photo_url)
        `)
        .or(`user_a.eq.${data.session.user.id},user_b.eq.${data.session.user.id}`)
        .order("created_at", { ascending: false });

      const processed = matchData?.map((m: any) => {
        const isUserA = m.user_a === data.session.user.id;
        const otherUser = isUserA ? m.user_b_profiles : m.user_a_profiles;
        return { matchId: m.id, ...otherUser };
      });

      setMatches(processed || []);
      setLoading(false);
    };

    fetchUserAndMatches();
  }, []);

  if (loading) return <Text style={{ textAlign: "center", marginTop: 50 }}>Cargando conversaciones...</Text>;
  if (matches.length === 0) return <Text style={{ textAlign: "center", marginTop: 50 }}>No tienes conversaciones aún 😔</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.matchId}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.matchItem} onPress={() => router.push(`/messages/${item.matchId}`)}>
            <Image source={{ uri: item.photo_url }} style={styles.avatar} />
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  matchItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "bold" },
});
