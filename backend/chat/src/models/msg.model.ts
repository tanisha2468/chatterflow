import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMsg extends Document {
  chatId: Types.ObjectId;
  sender: string;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  };
  msgType: "text" | "image";
  seen: boolean;
  seenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema: Schema<IMsg> = new Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    text: String,
    image: {
      url: String,
      publicId: String,
    },
    msgType: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    seenAt: Date,
  },
  { timestamps: true },
);

const msgModel = mongoose.model<IMsg>("Messages", schema);
export default msgModel;
