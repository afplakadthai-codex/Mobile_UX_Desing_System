import { ReactElement, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function AccountScreen(): ReactElement {
  const isLoggedIn = false;
  const [mode, setMode] = useState<'account' | 'login' | 'register'>('account');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginPress = (): void => {
    setMode('login');
  };

  const handleRegister = (): void => {
    Alert.alert('Register', 'Register pressed');
  };

  const handleLogout = (): void => {
    Alert.alert('Logout', 'Logout pressed');
  };

  const handleLoginSubmit = (): void => {
    Alert.alert('Login', 'API connection will be added next.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {mode === 'login' ? (
          <View style={styles.card}>
            <TouchableOpacity onPress={() => setMode('account')} activeOpacity={0.85} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.cardTitle}>Sign in to Bettavaro</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#b8ccc5"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#b8ccc5"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.largeLoginButton} onPress={handleLoginSubmit} activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setMode('register')} activeOpacity={0.85} style={styles.createAccountLink}>
              <Text style={styles.createAccountText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        ) : mode === 'register' ? (
          <View style={styles.card}>
            <TouchableOpacity onPress={() => setMode('account')} activeOpacity={0.85} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.cardTitle}>Register</Text>
            <Text style={styles.subtitle}>Registration form UI will be added next.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.title}>Bettavaro Account</Text>
            <Text style={styles.subtitle}>Manage your luxury buying and selling experience.</Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Authentication</Text>

              {!isLoggedIn ? (
                <View style={styles.authButtonsWrapper}>
                  <TouchableOpacity style={styles.primaryButton} onPress={handleLoginPress} activeOpacity={0.85}>
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
          </>
        )}
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
    fontSize: 24,
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
  backButton: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#d4af37',
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#12463d',
    borderColor: '#d4af37',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 12,
  },
  largeLoginButton: {
    backgroundColor: '#d4af37',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  createAccountLink: {
    marginTop: 14,
    alignItems: 'center',
  },
  createAccountText: {
    color: '#f6e6b4',
    fontSize: 15,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});