import express from 'express';
import { MessageModel } from '../models/messages.js';
import { ContactModel } from '../models/contact.js';
import request from 'request';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';


dotenv.config({path: "./config/.env"});

const createMessage = async (req, res) => {
    const { message } = req.body;

    try {
        const newMessage = new MessageModel({
            message,
            postedBy: req.user._id
        });

        const result = await newMessage.save();
        return res.status(201).json({ success: true, ...result._doc });
    } catch (err) {
        console.error('Error saving message:', err);
        return res.status(500).json({ error: 'Failed to save message' });
    }
};




const getMessage = async (req, res) => {
    try {
        const messages = await MessageModel.find({ postedBy: req.user._id }).sort({ sentAt: 'desc' });
        return res.status(200).json({ success: true, messages });
    } catch (err) {
        console.error('Error fetching messages:', err);
        return res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

// const getMessage = async (req, res) => {
//     try {
//         const messages = await MessageModel.find({ postedBy: req.user._id }).sort({ sentAt: 'desc' });

//         // Format the sentAt timestamp to ISO 8601 format
//         const formattedMessages = messages.map(message => ({
//             ...message.toObject(),
//             sentAt: message.sentAt.toISOString() // Format timestamp to ISO 8601
//         }));

//         return res.status(200).json({ success: true, messages: formattedMessages });
//     } catch (err) {
//         console.error('Error fetching messages:', err);
//         return res.status(500).json({ error: 'Failed to fetch messages' });
//     }
// };


const sendMessage = async (req, res) => {
    const { message } = req.body;

    try {
        const contacts = await ContactModel.find({ postedBy: req.user._id });

        const smsResult = await sendSmsToContacts(contacts, message);
        const emailResult = await sendEmailToContacts(contacts, message);

        if (smsResult && emailResult) {
            const newMessage = new MessageModel({
                message,
                postedBy: req.user._id
            });

            const savedMessage = await newMessage.save();
            return res.status(201).json({ success: true, message: savedMessage });
        } else {
            throw new Error('Failed to send message via SMS or Email.');
        }
    } catch (err) {
        console.error('Error sending message:', err);
        return res.status(500).json({ error: 'Failed to send message' });
    }
};

async function sendSmsToContacts(contacts, message) {
    const phoneNumbers = contacts.map(contact => contact.phone);
    const data = {
        "to": phoneNumbers,
        "from": "AUN-lert",
        "sms": message,
        "type": "plain",
        "api_key": process.env.TERMII_API_KEY,
        "channel": "generic",
    };
    const options = {
        method: 'POST',
        url: 'https://api.ng.termii.com/api/sms/send/bulk',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) {
                console.error('SMS sending error:', error);
                reject(error);
            } else {
                console.log('SMS response:', body);
                resolve(true);
            }
        });
    });
}

async function sendEmailToContacts(contacts, message) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.USER,
            pass: process.env.APP_PASSWORD,
        }
    });

    let allEmailsSent = true;
    for (const contact of contacts) {
        const mailOptions = {
            from: process.env.USER,
            to: contact.email,
            subject: 'New Alert Message',
            text: message,
            html: `<b>${message}</b>`
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);
        } catch (error) {
            console.error('Email sending error:', error);
            allEmailsSent = false;
            break;
        }
    }

    return allEmailsSent;
}

export { createMessage, getMessage, sendMessage, sendSmsToContacts, sendEmailToContacts };

