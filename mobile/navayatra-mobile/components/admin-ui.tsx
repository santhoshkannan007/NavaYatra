import { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

type PageProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

type MetricProps = {
  label: string;
  value: string | number;
  tone?: 'default' | 'accent' | 'muted';
};

type PillProps = {
  label: string;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
};

type ButtonProps = {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'secondary' | 'danger';
};

type RowProps = {
  left: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
};

export function AdminPage({ title, subtitle, children }: PageProps) {
  return (
    <View style={styles.page}>
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>NavaYatra Admin</Text>
        <Text style={styles.heroTitle}>{title}</Text>
        {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function AdminCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function AdminSectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function AdminMetricTile({ label, value, tone = 'default' }: MetricProps) {
  return (
    <View style={[styles.metricTile, styles[`metric_${tone}` as const]]}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function AdminPill({ label, tone = 'default' }: PillProps) {
  return <View style={[styles.pill, styles[`pill_${tone}` as const]]}><Text style={styles.pillText}>{label}</Text></View>;
}

export function AdminActionButton({ label, onPress, tone = 'primary' }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, styles[`button_${tone}` as const]]} activeOpacity={0.9}>
      <Text style={[styles.buttonText, styles[`buttonText_${tone}` as const]]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function AdminRow({ left, right, onPress }: RowProps) {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container style={styles.row} onPress={onPress as never} activeOpacity={0.9 as never}>
      <View style={styles.rowLeft}>{left}</View>
      {right ? <View style={styles.rowRight}>{right}</View> : null}
    </Container>
  );
}

export function AdminMetaLine({ children }: { children: ReactNode }) {
  return <Text style={styles.metaLine}>{children}</Text>;
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f4f1ec',
    padding: 16,
  },
  hero: {
    backgroundColor: '#1f1a17',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  heroKicker: {
    color: '#f3c15f',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: '#d8d1c8',
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ece4d9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#201816',
  },
  sectionSubtitle: {
    marginTop: 3,
    color: '#6d6158',
    fontSize: 12,
  },
  metricTile: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    minWidth: '31%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: '#ece4d9',
  },
  metric_default: { backgroundColor: '#fff' },
  metric_accent: { backgroundColor: '#fff4dc' },
  metric_muted: { backgroundColor: '#f8f5f1' },
  metricValue: {
    color: '#201816',
    fontSize: 22,
    fontWeight: '800',
  },
  metricLabel: {
    marginTop: 4,
    color: '#6d6158',
    fontSize: 12,
    fontWeight: '600',
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  pill_default: { backgroundColor: '#f8f5f1', borderColor: '#e6ddd4' },
  pill_success: { backgroundColor: '#e8f7ec', borderColor: '#c7e9cf' },
  pill_warning: { backgroundColor: '#fff4dc', borderColor: '#efd29b' },
  pill_danger: { backgroundColor: '#fde8e8', borderColor: '#f3c0c0' },
  pill_info: { backgroundColor: '#e8f1ff', borderColor: '#bed3ff' },
  pillText: { fontSize: 11, fontWeight: '700', color: '#3a2f2a' },
  button: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  button_primary: { backgroundColor: '#1f1a17', borderColor: '#1f1a17' },
  button_secondary: { backgroundColor: '#fff', borderColor: '#cbbca8' },
  button_danger: { backgroundColor: '#c62828', borderColor: '#c62828' },
  buttonText: { fontWeight: '800', fontSize: 14 },
  buttonText_primary: { color: '#fff' },
  buttonText_secondary: { color: '#1f1a17' },
  buttonText_danger: { color: '#fff' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee4d8',
    gap: 12,
  },
  rowLeft: { flex: 1 },
  rowRight: { alignItems: 'flex-end' },
  metaLine: { color: '#6d6158', fontSize: 12, marginTop: 3 },
});
