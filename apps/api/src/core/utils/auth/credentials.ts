import { randomInt } from 'node:crypto';

const PASSWORD_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

export function generateRandomPassword(length = 8): string {
    return Array.from({ length }, () => PASSWORD_CHARACTERS[randomInt(PASSWORD_CHARACTERS.length)]).join('');
}