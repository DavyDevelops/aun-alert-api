import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        // require: true
    },
    email: {
        type: String,
        // require: true,
        unique: true
    },
    phone: {
        type: String,
        // require: true,
        unique: true
    },
    address: {
        type: String
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
});

// Compound index to ensure email and phone are unique per user
ContactSchema.index({ postedBy: 1, email: 1 }, { unique: true });
ContactSchema.index({ postedBy: 1, phone: 1 }, { unique: true });

const ContactModel = mongoose.model('contact', ContactSchema);

export { ContactModel };
