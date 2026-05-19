import { ReactElement, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type UserRole = 'user' | 'seller' | 'admin';

type CurrentUser = {
  email?: string;
  name?: string;
  role?: string;
  capabilities?: string[];
};

export function AccountScreen(): ReactElement {
  const [mode, setMode] = useState<'account' | 'login' | 'register'>('account');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const handleLoginPress = (): void => {
    setMode('login');
  };

  const handleRegister = (): void => {
    Alert.alert('Register', 'Register pressed');
  };

  const handleLogout = (): void => {
    setAuthToken(null);
    setCurrentUser(null);
    Alert.alert('Logout', 'Logout pressed');
};

  const getRoleLabel = (user: CurrentUser | null): UserRole => {
    const normalizedRole = user?.role?.toLowerCase();
    if (normalizedRole === 'admin' || normalizedRole === 'seller' || normalizedRole === 'user') {
      return normalizedRole;
    }

    return 'user';
  };

  const hasSellerAccess = (user: CurrentUser | null): boolean => {
    if (!user) {
      return false;
    }

    const role = getRoleLabel(user);
    if (role === 'seller' || role === 'admin') {
      return true;
    }

    return (user.capabilities ?? []).some((capability) => capability.toLowerCase().includes('seller'));
  };

  const handleComingNext = (feature: string): void => {
    Alert.alert('Coming next', `${feature} will be available soon.`);
  };

 const handleLoginSubmit = async (): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Email and password are required.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('https://bettavaro.com/api/mobile/v1/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result: {
        ok?: boolean;
        data?: {
          token?: string;
          user?: { email?: string };
        };
        error?: { message?: string };
        message?: string;
      } = await response.json();

      if (response.ok && result.ok && result.data?.token && result.data?.user) {
        setAuthToken(result.data.token);
        setCurrentUser(result.data.user);
        setMode('account');
        Alert.alert('Login successful');
      } else {
        setErrorMessage(result.error?.message ?? result.message ?? 'Login failed.');
      }
    } catch {
      setErrorMessage('Login failed.');
    } finally {
      setLoading(false);
    }
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

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <TouchableOpacity
              style={[styles.largeLoginButton, loading && styles.disabledButton]}
              onPress={handleLoginSubmit}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>{loading ? 'Signing in...' : 'Login'}</Text>
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

               {!currentUser || !authToken ? (
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
                  <Text style={styles.loggedInText}>Account Session Active</Text>
                  <Text style={styles.cardItem}>Welcome back, {currentUser.name ?? currentUser.email ?? email}</Text>
                  <Text style={styles.cardItem}>Role: {getRoleLabel(currentUser)}</Text>
                  <TouchableOpacity style={styles.primaryButton} onPress={handleLogout} activeOpacity={0.85}>
                    <Text style={styles.primaryButtonText}>Logout</Text>
                  </TouchableOpacity> 
                </View>
              )}
            </View>

            {currentUser && authToken ? (
              <>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Account Actions</Text>
                  <TouchableOpacity style={styles.actionRow} onPress={() => handleComingNext('Member dashboard')} activeOpacity={0.85}>
                    <Text style={styles.actionText}>Open Member Dashboard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionRow} onPress={() => handleComingNext('Change password')} activeOpacity={0.85}>
                    <Text style={styles.actionText}>Change Password</Text>
                  </TouchableOpacity>
                </View>

                {hasSellerAccess(currentUser) ? (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Seller / Marketplace</Text>
                    <TouchableOpacity style={styles.actionRow} onPress={() => handleComingNext('Seller dashboard')} activeOpacity={0.85}>
                      <Text style={styles.actionText}>Open Seller Dashboard</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionRow} onPress={() => handleComingNext('Orders')} activeOpacity={0.85}>
                      <Text style={styles.actionText}>My Orders</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionRow} onPress={() => handleComingNext('Offers')} activeOpacity={0.85}>
                      <Text style={styles.actionText}>My Offers</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </>
            ) : null}
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
  errorText: {
    color: '#ffb3b3',
    fontSize: 14,
    marginBottom: 8,
  },
 disabledButton: {
    opacity: 0.7,
  },
  actionRow: {
    backgroundColor: '#12463d',
    borderColor: '#d4af37',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});