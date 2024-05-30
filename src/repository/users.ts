import { IUser, User } from '../models/users';
import { IGameCode, GameCode } from '../models/gameCodes';

export async function findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
}

export async function saveUser(user: IUser): Promise<void> {
    await user.save();
}

export async function generateGameCodes(email: string, noOfGameCodes: number): Promise<IUser | null> {
    const user: IUser | null = await User.findOne({ email });
    if (!user) return null;

    const gameCodes: IGameCode[] = user.gameCodes || [];

    for (let i = 0; i < noOfGameCodes; i++) {
        const gameCode: string = generateRandomCode();
        const newGameCode: IGameCode = new GameCode({
            code: gameCode,
            createdAt: new Date()
        });
        gameCodes.push(newGameCode);
    }

    user.gameCodes = gameCodes;
    user.noOfGameCodes = gameCodes.length;

    await user.save();
    return user;
}

export async function findUserByEmailAndGameCode(email: string, gameCode: string): Promise<IUser | null> {
    return await User.findOne({ email, 'gameCodes.code': gameCode });
}

export function generateRandomCode(): string {
    const chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result: string = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
