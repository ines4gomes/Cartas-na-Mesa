import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { DECKS } from "../data/questions";

const COLORS = {
  background: "#FBF9F6",
  surface: "#FFFFFF",
  textPrimary: "#2D3A34",
  textSecondary: "#5C6B64",
  border: "rgba(45, 58, 52, 0.08)",
};

export default function Home() {
  const router = useRouter();
  const fade = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, translate]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.header,
            { opacity: fade, transform: [{ translateY: translate }] },
          ]}
        >
          <Text style={styles.eyebrow} testID="home-eyebrow">
            ENJUV · DINÂMICAS
          </Text>
          <Text style={styles.title} testID="home-title">
            Cartas na Mesa
          </Text>
          <Text style={styles.subtitle} testID="home-subtitle">
            Este não é apenas um jogo de perguntas, é um convite para deixares as respostas automáticas à porta. O objetivo é simples: deixa a conversa acontecer.
          </Text>

          <View style={styles.howItWorks} testID="home-how-it-works">
            <Text style={styles.howTitle}>Como funciona</Text>
            <HowStep n="1" title="Escolhe o teu grupo" desc="Seleciona a tua faixa etária." />
            <HowStep n="2" title="Revela a carta" desc="Toca no ecrã para uma pergunta aleatória." />
            <HowStep n="3" title="Sê real" desc="Responde com honestidade." />
            <HowStep n="4" title="Passa o telemóvel" desc="Entrega à pessoa ao teu lado e descobre que partilham mais do que esperavas." />
          </View>
        </Animated.View>

        <View style={styles.list}>
          {DECKS.map((deck, i) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              index={i}
              onPress={() => router.push(`/deck/${deck.id}`)}
            />
          ))}
        </View>

        <Text style={styles.footer} testID="home-footer">
          Cada carta é sorteada aleatoriamente.{"\n"}Sem repetições até o
          baralho terminar.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function HowStep({
  n,
  title,
  desc,
}: {
  n: string;
  title: string;
  desc: string;
}) {
  return (
    <View style={styles.howStep}>
      <View style={styles.howNum}>
        <Text style={styles.howNumText}>{n}</Text>
      </View>
      <View style={styles.howTextBlock}>
        <Text style={styles.howStepTitle}>{title}</Text>
        <Text style={styles.howStepDesc}>{desc}</Text>
      </View>
    </View>
  );
}


function DeckCard({
  deck,
  index,
  onPress,
}: {
  deck: (typeof DECKS)[number];
  index: number;
  onPress: () => void;
}) {
  const fade = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(20)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 500,
        delay: 150 + index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: 500,
        delay: 150 + index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, translate, index]);

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();

  return (
    <Animated.View
      style={{
        opacity: fade,
        transform: [{ translateY: translate }, { scale }],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        testID={`home-deck-${deck.id}-button`}
        style={({ pressed }) => [
          styles.deckCard,
          {
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          },
          pressed && { backgroundColor: deck.bgSoft },
        ]}
      >
        <View style={[styles.accent, { backgroundColor: deck.primary }]} />
        <View style={styles.deckCardContent}>
          <View style={styles.deckCardTextBlock}>
            <Text style={styles.deckLabel} testID={`home-deck-${deck.id}-label`}>
              {deck.label}
            </Text>
            <Text
              style={styles.deckDesc}
              testID={`home-deck-${deck.id}-desc`}
            >
              {deck.description}
            </Text>
          </View>
          <View
            style={[
              styles.arrowCircle,
              { backgroundColor: deck.bgSoft, borderColor: deck.primary },
            ]}
          >
            <Ionicons name="arrow-forward" size={18} color={deck.primary} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
    flexGrow: 1,
  },
  header: { marginBottom: 32 },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 2.5,
    color: COLORS.textSecondary,
    fontWeight: "600",
    marginBottom: 12,
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -1,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  howItWorks: {
    marginTop: 28,
    gap: 14,
  },
  howTitle: {
    fontSize: 13,
    letterSpacing: 2,
    color: COLORS.textSecondary,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  howStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  howNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2D3A34",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  howNumText: {
    color: "#FBF9F6",
    fontSize: 13,
    fontWeight: "700",
  },
  howTextBlock: { flex: 1 },
  howStepTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  howStepDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  list: { gap: 16 },
  deckCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 4,
    paddingLeft: 0,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
    flexDirection: "row",
  },
  accent: {
    width: 5,
    alignSelf: "stretch",
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
  },
  deckCardContent: {
    flex: 1,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  deckCardTextBlock: { flex: 1 },
  deckLabel: {
    fontSize: 22,
    fontWeight: "600",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  deckDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  arrowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
