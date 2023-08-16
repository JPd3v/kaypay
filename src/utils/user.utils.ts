import { ProfileUser, User } from '@src/types';

function transformToProfileUser(user: User): ProfileUser {
  return {
    alias: user.alias,
    balance: user.balance,
    email: user.email,
    firstName: user.email,
    lastName: user.lastName,
    id: user.id,
  };
}

// eslint-disable-next-line import/prefer-default-export
export { transformToProfileUser };
