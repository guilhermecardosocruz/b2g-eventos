# Notas de PWA e publicação (Play Store / App Store)

Este projeto **B2G Eventos** foi pensado como um PWA first, com base em Next.js 15 (App Router).

## 1. Requisitos básicos de PWA

Já configurados:

- `public/manifest.webmanifest` com:
  - `name`, `short_name`, `start_url`, `display: "standalone"`;
  - `theme_color` e `background_color`;
  - ícones em `public/icons/`.
- `service worker` via `next-pwa` (configurado no `next.config.mjs`);
- rota offline em `app/offline/page.tsx`.

Ao instalar no Android/Chrome, o navegador detecta o manifest + SW e oferece o *Add to Home Screen*.

---

## 2. Publicar na Play Store usando TWA (Trusted Web Activity)

Fluxo recomendado:

1. **Definir a URL final do PWA**
   - Ex.: `https://eventos.seudominio.com/`
   - Deve servir o PWA com HTTPS e boa performance (Lighthouse PWA ok).

2. **Criar um projeto Android (wrapper TWA)**
   - Você pode usar o template da comunidade como base (`bubblewrap`):
     - Instale: `npm install -g @bubblewrap/cli`
     - Inicie o projeto:
       ```bash
       bubblewrap init --manifest=https://eventos.seudominio.com/manifest.webmanifest
       ```
   - Isso gera um app Android que abre o PWA em modo fullscreen, usando Trusted Web Activity.

3. **Customizar**
   - Ajuste nome, ícone e cores para bater com o manifest.
   - Configure:
     - `applicationId` (pacote único na Play Store);
     - permissões (em geral, nenhuma especial é necessária para TWA).

4. **Assinatura e publicação**
   - Gere um keystore e assine o app (ou use Play App Signing).
   - Suba o `.aab` via Google Play Console.
   - Na Play Store, a experiência para o usuário é praticamente igual a um app nativo, mas rodando o PWA.

---

## 3. Publicar na App Store (iOS) usando wrapper com WebView

iOS não tem suporte oficial a TWA, então você precisa de um app nativo ou híbrido com WebView.

### Opção 1: Expo / React Native com WebView (usando apps/mobile)

1. **No monorepo, apps/mobile (Expo)**
   - A ideia é ter um app Expo que abre o PWA em uma WebView.

2. **Exemplo de esqueleto (comentado) para `apps/mobile/App.tsx`:**

```tsx
// import { StatusBar } from "expo-status-bar";
// import { StyleSheet, View } from "react-native";
// import { WebView } from "react-native-webview";

// const PWA_URL = "https://eventos.seudominio.com/";

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <WebView
//         source={{ uri: PWA_URL }}
//         style={styles.webview}
//         startInLoadingState
//       />
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#020617"
//   },
//   webview: {
//     flex: 1
//   }
// });
Build para iOS

Use EAS Build (Expo Application Services) ou Xcode:

Configurar app.json / app.config.ts com nome, ícones e bundleId.

Rodar expo prebuild se necessário.

Gerar .ipa para subir na App Store Connect.

Requisitos da Apple

A Apple costuma exigir que o app tenha algum valor adicional além de ser só um “web wrapper”.

Você pode:

Integrar algumas funcionalidades nativas (push notifications, deep links, etc.);

Adicionar telas nativas simples (splash, onboarding) antes da WebView.

4. Boas práticas adicionais
Versão e cache:

Configure log de versões para facilitar depuração entre builds do app e releases do PWA.

Deep links / links universais:

Configure associações de domínio:

Android: assetlinks.json;

iOS: apple-app-site-association.

Experiência offline:

Expanda app/offline/page.tsx para mostrar:

Últimos eventos vistos;

Mensagens mais guiadas para tentar reconexão.

Com essas peças, o projeto está pronto para evoluir de um PWA moderno para um app empacotado tanto na Play Store (via TWA) quanto na App Store (via wrapper com WebView).
