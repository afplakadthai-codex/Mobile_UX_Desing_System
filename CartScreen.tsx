import { StyleSheet, Text, View } from 'react-native';

export function CartScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cart</Text>
      <Text style={styles.subtitle}>Your cart is empty.</Text>
      <Text style={styles.note}>Add to Cart is coming soon for Bettavaro marketplace listings.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAF9',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  note: {
    color: '#64748B',
    fontSize: 14,
  },
});