import express, { Request, Response, Router } from 'express';
import _ from 'lodash';
import validateUser from '../validations/validateUser';
import validateLogin from '../validations/validateLogin';
import validateGameCodesRequest from '../validations/validateGameCodesRequest';
import { User, IUser } from '../models/users';
import { 
  findUserByEmail, 
  saveUser, 
  generateGameCodes, 
  findUserByEmailAndGameCode } 
from '../repository/users';

const router: Router = express.Router();

router.get('/health-check', (_req: Request, res: Response) => {
    res.status(200).send('Service is up and running');
});

router.post('/register', async (req: Request, res: Response) => {
    try {
        const { error } = validateUser.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let user: IUser | null = await findUserByEmail(req.body.email);
        if (user) return res.status(400).send("User already registered");

        user = new User(_.pick(req.body, ['email']));
        await saveUser(user);

        res.send(_.pick(user, ['_id', 'email', 'loginAttempt']));
    } catch (err) {
        console.log('Error', err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/generate-game-codes', async (req: Request, res: Response) => {
    try {
        const { error } = validateGameCodesRequest.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user: IUser | null = await generateGameCodes(req.body.email, req.body.noOfGameCodes || 1);
        if (!user) return res.status(400).send("User not found");

        res.send(_.pick(user, ['email', 'gameCodes', 'loginAttempt']));
    } catch (err) {
        console.log('Error', err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/login', async (req: Request, res: Response) => {
    const { error } = validateLogin.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { email, gameCode } = req.body;

    let user: IUser | null = await findUserByEmailAndGameCode(email, gameCode);

    if (!user) {
        user = await findUserByEmail(email);
        if (user) {
            user.loginAttempt = (user.loginAttempt || 0) + 1;

            if (user.loginAttempt > 5) {
                await saveUser(user);
                return res.status(403).send("Try after some time.");
            }

            await saveUser(user);
        }
        return res.status(400).send("Invalid user or game code :(");
    }

    user.loginAttempt = 0;
    await saveUser(user);

    const token: string = user.generateAuthToken();
    res.send(token);
});

export default router;
