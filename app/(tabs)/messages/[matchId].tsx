import { RealtimeChannel } from "@supabase/supabase-js";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../../supabaseClient"; // <-- ruta corregida

export default function MatchChat() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) return;
      setUserId(data.session.user.id);

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      setMessages(msgs || []);
      setLoading(false);
    };

    fetchUserAndMessages();
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;

    const channel: RealtimeChannel = supabase
      .channel(`messages_match_${matchId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !userId) return;

    await supabase.from("messages").insert([
      { match_id: matchId, from_user: userId, content: newMessage.trim() },
    ]);

    setNewMessage("");
  };

  if (loading) return <Text style={{ textAlign: "center", marginTop: 50 }}>Cargando chat...</Text>;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isMe = item.from_user === userId;
          return (
            <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
              <Text style={[styles.messageText, isMe ? { color: "#fff" } : { color: "#000" }]}>{item.content}</Text>
            </View>
          );
        }}
        contentContainerStyle={{ padding: 16 }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  messageContainer: { padding: 12, marginVertical: 4, borderRadius: 12, maxWidth: "70%" },
  myMessage: { backgroundColor: "#E1006F", alignSelf: "flex-end" },
  otherMessage: { backgroundColor: "#eee", alignSelf: "flex-start" },
  messageText: { fontSize: 16 },
  inputContainer: { flexDirection: "row", padding: 8, borderTopWidth: 1, borderColor: "#ddd", alignItems: "center", backgroundColor: "#fff" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 25, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, fontSize: 16 },
  sendButton: { backgroundColor: "#E1006F", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25 },
  sendText: { color: "#fff", fontWeight: "bold" },
});
