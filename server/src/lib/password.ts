import { hash, verify } from '@node-rs/argon2';

// A real argon2 hash of a throwaway value. Used to burn equivalent CPU time
// when the email doesn't exist, so login timing doesn't reveal account existence.
const DUMMY_HASH = '$argon2id$v=19$m=19456,t=2,p=1$RChxNu1zweTn2IgcmlzDUQ$2ijR2o2UNgolCKCEFXGKs1SVFoClks5wRf9bgYVnnEg';

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