import { ReactElement } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';

export function AccountScreen(): ReactElement {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Bettavaro Account</Text>
        <Text style={styles.subtitle}>Manage your luxury buying and selling experience.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Actions</Text>
          <Text style={styles.cardItem}>• Profile & verification</Text>
          <Text style={styles.cardItem}>• Saved listings</Text>
          <Text style={styles.cardItem}>• Security & privacy</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#082a24',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  title: {
    color: '#d4af37',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  subtitle: {
    color: '#dce9e5',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 24,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#0f3a32',
    borderColor: '#b8932f',
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
  },
  cardTitle: {
    color: '#f6e6b4',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  cardItem: {
    color: '#ecf4f2',
    fontSize: 15,
    marginBottom: 8,
  },
});
