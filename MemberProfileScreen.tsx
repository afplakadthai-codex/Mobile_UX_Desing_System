import { ReactElement, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type MemberProfileScreenProps = {
  token: string;
  onBack: () => void;
};

type MemberProfileData = {
  id?: number | string;
  user_id?: number | string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  account_status?: string;
};

type MeResponse = {
  ok?: boolean;
  data?:
    | MemberProfileData
    | {
        user?: MemberProfileData;
        profile?: MemberProfileData;
      };
  user?: MemberProfileData;
  message?: string;
  error?: {
    message?: string;
  };
};

export function MemberProfileScreen({ token, onBack }: MemberProfileScreenProps): ReactElement {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [profile, setProfile] = useState<MemberProfileData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async (): Promise<void> => {
      setLoading(true);
      setErrorMessage('');

      try {
        const response = await fetch('https://bettavaro.com/api/mobile/v1/me.php', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result: MeResponse = await response.json();

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          setErrorMessage(result.error?.message ?? result.message ?? 'Failed to load member profile.');
          return;
        }

        const profileData =
          result.data?.user ??
          result.data?.profile ??
          result.data ??
          result.user ??
          null;

        if (!profileData) {
          setErrorMessage('Member profile data is unavailable.');
          return;
        }

        setProfile(profileData);
      } catch {
        if (isMounted) {
          setErrorMessage('Failed to load member profile.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const userId = profile?.id ?? profile?.user_id;
  const accountStatus = profile?.account_status ?? profile?.status;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} activeOpacity={0.85} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Member Profile</Text>

      {loading ? (
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#d4af37" />
          <Text style={styles.loadingText}>Loading your member profile...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.card}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile Details</Text>
          <Text style={styles.cardItem}>Name: {profile?.name ?? 'N/A'}</Text>
          <Text style={styles.cardItem}>Email: {profile?.email ?? 'N/A'}</Text>
          <Text style={styles.cardItem}>Role: {profile?.role ?? 'N/A'}</Text>
          <Text style={styles.cardItem}>User ID: {userId ?? 'N/A'}</Text>
          {accountStatus ? <Text style={styles.cardItem}>Account Status: {accountStatus}</Text> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#d4af37',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    color: '#d4af37',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  card: {
    backgroundColor: '#0f3a32',
    borderColor: '#d4af37',
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    gap: 12,
  },
  cardTitle: {
    color: '#f6e6b4',
    fontSize: 24,
    fontWeight: '700',
  },
  cardItem: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 22,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 15,
  },
  errorText: {
    color: '#ffb3b3',
    fontSize: 15,
    lineHeight: 22,
  },
});