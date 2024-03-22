import express from "express";
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
import {  recivedQueryController, usersController } from "../controller/authController.js";


const router = express.Router()

//routes 


router.get('/queries',requireSignIn,isAdmin,recivedQueryController)
router.get('/users',requireSignIn,isAdmin,usersController);

export default router;