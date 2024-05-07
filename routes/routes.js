import express from 'express'
import { Register, Login, Auth } from '../controller/userController.js'
import { body } from 'express-validator'
import { VerifyUser } from '../middleware/VerifyUser.js'
import { createContact, getContacts, getContact, updateContact, deleteContact } from '../controller/contactController.js'
import { createMessage, getMessage, sendMessage, sendSmsToContacts, sendEmailToContacts  } from '../controller/messageController.js'


const router = express.Router()

//user routes

router.post('/register', [
    body('name').trim().notEmpty().withMessage("Name Should Not Be Empty"),
    body('email').trim().notEmpty().withMessage("Email Should Not Be Empty")
    .isEmail().withMessage("Invalid Email !!!"),
    body('password').trim().notEmpty().withMessage("Password Should Not Be Empty")
    .isLength({min: 5, max: 30}).withMessage("Password Length Must Be 5 to 30 characters")
], Register)

router.post('/login', [
    body('email').trim().notEmpty().withMessage("Email Should Not Be Empty")
    .isEmail().withMessage("Invalid Email !!!"),
    body('password').trim().notEmpty().withMessage("Password Should Not Be Empty")
    .isLength({min: 5, max: 30}).withMessage("Password Length Must Be 5 to 30 characters")
], Login)

router.get('/verify', VerifyUser, Auth)

//contact create routes
router.post('/add-contact', VerifyUser, createContact)

//message routes
// Separate routes for each action
router.post('/send-alert', VerifyUser, sendMessage, createMessage);

router.get('/messages', VerifyUser, getMessage);

//contact fetch routes
router.get('/contacts', VerifyUser, getContacts )
router.get('/contact/:id', VerifyUser, getContact )
router.put('/update-contact/:id', VerifyUser, updateContact )
router.delete('/contact/:id', VerifyUser, deleteContact )

export {router as Router}