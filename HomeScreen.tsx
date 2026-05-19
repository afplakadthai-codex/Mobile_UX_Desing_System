import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../design-system/components/Button';
import { Card } from '../../../design-system/components/Card';
import { colors } from '../../../design-system/tokens/colors';
import { spacing } from '../../../design-system/tokens/spacing';

export function HomeScreen() {
  return (
    <View style={styles.screen}>
      <Card style={styles.heroCard}>
        <Text style={styles.eyebrow}>Collector-grade bettas</Text>
        <Text style={styles.title}>Bettavaro Marketplace</Text>
        <Text style={styles.copy}>A premium mobile shell for discovering curated betta listings, auctions, and trusted sellers.</Text>
        <Button label="Explore Marketplace" variant="gold" style={styles.action} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    padding: spacing[4]
  },
  heroCard: {
    backgroundColor: colors.brand.emerald[950],
    borderColor: colors.accent.gold[600]
  },
  eyebrow: {
    color: colors.accent.gold[200],
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: spacing[2],
    textTransform: 'uppercase'
  },
  title: {
    color: colors.neutral[0],
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36
  },
  copy: {
    color: colors.neutral[100],
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing[3]
  },
  action: {
    marginTop: spacing[6]
  }
});
