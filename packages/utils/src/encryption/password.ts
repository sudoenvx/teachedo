import argon2, {
  argon2id,
} from "argon2";

const passwordHashOptions: argon2.HashOptions = {
  type: argon2id,
  memoryCost: 19_456, // Approximately 19 MiB
  timeCost: 2,
  parallelism: 1
};

/**
 * Hashes a plain-text password using Argon2id.
 */
export function hashPassword(password: string, overrides?: Partial<argon2.HashOptions>): Promise<string> {
  return argon2.hash(password, overrides ? { ...passwordHashOptions, ...overrides } : passwordHashOptions);
}


type VerifyPasswordProps = {
	password: string
	passwordHash: string
	secret?: string
}

/**
 * Verifies a plain-text password against an Argon2 hash.
 */
export function verifyPassword({
	password,
	passwordHash,
	secret
}: VerifyPasswordProps): Promise<boolean> {
	return argon2.verify(passwordHash, password, {
			secret: secret ? Buffer.from(secret) : undefined
	});
}
