import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const quickActions = [
  {
    title: 'Ticket Booking',
    subtitle: 'Reserve seats quickly',
    icon: 'ticket-outline',
    route: '/ticket-search',
    tint: '#B42318',
    glow: '#FDECEC',
  },
  {
    title: 'Search Buses',
    subtitle: 'Find routes and timings',
    icon: 'search',
    route: '/search',
    tint: '#0F766E',
    glow: '#E7F7F4',
  },
  {
    title: 'Special Tours',
    subtitle: 'Plan group journeys',
    icon: 'bus-outline',
    route: '/special-tour-entry',
    tint: '#6D28D9',
    glow: '#EFE8FF',
  },
  {
    title: 'Student Concession',
    subtitle: 'Apply for discounts',
    icon: 'school',
    route: '/student-concession',
    tint: '#C2410C',
    glow: '#FFF2E6',
  },
];

const stats = [
  { value: '24/7', label: 'Support', icon: 'time-outline' },
  { value: 'Fast', label: 'Booking', icon: 'flash-outline' },
  { value: 'Safe', label: 'Travel', icon: 'shield-checkmark-outline' },
];

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const kickerAnim = useRef(new Animated.Value(0)).current;

  const glassMain = isDark ? 'rgba(32,36,42,0.62)' : 'rgba(255,255,255,0.7)';
  const glassSoft = isDark ? 'rgba(40,45,53,0.52)' : 'rgba(255,255,255,0.55)';
  const glassBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.72)';

  useEffect(() => {
    const intro = Animated.timing(kickerAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    });

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(kickerAnim, {
          toValue: 1.08,
          duration: 1300,
          useNativeDriver: true,
        }),
        Animated.timing(kickerAnim, {
          toValue: 1,
          duration: 1300,
          useNativeDriver: true,
        }),
      ])
    );

    intro.start(() => pulse.start());

    return () => {
      intro.stop();
      pulse.stop();
    };
  }, [kickerAnim]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.glowTop, { backgroundColor: palette.primarySoft }]} />
      <View style={[styles.glowBottom, { backgroundColor: palette.surfaceElevated }]} />
      <View style={[styles.glowMid, { backgroundColor: isDark ? '#3A2E48' : '#F8E3D7' }]} />

      <View style={[styles.heroCard, { backgroundColor: glassMain, borderColor: glassBorder }]}> 
        <View style={[styles.heroSheen, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.52)' }]} />
        <TouchableOpacity
          style={[styles.profileBadgeFloating, { backgroundColor: glassSoft, borderColor: glassBorder }]}
          onPress={() => router.push('/profile')}
        >
          <Ionicons name="person-circle-outline" size={26} color={palette.primary} />
          <Text style={[styles.profileBadgeText, { color: palette.primary }]}>Profile</Text>
        </TouchableOpacity>

        <View style={styles.heroTopRow}>
          <Animated.Text
            style={[
              styles.kicker,
              {
                color: palette.accent,
                opacity: kickerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
                transform: [
                  {
                    translateY: kickerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [14, 0],
                    }),
                  },
                  {
                    scale: kickerAnim.interpolate({
                      inputRange: [0, 1, 1.08],
                      outputRange: [0.94, 1, 1.04],
                    }),
                  },
                ],
              },
            ]}
          >
            NavaYatra
          </Animated.Text>
          <Text style={[styles.header, { color: palette.text, fontFamily: Fonts.rounded }]}>Travel, beautifully organized.</Text>
        </View>

        <Text style={[styles.subHeader, { color: palette.muted }]}>Your daily travel dashboard.</Text>

        <View style={styles.heroActions}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: palette.primary }]}
            onPress={() => router.push('/ticket-search')}
          >
            <Ionicons name="ticket-outline" size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>Book a ticket</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: palette.border, backgroundColor: palette.surfaceElevated }]}
            onPress={() => router.push('/search')}
          >
            <Ionicons name="search-outline" size={18} color={palette.primary} />
            <Text style={[styles.secondaryButtonText, { color: palette.text }]}>Search buses</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {stats.map((item) => (
            <View key={item.label} style={[styles.statPill, { backgroundColor: palette.surfaceElevated }]}> 
              <Ionicons name={item.icon as any} size={16} color={palette.primary} />
              <Text style={[styles.statValue, { color: palette.text }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: palette.muted }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.grid}>
        {quickActions.map((item) => (
          <View key={item.title} style={styles.cardWrap}>
            <TouchableOpacity
              style={[styles.card, { backgroundColor: glassMain, borderColor: glassBorder }]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.iconBubble, { backgroundColor: item.glow }]}>
                <Ionicons name={item.icon as any} size={22} color={item.tint} />
              </View>
              <Text style={[styles.cardText, { color: palette.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.cardSubText, { color: palette.muted }]} numberOfLines={2}>
                {item.subtitle}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 54,
    paddingBottom: 40,
  },
  glowTop: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 180,
    top: -40,
    right: -80,
    opacity: 0.65,
  },
  glowBottom: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 220,
    bottom: 140,
    left: -120,
    opacity: 0.5,
  },
  glowMid: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 160,
    top: 220,
    right: -70,
    opacity: 0.32,
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  heroSheen: {
    position: 'absolute',
    width: 180,
    height: 80,
    top: -18,
    right: -20,
    borderRadius: 60,
  },
  heroTopRow: {
    paddingRight: 108,
  },
  kicker: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  header: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },
  subHeader: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  profileBadgeFloating: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  profileBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: 14,
    gap: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    rowGap: 12,
  },
  cardWrap: {
    width: '50%',
    paddingHorizontal: 6,
  },
  card: {
    height: 178,
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '800',
  },
  cardSubText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
  },
});