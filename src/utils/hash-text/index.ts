import { genSalt, hashSync } from 'bcrypt';

export async function hashText(password: string): Promise<string> {
  const salt = await genSalt(+10);
  return hashSync(password, salt);
}
