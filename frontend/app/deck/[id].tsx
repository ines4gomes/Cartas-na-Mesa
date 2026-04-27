import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { getDeckById, QUESTIONS, DeckId } from "../../data/questions";

const COLORS = {
  background: "#FBF9F6",
  surface: "#FFFFFF",
  textPrimary: "#2D3A34",
  textSecondary: "#5C6B64",
  border: "rgba(45, 58, 52, 0.08)",
};

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function DeckScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const deck = getDeckById(id ?? "");

  const allQuestions = useMemo(() => {
    if (!deck) return [] as string[];
    return QUESTIONS[deck.id as DeckId] ?? [];
  }, [deck]);

  const [queue, setQueue] = useState<string[]>(() => shuffle(allQuestions));
  const [current, setCurrent] = useState<string | null>(null);
  const [drawnCount, setDrawnCount] = useState(0);
  const [exhausted, setExhausted] = useState(false);

  const total = allQuestions.length;

  // Animation refs
  const fade = useRef(new Animated.Value(1)).current;
  const translate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  const animateIn = useCallback(() => {
    fade.setValue(0);
    translate.setValue(24);
    scale.setValue(0.98);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 14,
        bounciness: 6,
      }),
    ]).start();
  }, [fade, translate, scale]);

  const handleTap = useCallback(() => {
    if (exhausted) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    // Draw next from queue
    if (queue.length === 0) {
      // Shouldn't happen if logic correct; guard anyway
      setExhausted(true);
      return;
    }

    const [next, ...rest] = queue;
    setCurrent(next);
    setQueue(rest);
    setDrawnCount((c) => c + 1);
    animateIn();

    if (rest.length === 0) {
      // This was the last card — mark exhausted after this reveal
      // (user sees the last question, then on next tap sees exhausted screen)
    }
  }, [queue, exhausted, animateIn]);

  // When queue becomes 0 and a card was drawn, next tap should show exhausted
  const handleArea = useCallback(() => {
    if (!current) {
      handleTap();
      return;
    }
    if (queue.length === 0) {
      setExhausted(true);
      return;
    }
    handleTap();
  }, [current, queue.length, handleTap]);

  const resetDeck = useCallback(() => {
    setQueue(shuffle(allQuestions));
    setCurrent(null);
    setDrawnCount(0);
    setExhausted(false);
  }, [allQuestions]);

  useEffect(() => {
    // Reset on mount / deck change
    resetDeck();
  }, [resetDeck]);

  if (!deck) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.title}>Baralho não encontrado.</Text>
          <Pressable
            style={styles.homeBtn}
            onPress={() => router.replace("/")}
            testID="deck-notfound-home-button"
          >
            <Text style={styles.homeBtnText}>Voltar ao Início</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Top nav */}
      <View style={styles.topNav}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            { borderColor: COLORS.border },
            pressed && { backgroundColor: deck.bgSoft },
          ]}
          testID="deck-back-button"
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
        </Pressable>

        <View
          style={[styles.progressPill, { backgroundColor: deck.bgSoft }]}
          testID="deck-progress-indicator"
        >
          <View style={[styles.dot, { backgroundColor: deck.primary }]} />
          <Text style={[styles.progressText, { color: deck.primary }]}>
            {deck.label}
          </Text>
          <Text style={styles.progressCount}>
            {drawnCount} / {total}
          </Text>
        </View>

        <View style={styles.backBtnGhost} />
      </View>

      {/* Card area */}
      <Pressable
        style={styles.cardArea}
        onPress={handleArea}
        testID="card-tap-area"
      >
        <Animated.View
          style={[
            styles.card,
            {
              borderColor: COLORS.border,
              opacity: fade,
              transform: [{ translateY: translate }, { scale }],
            },
          ]}
        >
          <View
            style={[styles.cardAccent, { backgroundColor: deck.primary }]}
          />
          {exhausted ? (
            <ExhaustedView
              deck={deck}
              onReset={resetDeck}
              onHome={() => router.replace("/")}
            />
          ) : !current ? (
            <InitialView deck={deck} total={total} />
          ) : (
            <QuestionView question={current} deck={deck} />
          )}
        </Animated.View>
      </Pressable>

      {/* Footer hint */}
      <View style={styles.footer}>
        {!exhausted && (
          <Text style={styles.footerText} testID="deck-footer-hint">
            {!current
              ? "Toca na carta para começar"
              : queue.length === 0
                ? "Última carta — toca novamente"
                : "Toca para a próxima carta"}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

function InitialView({
  deck,
  total,
}: {
  deck: ReturnType<typeof getDeckById>;
  total: number;
}) {
  if (!deck) return null;
  return (
    <View style={styles.cardInner} testID="card-initial-state">
      <View style={[styles.badge, { backgroundColor: deck.bgSoft }]}>
        <Text style={[styles.badgeText, { color: deck.primary }]}>
          {deck.label}
        </Text>
      </View>
      <Text style={styles.initialTitle}>Toca para revelar</Text>
      <Text style={styles.initialSubtitle}>
        {total} cartas{"\n"}sem repetições até o baralho terminar
      </Text>
      <View style={[styles.tapIndicator, { borderColor: deck.primary }]}>
        <Ionicons name="hand-left-outline" size={28} color={deck.primary} />
      </View>
    </View>
  );
}

function QuestionView({
  question,
  deck,
}: {
  question: string;
  deck: ReturnType<typeof getDeckById>;
}) {
  if (!deck) return null;
  return (
    <View style={styles.cardInner} testID="card-question-state">
      <View style={[styles.badge, { backgroundColor: deck.bgSoft }]}>
        <Text style={[styles.badgeText, { color: deck.primary }]}>
          {deck.label}
        </Text>
      </View>
      <Text style={styles.questionText} testID="card-question-text">
        {question}
      </Text>
    </View>
  );
}

function ExhaustedView({
  deck,
  onReset,
  onHome,
}: {
  deck: ReturnType<typeof getDeckById>;
  onReset: () => void;
  onHome: () => void;
}) {
  if (!deck) return null;
  return (
    <View style={styles.cardInner} testID="deck-exhausted-message">
      <View
        style={[
          styles.exhaustedIcon,
          { backgroundColor: deck.bgSoft, borderColor: deck.primary },
        ]}
      >
        <Ionicons name="checkmark" size={36} color={deck.primary} />
      </View>
      <Text style={styles.initialTitle}>Baralho Concluído!</Text>
      <Text style={styles.initialSubtitle}>
        Todas as cartas foram lidas.{"\n"}Podes reiniciar ou voltar ao início.
      </Text>

      <View style={styles.exhaustedActions}>
        <Pressable
          onPress={onReset}
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: deck.primary },
            pressed && { opacity: 0.9 },
          ]}
          testID="deck-reset-button"
        >
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Reiniciar Baralho</Text>
        </Pressable>
        <Pressable
          onPress={onHome}
          style={({ pressed }) => [
            styles.secondaryBtn,
            { borderColor: deck.primary },
            pressed && { backgroundColor: deck.bgSoft },
          ]}
          testID="deck-reset-home-button"
        >
          <Text style={[styles.secondaryBtnText, { color: deck.primary }]}>
            Voltar ao Início
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  topNav: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
  },
  backBtnGhost: { width: 44, height: 44 },
  progressPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  progressText: { fontSize: 13, fontWeight: "600", letterSpacing: 0.3 },
  progressCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "600",
    marginLeft: 2,
  },
  cardArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 32,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  cardAccent: {
    height: 5,
    width: "100%",
  },
  cardInner: {
    flex: 1,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    position: "absolute",
    top: 24,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  initialTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  initialSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  tapIndicator: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
    lineHeight: 34,
    letterSpacing: -0.3,
    paddingHorizontal: 4,
  },
  exhaustedIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  exhaustedActions: {
    width: "100%",
    gap: 12,
    marginTop: 12,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 20,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  homeBtn: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: COLORS.textPrimary,
  },
  homeBtnText: { color: "#fff", fontWeight: "600" },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
});
