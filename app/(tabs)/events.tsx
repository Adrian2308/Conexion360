import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../supabaseClient";

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const handleAttendance = async (eventId: string, status: "asistiré" | "no asistiré") => {
    const { error } = await supabase.from("event_attendance").upsert([
      {
        event_id: eventId,
        user_id: supabase.auth.getUser().then((u) => u.data.user?.id),
        status,
      },
    ]);

    if (error) console.error("Error updating attendance:", error);
    else fetchEvents(); // opcional, para refrescar la lista
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#E1006F" style={{ flex: 1 }} />;

  if (events.length === 0)
    return <Text style={{ textAlign: "center", marginTop: 50 }}>No hay eventos 😔</Text>;

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.type}>{item.event_type.toUpperCase()}</Text>
          <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
          <Text style={styles.description}>{item.description}</Text>
          {item.event_type === "presencial" && <Text style={styles.location}>📍 {item.location}</Text>}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.attend]}
              onPress={() => handleAttendance(item.id, "asistiré")}
            >
              <Text style={styles.buttonText}>Asistiré</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.decline]}
              onPress={() => handleAttendance(item.id, "no asistiré")}
            >
              <Text style={styles.buttonText}>No asistiré</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  type: { fontSize: 14, fontWeight: "bold", color: "#E1006F", marginBottom: 4 },
  date: { fontSize: 14, color: "#333", marginBottom: 4 },
  description: { fontSize: 16, color: "#555", marginBottom: 8 },
  location: { fontSize: 14, color: "#555", marginBottom: 8 },
  buttons: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  button: { padding: 10, borderRadius: 8 },
  attend: { backgroundColor: "#E1006F" },
  decline: { backgroundColor: "#ccc" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
