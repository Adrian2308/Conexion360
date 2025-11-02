import { Slot } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function MessagesLayout() {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Mensajes</Text>
      </View>
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: "#E1006F",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  title: { color: "#fff", fontSize: 20, fontWeight: "bold" },
});
