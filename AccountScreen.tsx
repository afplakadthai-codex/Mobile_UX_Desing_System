import { useMemo, useState } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '../../features/auth/AuthContext';

type AuthView = 'guest' | 'signin' | 'register';
type AppNavigation = NavigationProp<Record<string, object | undefined>>;

type DashboardItem = {
  key: string;
  label: string;
  icon: string;
  routeCandidates: string[];
};

type LuxuryInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
};

function LuxuryInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = 'none',
  keyboardType = 'default',
}: LuxuryInputProps) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <Text style={styles.inputIcon}>◆</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );
}

export function AccountScreen() {
  const { isAuthenticated, logout, status, user, login, register } = useAuth();
  const navigation = useNavigation<AppNavigation>();

  const [view, setView] = useState<AuthView>('guest');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleAccessLabel = useMemo(() => {
    const normalizedRole = String(user?.role ?? 'user').toLowerCase();
    if (normalizedRole === 'seller') return 'Seller Access';
    if (normalizedRole === 'admin') return 'Admin Access';
    return 'Member Access';
  }, [user?.role]);

  const normalizedRole = String(user?.role ?? 'user').toLowerCase();
  const hasSellerAccess = normalizedRole === 'seller' || normalizedRole === 'admin';

  const commonItems: DashboardItem[] = [
    { key: 'profile', label: 'Profile', icon: '◆', routeCandidates: ['Profile'] },
    { key: 'orders', label: 'My Orders', icon: '◆', routeCandidates: ['Orders', 'MyOrders', 'BuyerOrders'] },
    { key: 'refunds', label: 'Refund Requests', icon: '◆', routeCandidates: ['Refunds', 'MyRefunds'] },
    { key: 'notifications', label: 'Notifications', icon: '◆', routeCandidates: ['Notifications'] },
  ];

  const sellerItems: DashboardItem[] = [
    { key: 'seller-dashboard', label: 'Seller Dashboard', icon: '◆', routeCandidates: ['SellerDashboard'] },
    { key: 'seller-orders', label: 'Seller Orders', icon: '◆', routeCandidates: ['SellerOrders'] },
    { key: 'refund-queue', label: 'Refund Queue', icon: '◆', routeCandidates: ['SellerRefunds'] },
    { key: 'balance', label: 'Balance / Payout', icon: '◆', routeCandidates: ['SellerBalance'] },
    { key: 'listings', label: 'My Listings', icon: '◆', routeCandidates: ['SellerListings'] },
  ];

  const dashboardItems = hasSellerAccess ? [...commonItems, ...sellerItems] : commonItems;

  const isLoading = status === 'loading';

  const resolveRoute = (candidates: string[]) => {
    const routeNames = navigation.getState().routeNames;
    return candidates.find((name) => routeNames.includes(name));
  };

  const handleDashboardPress = (item: DashboardItem) => {
    const targetRoute = resolveRoute(item.routeCandidates);
    if (targetRoute) {
      navigation.navigate(targetRoute as never);
      return;
    }
    console.warn(`[AccountScreen] Route not registered for "${item.label}". Candidates: ${item.routeCandidates.join(', ')}`);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await login({ email: email.trim(), password, device_name: 'bettavaro-mobile' });
      setPassword('');
      setView('guest');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (!firstName.trim() || !email.trim() || !password.trim()) {
      setError('Please complete the required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        password_confirmation: confirmPassword,
      });
      setPassword('');
      setConfirmPassword('');
      setView('guest');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to create your account right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator color="#007A55" size="large" />
        <Text style={styles.loadingText}>Loading account…</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return (
      <ScrollView contentContainerStyle={styles.container} style={styles.screen}>
        <View style={styles.heroCard}>
          <Text style={styles.brandMark}>BV</Text>
          <Text style={styles.heroTitle}>Bettavaro Account</Text>
          <Text style={styles.heroSubtitle}>Welcome back{user?.first_name ? `, ${user.first_name}` : ''}.</Text>
          <View style={styles.goldLine} />
          <Text style={styles.memberMeta}>{roleAccessLabel}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Member Center</Text>
          <View style={styles.menuGrid}>
            {dashboardItems.map((item) => {
              const routeExists = Boolean(resolveRoute(item.routeCandidates));
              return (
                <Pressable
                  key={item.key}
                  style={({ pressed }) => [styles.menuCard, pressed ? styles.menuCardPressed : null]}
                  onPress={() => handleDashboardPress(item)}
                >
                  <View style={styles.menuHeaderRow}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <Text style={routeExists ? styles.menuHint : styles.menuHintDisabled}>
                    {routeExists ? 'Open' : 'Coming soon'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => {
              void logout();
            }}
            style={({ pressed }) => [styles.logoutButton, pressed ? styles.buttonPressed : null]}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={12}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}>
          <Text style={styles.brandMark}>BV</Text>
          <Text style={styles.heroTitle}>{view === 'signin' ? 'Welcome Back' : view === 'register' ? 'Create Account' : 'Welcome to Bettavaro'}</Text>
          <Text style={styles.heroSubtitle}>
            {view === 'signin'
              ? 'Sign in to your Bettavaro account'
              : view === 'register'
                ? 'Join the luxury betta marketplace.'
                : 'Luxury Betta Marketplace'}
          </Text>
          <View style={styles.goldLine} />
          <Text style={styles.heroDescription}>Discover rare bettas from trusted farms worldwide.</Text>
        </View>

        {view === 'guest' && (
          <>
            <Pressable onPress={() => setView('signin')} style={({ pressed }) => [styles.button, styles.buttonPrimary, pressed ? styles.buttonPressed : null]}>
              <Text style={styles.buttonPrimaryText}>◆ Sign In</Text>
            </Pressable>
            <View style={styles.spacer} />
            <Pressable
              onPress={() => setView('register')}
              style={({ pressed }) => [styles.button, styles.buttonSecondary, pressed ? styles.buttonPressed : null]}
            >
              <Text style={styles.buttonSecondaryText}>◇ Create Account</Text>
            </Pressable>

            <View style={styles.featuresGrid}>
              {['Rare Betta Fish', 'Live Auctions', 'Secure Offers', 'Trusted Sellers'].map((feature) => (
                <View key={feature} style={styles.featureTile}>
                  <Text style={styles.featureTitle}>{feature}</Text>
                </View>
              ))}
            </View>

            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>
                You can browse Bettavaro as a guest and sign in when you are ready.
              </Text>
              <Pressable>
                <Text style={styles.noticeAction}>Explore Marketplace</Text>
              </Pressable>
            </View>
          </>
        )}

        {view !== 'guest' && (
          <View style={styles.card}>
            {error ? (
              <View style={styles.errorWrap}>
                <Text style={styles.errorTitle}>Account Notice</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {view === 'signin' ? (
              <>
                <LuxuryInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@bettavaro.com"
                  keyboardType="email-address"
                />
                <LuxuryInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  secureTextEntry
                />
                <Text style={styles.helper}>Forgot password support is coming soon.</Text>
                <Pressable
                  onPress={() => void handleLogin()}
                  disabled={isSubmitting}
                  style={({ pressed }) => [styles.button, styles.buttonPrimary, isSubmitting ? styles.buttonDisabled : null, pressed ? styles.buttonPressed : null]}
                >
                  <Text style={styles.buttonPrimaryText}>{isSubmitting ? 'Signing In…' : 'Sign In'}</Text>
                </Pressable>
                <View style={styles.spacer} />
                <Pressable
                  onPress={() => setView('guest')}
                  disabled={isSubmitting}
                  style={({ pressed }) => [styles.button, styles.buttonSecondary, isSubmitting ? styles.buttonDisabled : null, pressed ? styles.buttonPressed : null]}
                >
                  <Text style={styles.buttonSecondaryText}>Back to Marketplace</Text>
                </Pressable>
              </>
            ) : (
              <>
                <LuxuryInput
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                  autoCapitalize="words"
                />
                <LuxuryInput
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last name"
                  autoCapitalize="words"
                />
                <LuxuryInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@bettavaro.com"
                  keyboardType="email-address"
                />
                <LuxuryInput label="Password" value={password} onChangeText={setPassword} placeholder="Create password" secureTextEntry />
                <LuxuryInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm password"
                  secureTextEntry
                />
                <Text style={styles.helper}>Start as a member. You can upgrade to seller later.</Text>
                <Pressable
                  onPress={() => void handleRegister()}
                  disabled={isSubmitting}
                  style={({ pressed }) => [styles.button, styles.buttonPrimary, isSubmitting ? styles.buttonDisabled : null, pressed ? styles.buttonPressed : null]}
                >
                  <Text style={styles.buttonPrimaryText}>{isSubmitting ? 'Creating…' : 'Create Account'}</Text>
                </Pressable>
                <View style={styles.spacer} />
                <Pressable
                  onPress={() => setView('signin')}
                  disabled={isSubmitting}
                  style={({ pressed }) => [styles.button, styles.buttonSecondary, isSubmitting ? styles.buttonDisabled : null, pressed ? styles.buttonPressed : null]}
                >
                  <Text style={styles.buttonSecondaryText}>Already have an account? Sign In</Text>
                </Pressable>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F4F8F6', flex: 1 },
  container: { padding: 20, paddingBottom: 36 },
  centeredContainer: { alignItems: 'center', backgroundColor: '#F4F8F6', flex: 1, justifyContent: 'center' },
  loadingText: { color: '#0F172A', fontSize: 16, fontWeight: '600', marginTop: 12 },
  heroCard: {
    backgroundColor: '#06251D',
    borderRadius: 24,
    marginBottom: 16,
    padding: 22,
    shadowColor: '#03140F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  brandMark: { color: '#D6A84F', fontSize: 16, fontWeight: '700', letterSpacing: 2 },
  heroTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '700', marginTop: 12 },
  heroSubtitle: { color: '#D9E4DF', fontSize: 16, marginTop: 6 },
  heroDescription: { color: '#E2E8F0', fontSize: 14, lineHeight: 20, marginTop: 10 },
  goldLine: { backgroundColor: '#D6A84F', borderRadius: 12, height: 3, marginTop: 14, width: 56 },
  memberMeta: { color: '#E2E8F0', fontSize: 13, marginTop: 10, fontWeight: '600' },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
  },
  cardTitle: { color: '#0F172A', fontSize: 19, fontWeight: '700', marginBottom: 12 },
  button: {
    alignItems: 'center',
    borderRadius: 20,
    height: 54,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonPrimary: { backgroundColor: '#008A63' },
  buttonSecondary: { backgroundColor: '#ECF3EF', borderColor: 'rgba(15, 23, 42, 0.08)', borderWidth: 1 },
  buttonPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  buttonSecondaryText: { color: '#0F172A', fontSize: 16, fontWeight: '700' },
  buttonDisabled: { opacity: 0.7 },
  buttonPressed: { opacity: 0.85 },
  spacer: { height: 10 },
  menuGrid: { gap: 12 },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 138, 99, 0.18)',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuCardPressed: { opacity: 0.82 },
  menuHeaderRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  menuIcon: { color: '#008A63', fontSize: 12, fontWeight: '700' },
  menuLabel: { color: '#0F172A', fontSize: 16, fontWeight: '600' },
  menuHint: { color: '#D6A84F', fontSize: 12, fontWeight: '600', marginTop: 5 },
  menuHintDisabled: { color: '#94A3B8', fontSize: 12, fontWeight: '600', marginTop: 5 },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  logoutText: { color: '#9A3412', fontSize: 16, fontWeight: '700' },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  featureTile: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 72,
    padding: 14,
    width: '48%',
  },
  featureTitle: { color: '#0F172A', fontSize: 14, fontWeight: '600' },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 14,
    padding: 16,
  },
  noticeText: { color: '#64748B', fontSize: 14, lineHeight: 20 },
  noticeAction: { color: '#007A55', fontSize: 14, fontWeight: '700', marginTop: 8 },
  inputWrap: { marginBottom: 12 },
  inputLabel: { color: '#0F172A', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputShell: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 54,
    paddingHorizontal: 12,
  },
  inputIcon: { color: '#0B3B2E', fontSize: 11, marginRight: 8 },
  input: { color: '#0F172A', flex: 1, fontSize: 15, paddingVertical: 12 },
  helper: { color: '#64748B', fontSize: 13, marginBottom: 12 },
  errorWrap: {
    backgroundColor: '#FEF7EA',
    borderColor: '#D6A84F',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  errorTitle: { color: '#7C5A1A', fontSize: 12, fontWeight: '700', marginBottom: 2 },
  errorText: { color: '#7C2D12', fontSize: 13 },
});
