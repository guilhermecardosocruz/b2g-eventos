import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function App() {
return (
<SafeAreaView style={styles.safe}>
<View style={styles.container}>
<Text style={styles.title}>Eventos Mobile</Text>
<Text style={styles.subtitle}>
Esqueleto Expo pronto para evoluir.
</Text>
<Text style={styles.helper}>
No futuro, você pode transformar este app em uma WebView apontando
para o domínio do PWA.
</Text>

    {/*
      Exemplo de WebView (descomentando, lembre de instalar react-native-webview):

      import { WebView } from "react-native-webview";

      <WebView
        source={{ uri: "https://seu-dominio-do-pwa.com" }}
        style={{ flex: 1 }}
      />

      Altere a URL acima para o domínio do app web quando estiver em produção.
    */}

    <StatusBar style="light" />
  </View>
</SafeAreaView>


);
}

const styles = StyleSheet.create({
safe: {
flex: 1,
backgroundColor: "#020617"
},
container: {
flex: 1,
alignItems: "center",
justifyContent: "center",
paddingHorizontal: 24
},
title: {
fontSize: 24,
fontWeight: "700",
color: "#e5e7eb"
},
subtitle: {
marginTop: 8,
fontSize: 14,
color: "#9ca3af",
textAlign: "center"
},
helper: {
marginTop: 16,
fontSize: 12,
color: "#6b7280",
textAlign: "center"
}
});
