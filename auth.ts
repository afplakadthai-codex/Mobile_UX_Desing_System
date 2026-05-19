import AsyncStorage from '@react-native-async-storage/async-storage';

const API_ORIGIN = 'https://bettavaro.com';
const AUTH_TOKEN_KEY = 'bettavaro_auth_token';

type Nullable<T> = T | null | undefined;

type ApiError = {
  code?: string;
  message?: string;
};

type ApiEnvelope<T> = {
  ok?: boolean;
  data?: T;
  message?: string;
  error?: string | ApiError;
  meta?: Record<string, unknown>;
};

export type AuthUser = {
  id?: string | number;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: 'user' | 'seller' | 'admin' | string;
  account_status?: string;
  [key: string]: unknown;
};

export type LoginPayload = {
  email: string;
  password: string;
  device_name?: string;
};

export type RegisterPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
  capabilities?: string[];
  onboarding?: Record<string, unknown> | null;
};

export type RegisterResponse = {
  token: string;
  user: AuthUser;
  onboarding?: Record<string, unknown> | null;
};

export type MeResponse = {
  user: AuthUser;
  capabilities?: string[];
};

export type LogoutResponse = {
  logged_out?: boolean;
  message?: string;
};

const getSecureStore = (): {
  setItemAsync: (key: string, value: string) => Promise<void>;
  getItemAsync: (key: string) => Promise<string | null>;
  deleteItemAsync: (key: string) => Promise<void>;
} | null => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const module = require('expo-secure-store') as {
      setItemAsync?: (key: string, value: string) => Promise<void>;
      getItemAsync?: (key: string) => Promise<string | null>;
      deleteItemAsync?: (key: string) => Promise<void>;
    };

    if (module?.setItemAsync && module?.getItemAsync && module?.deleteItemAsync) {
      return module as Required<typeof module>;
    }

    return null;
  } catch {
    return null;
  }
};

const secureStore = getSecureStore();

export const tokenStorage = {
  async set(token: string): Promise<void> {
    if (secureStore) {
      await secureStore.setItemAsync(AUTH_TOKEN_KEY, token);
      return;
    }

    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  async get(): Promise<string | null> {
    if (secureStore) {
      return secureStore.getItemAsync(AUTH_TOKEN_KEY);
    }

    return AsyncStorage.getItem(AUTH_TOKEN_KEY);
  },

  async clear(): Promise<void> {
    if (secureStore) {
      await secureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      return;
    }

    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  },
};

const buildUrl = (path: string) => `${API_ORIGIN}${path}`;

const getErrorMessage = <T>(payload: Nullable<ApiEnvelope<T>>, status: number): string => {
  const error = payload?.error;

  if (typeof error === 'string' && error.trim() !== '') {
    return error;
  }

  if (error && typeof error === 'object' && typeof error.message === 'string' && error.message.trim() !== '') {
    return error.message;
  }

  if (typeof payload?.message === 'string' && payload.message.trim() !== '') {
    return payload.message;
  }

  return `Request failed (${status})`;
};

const parseJsonSafely = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response (${response.status})`);
  }
};

const parseEnvelope = async <T>(response: Response): Promise<T> => {
  const raw = await parseJsonSafely(response);
  const payload = raw as Nullable<ApiEnvelope<T>>;

  if (!response.ok || payload?.ok === false) {
    throw new Error(getErrorMessage(payload, response.status));
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T;
  }

  return raw as T;
};

const authHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await fetch(buildUrl('/api/mobile/v1/login.php'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    return parseEnvelope<LoginResponse>(response);
  },

  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const response = await fetch(buildUrl('/api/mobile/v1/register.php'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    return parseEnvelope<RegisterResponse>(response);
  },

  async logout(token: string): Promise<LogoutResponse> {
    const response = await fetch(buildUrl('/api/mobile/v1/logout.php'), {
      method: 'POST',
      headers: authHeaders(token),
    });

    return parseEnvelope<LogoutResponse>(response);
  },

  async me(token: string): Promise<MeResponse> {
    const response = await fetch(buildUrl('/api/mobile/v1/me.php'), {
      method: 'GET',
      headers: authHeaders(token),
    });

    return parseEnvelope<MeResponse>(response);
  },
};
