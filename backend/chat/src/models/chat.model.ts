import mongoose, { Document, Schema } from "mongoose";

export interface IChat extends Document {
  users: string[];
  latestMessage: {
    text: string;
    sender: string;
    timestamp: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

const schema: Schema<IChat> = new Schema(
  {
    users: {
      type: [String],
      required: true,
    },
    latestMessage: {
      text: String,
      sender: String,
      timestamp: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

const chatModel = mongoose.model<IChat>("Chat", schema);
export default chatModel;
