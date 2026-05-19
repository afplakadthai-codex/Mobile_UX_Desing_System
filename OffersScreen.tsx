import { StyleSheet, Text, View } from 'react-native';

export function OffersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Offers</Text>
      <Text style={styles.subtitle}>Your incoming and outgoing offers will appear here.</Text>
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
    fontSize: 15,
  },
});
