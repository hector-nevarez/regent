import { hash, verify } from '@node-rs/argon2';

// A real argon2 hash of a throwaway value. Used to burn equivalent CPU time
// when the email doesn't exist, so login timing doesn't reveal account existence.
const DUMMY_HASH = '1$m8X20uoQq7Jwc3Bz0u4g5w$26qyAMug0HI1fMHlbJmNDfsTYQE6wAEChyFXROQAEvo';

export const hashPassword = (plain: string) => hash(plain);

export async function verifyPassword(
    storedHash: string | null,
    plain: string,
): Promise<boolean> {
    if(storedHash === null) {
        await verify(DUMMY_HASH, plain).catch(() => false);
        return false;
    }
    return verify(storedHash, plain).catch(() => false);
}