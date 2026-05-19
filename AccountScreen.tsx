import { ReactElement } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function AccountScreen(): ReactElement {
  const isLoggedIn = false;

  const handleLogin = (): void => {
    Alert.alert('Login', 'Login pressed');
  };

  const handleRegister = (): void => {
    Alert.alert('Register', 'Register pressed');
  };

  const handleLogout = (): void => {
    Alert.alert('Logout', 'Logout pressed');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Bettavaro Account</Text>
        <Text style={styles.subtitle}>Manage your luxury buying and selling experience.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Authentication</Text>

          {!isLoggedIn ? (
            <View style={styles.authButtonsWrapper}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} activeOpacity={0.85}>
                <Text style={styles.primaryButtonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={handleRegister} activeOpacity={0.85}>
                <Text style={styles.secondaryButtonText}>Register</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.loggedInContainer}>
              <Text style={styles.loggedInText}>Welcome back</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={handleLogout} activeOpacity={0.85}>
                <Text style={styles.primaryButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Actions</Text>
          <Text style={styles.cardItem}>• Profile & Verification</Text>
          <Text style={styles.cardItem}>• Saved Listings</Text>
          <Text style={styles.cardItem}>• Security & Privacy</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Seller / Marketplace</Text>
          <Text style={styles.cardItem}>• My Orders</Text>
          <Text style={styles.cardItem}>• My Offers</Text>
          <Text style={styles.cardItem}>• Seller Center</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#003b2f',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    gap: 16,
  },
  title: {
    color: '#d4af37',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  subtitle: {
    color: '#eaf4f1',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#0f3a32',
    borderColor: '#d4af37',
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
  },
  cardTitle: {
    color: '#f6e6b4',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  cardItem: {
    color: '#ffffff',
    fontSize: 15,
    marginBottom: 10,
    lineHeight: 22,
  },
  authButtonsWrapper: {
    gap: 12,
  },
  loggedInContainer: {
    gap: 12,
  },
  loggedInText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  primaryButton: {
    backgroundColor: '#d4af37',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#06251e',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#d4af37',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
