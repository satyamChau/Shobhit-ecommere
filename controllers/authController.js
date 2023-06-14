import userModel from "../models/userModel.js";
import { comparePasssword, hashpassword } from  "./../helpers/authHelper.js";
import JWT from "jsonwebtoken";


export const registerController =async (req, res) =>{
    try{
        const {name, email, password,  phone, address,question} = req.body;
        if(!name){
            return res.send({message:'Name is Required'});
        }
        if(!email){
            return res.send({message:'Email is Required'});
        }
        if(!password){
            return res.send({message:'Password is Required'});
        }
        if(!phone){
            return res.send({message:'phone is Required'});
        }
        if(!address){
            return res.send({message:'Address is Required'});
        }
        if(!question){
            return res.send({message:'question is Required'});
        }

        // check user

        const existingUser = await userModel.findOne({email});
            
        // check existing user
        if(existingUser){
            return res.status(200).send({
                success:false,
                message: 'Already Register please login',
                
            });
        }

        // register user
       const hashedPassword = await hashpassword(password); 

        // save

        const user = await new userModel({name, email, phone, address, password:hashedPassword,question}).save();

        res.status(201).send({
            success:true,
            message:'User Regiter Successfully',
            user,
            
        });
      

    } catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            message:'Error in Registration',
            error,
        });
    }
};

// Post login

export const loginController = async(req,res)=>{
    try{
        const {email, password} = req.body
        if(!email || !password){
            return res.status(404).send({
                success: false,
                message: 'Invalid email or password'
            })
        }

        const user = await userModel.findOne({email})
        if(!user){
            return res.status(404).send({
                success: false,
                message:'Email is not Register'
            })
        }

        const match = await comparePasssword(password, user.password)
        if(!match){
            return res.status(200).send({
                success:false,
                message: 'Invalid Password'
            });
        }
        const token = await JWT.sign({ _id:user._id}, process.env.JWT_SECRET, 
          {expiresIn:'7d',
    });

    res.status(200).send({
        success:true,
        message:'login successfully',
        user:{
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role:user.role,


        },
        token,
    });



    } 
    catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Error in login',
            error,
        });
    }
};


export const forgotPasswordController = async(req,res)=>{
    try{
        const {email,question,newPassword} = req.body
        if(!email){
            res.status(500).send({message:'Email is required'})
        }
        if(!question){
            res.status(500).send({message:'question is required'})
        }
        if(!newPassword){
            res.status(500).send({message:'newpassword is required'})
        }
// check email and question
        const user = await userModel.findOne({email,question})
        // validation
        if(!user){
            res.status(404).send({
                success:false,
                message:'Wrong email or question'
            })
        }
        const hashed = await hashpassword(newPassword)
        await userModel.findByIdAndUpdate(user._id,{password:hashed})
        res.status(200).send({
            success:true,
            message:'Password successfully reset',
            
        })

    }
    catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Something went wrong',
            error

        })
    }
}
// test controller
export const testController = (req,res)=>{
    try{
        res.send("Protected Route");

    }catch(error){
        console.log(error);
        res.send({error});
    }
    
};


export const updateProfileController = async (req, res) => {
    try {
      const { name, email, password, address, phone } = req.body;
      const user = await userModel.findById(req.user._id);
      //password
      if (password && password.length < 6) {
        return res.json({ error: "Passsword is required and 6 character long" });
      }
      const hashedPassword = password ? await hashPassword(password) : undefined;
      const updatedUser = await userModel.findByIdAndUpdate(
        req.user._id,
        {
          name: name || user.name,
          password: hashedPassword || user.password,
          phone: phone || user.phone,
          address: address || user.address,
        },
        { new: true }
      );
      res.status(200).send({
        success: true,
        message: "Profile Updated SUccessfully",
        updatedUser,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: "Error WHile Update profile",
        error,
      });
    }
  };
  
  //orders
export const getOrdersController = async (req, res) => {
    try {
      const orders = await orderModel
        .find({ buyer: req.user._id })
        .populate("products", "-photo")
        .populate("buyer", "name");
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error WHile Geting Orders",
        error,
      });
    }
  };


  export const getAllOrdersController = async (req, res) => {
    try {
      const orders = await orderModel
        .find({})
        .populate("products", "-photo")
        .populate("buyer", "name")
        .sort({ createdAt: "-1" });
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error WHile Geting Orders",
        error,
      });
    }
  };
  
  //order status
  export const orderStatusController = async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const orders = await orderModel.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      );
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error While Updateing Order",
        error,
      });
    }
  };