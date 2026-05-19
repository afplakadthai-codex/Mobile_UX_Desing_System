import { ReactElement } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';

export function OffersScreen(): ReactElement {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Offers</Text>
        <Text style={styles.subtitle}>Secure offer negotiation system</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Luxury transactions protected end to end</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07231d',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#d4af37',
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#eef3f1',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  badge: {
    borderWidth: 1,
    borderColor: '#b8932f',
    backgroundColor: '#0d342c',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  badgeText: {
    color: '#dbe8e4',
    textAlign: 'center',
    fontSize: 14,
    letterSpacing: 0.2,
  },
});
