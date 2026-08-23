import DailyStat from '../models/DailyStat';

export const EMAIL_DAILY_LIMIT = 300;

export const incrementEmailCount = async (): Promise<void> => {
    const today = new Date().toISOString().split('T')[0];
    await DailyStat.findOneAndUpdate(
        { date: today },
        { $inc: { emailCount: 1 } },
        { upsert: true, new: true }
    );
};

export const canSendEmail = async (): Promise<boolean> => {
    const today = new Date().toISOString().split('T')[0];
    const stat = await DailyStat.findOne({ date: today });
    
    if (!stat) return true; // No record means 0 sent
    
    return stat.emailCount < EMAIL_DAILY_LIMIT;
};

export const getDailyEmailUsage = async (): Promise<number> => {
    const today = new Date().toISOString().split('T')[0];
    const stat = await DailyStat.findOne({ date: today });
    return stat ? stat.emailCount : 0;
};
