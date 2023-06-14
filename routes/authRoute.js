import express from 'express';
import {registerController,loginController,testController, forgotPasswordController, updateProfileController, getOrdersController, getAllOrdersController, orderStatusController,} from '../controllers/authController.js';
import {isAdmin, requireSignIn} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/register', registerController);

//Login
router.post('/login', loginController);

// forgot password POst
router.post('/forgot-password',forgotPasswordController);





 // test rout
 router.get('/test',requireSignIn, isAdmin,  testController)

 // proteted rout
 router.get('/user-auth',requireSignIn,(req,res)=>{
    res.status(200).send({ok:true});
 });
 router.get('/admin-auth',requireSignIn,isAdmin,(req,res)=>{
    res.status(200).send({ok:true});
 });

 //update profile
router.put("/profile", requireSignIn, updateProfileController);

//orders
 router.get("/orders", requireSignIn, getOrdersController);

// //all orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);

// // order status update
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);
export default router;



