import { ReactElement } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';

export function CartScreen(): ReactElement {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Your Cart</Text>
        <Text style={styles.emptyText}>No items yet</Text>
        <Text style={styles.supportingText}>Curated luxury pieces added to your cart will appear here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#061f1b',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  title: {
    color: '#d4af37',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: '#f2f6f5',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  supportingText: {
    color: '#c6d7d3',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
});
