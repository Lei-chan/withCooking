import bcrypt from "bcrypt";

export default async function hashPassword(password: string) {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (err) {
    throw err;
  }
}
