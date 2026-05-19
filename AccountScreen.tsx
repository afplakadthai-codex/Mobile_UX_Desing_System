import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../features/auth/AuthContext';

export function AccountScreen() {
  const { isAuthenticated, logout, status, user } = useAuth();

  const isLoading = status === 'loading';

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.title}>Loading account…</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Account</Text>
        <Text style={styles.subtitle}>You are currently browsing as a guest.</Text>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Login</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Register</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.subtitle}>Welcome back{user?.name ? `, ${user.name}` : ''}.</Text>
      <Pressable style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Profile</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryButton}
        onPress={() => {
          void logout();
        }}
      >
        <Text style={styles.secondaryButtonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#F8FAF9',
    flex: 1,
    gap: 12,
    padding: 24,
  },
  title: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#334155',
    fontSize: 15,
    marginBottom: 8,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#0B7A5A',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
});
