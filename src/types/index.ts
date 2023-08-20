interface User {
  id: number;
  balance: string;
  firstName: string;
  lastName: string;
  refreshToken: string | null;
  password: string;
  alias: string;
  email: string;
}

interface RefreshTokenPayload {
  id: number;
}

type ProfileUser = Omit<User, 'password' | 'refreshToken'>;
type AccessTokenPayload = Omit<User, 'password' | 'refreshToken' | 'balance'>;

type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export type {
  User,
  ProfileUser,
  AtLeast,
  AccessTokenPayload,
  RefreshTokenPayload,
};
