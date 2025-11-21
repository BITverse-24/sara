import { randomBytes } from "crypto"

export const generateId = (l = 10): string => {
    const randomSessionID = Buffer.from(randomBytes(l)).toString('hex');
    return randomSessionID;
}
