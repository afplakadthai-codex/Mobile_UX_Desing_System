import { useMemo, useState } from 'react';
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

type LuxuryButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

function LuxuryButton({ label, onPress, variant = 'primary', disabled }: LuxuryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary,
        disabled ? styles.buttonDisabled : null,
        pressed ? styles.buttonPressed : null,
      ]}
    >
      <Text style={variant === 'primary' ? styles.buttonPrimaryText : styles.buttonSecondaryText}>{label}</Text>
    </Pressable>
  );
}

export function AccountScreen() {
  const { isAuthenticated, logout, status, user, login, register } = useAuth();

  const [view, setView] = useState<AuthView>('guest');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleLabel = useMemo(() => {
    if (!user?.role) return 'Member';
    return String(user.role).charAt(0).toUpperCase() + String(user.role).slice(1);
  }, [user?.role]);

  const isLoading = status === 'loading';

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
          <Text style={styles.memberMeta}>{roleLabel} Access</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Actions</Text>
          <LuxuryButton label="Profile" onPress={() => {}} />
          <View style={styles.spacer} />
          <LuxuryButton
            label="Logout"
            variant="secondary"
            onPress={() => {
              void logout();
            }}
          />
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
            <LuxuryButton label="◆ Sign In" onPress={() => setView('signin')} />
            <View style={styles.spacer} />
            <LuxuryButton label="◇ Create Account" variant="secondary" onPress={() => setView('register')} />

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
                <LuxuryButton label={isSubmitting ? 'Signing In…' : 'Sign In'} onPress={() => void handleLogin()} disabled={isSubmitting} />
                <View style={styles.spacer} />
                <LuxuryButton label="Back to Marketplace" variant="secondary" onPress={() => setView('guest')} disabled={isSubmitting} />
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
                <LuxuryButton label={isSubmitting ? 'Creating…' : 'Create Account'} onPress={() => void handleRegister()} disabled={isSubmitting} />
                <View style={styles.spacer} />
                <LuxuryButton
                  label="Already have an account? Sign In"
                  variant="secondary"
                  onPress={() => setView('signin')}
                  disabled={isSubmitting}
                />
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
  memberMeta: { color: '#E2E8F0', fontSize: 13, marginTop: 10 },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  cardTitle: { color: '#0F172A', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  button: {
    alignItems: 'center',
    borderRadius: 20,
    height: 54,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonPrimary: { backgroundColor: '#007A55' },
  buttonSecondary: { backgroundColor: '#ECF3EF', borderColor: 'rgba(15, 23, 42, 0.08)', borderWidth: 1 },
  buttonPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  buttonSecondaryText: { color: '#0F172A', fontSize: 16, fontWeight: '700' },
  buttonDisabled: { opacity: 0.7 },
  buttonPressed: { opacity: 0.85 },
  spacer: { height: 10 },
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