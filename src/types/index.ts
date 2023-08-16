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

type ProfileUser = Omit<User, 'password' | 'refreshToken'>;

type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export type { User, ProfileUser, AtLeast };
