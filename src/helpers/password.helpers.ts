import bcrypt from 'bcryptjs';

async function hashPassword(password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return hashedPassword;
}

// eslint-disable-next-line import/prefer-default-export
export { hashPassword };
