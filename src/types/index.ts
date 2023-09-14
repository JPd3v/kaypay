interface User {
  id: number;
  balance: number;
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

interface Deposit {
  userId: number;
  createdAt: string;
  balance: number;
  id: number;
}

interface Transference {
  id: number;
  senderId: number;
  receiverId: number;
  createdAt: string;
  balance: number;
}

interface PublicTransference {
  id: number;
  receiverAlias: string;
  type: 'sended' | 'received';
  createdAt: string;
  balance: number;
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
  Deposit,
  Transference,
  PublicTransference,
};
