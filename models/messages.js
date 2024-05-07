import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    message: {
      type: String,
      required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
      },
      sentAt: {
        type: Date,
        default: Date.now
    }
  });

  const MessageModel = mongoose.model('Message', messageSchema);

  export { MessageModel };