import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyStat extends Document {
    date: string;
    emailCount: number;
}

const dailyStatSchema: Schema = new Schema(
    {
        date: {
            type: String,
            required: true,
            unique: true,
            index: true, // YYYY-MM-DD
        },
        emailCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export default mongoose.model<IDailyStat>('DailyStat', dailyStatSchema);
