import cron from 'node-cron';
import { User, IUser } from '../models/users';

let cronJob: cron.ScheduledTask | null;

const startGameCodeCleanupJob = () => {
  cronJob = cron.schedule('0 * * * *', async () => {
    const users: IUser[] = await User.find({});
    const currentTime: Date = new Date();

    for (let user of users) {
      user.gameCodes = user.gameCodes.filter(gameCode => {
        const elapsed: number = (currentTime.getTime() - gameCode.createdAt.getTime()) / (1000 * 60 * 60);
        return elapsed < 12;
      });

      user.noOfGameCodes = user.gameCodes.length;
      await user.save();
    }
  });
};

const stopGameCodeCleanupJob = () => {
  if (cronJob) {
    cronJob.stop();
  }
};

export { startGameCodeCleanupJob, stopGameCodeCleanupJob };
