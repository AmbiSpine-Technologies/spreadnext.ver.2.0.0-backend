import { registerValidation, loginValidation } from "../validations/user.validation.js";
import { registerService, loginService, googleSignupService, googleLoginService, findInactiveUsersService } from "../services/auth.service.js";
import { MSG } from "../constants/messages.js";
import User from "../models/user.model.js";
import { sendPasswordResetOTP } from "../services/otp.service.js";
import OTP from "../models/otp.model.js";;
import bcrypt from "bcrypt";


export const registerUser = async (req, res) => {
  try {
    const { email, isEmailVerified } = req.body;

    if (!isEmailVerified)
      return res.status(400).json({ message: "Please verify your email first" });

    const { error } = registerValidation.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const result = await registerService(req.body);
    res.status(result.success ? 201 : 400).json(result);

  } catch (err) {
    res.status(500).json({ message: MSG.ERROR.SERVER_ERROR });
  }
};



export const googleSignupController = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Token missing",
      });
    }

    const result = await googleSignupService(idToken);
    return res.status(200).json(result);

  } catch (err) {
    console.error("Google Signup controller error:", err.message);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};


export const resetPasswordController = async (req, res) => {
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  await User.findOneAndUpdate(
    { email },
    { password: hashed }
  );

  await OTP.deleteMany({ email });

  res.json({ success: true, message: "Password updated" });
};

export const googleLoginController = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Token missing",
      });
    }

    const result = await googleLoginService(idToken);
    return res.status(200).json(result);

  } catch (err) {
    console.error("Google Login controller error:", err.message);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getInactiveUsers = async (req, res) => {
  try {
    const users = await findInactiveUsersService();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { error } = loginValidation.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { identifier, password, rememberMe } = req.body;

    const result = await loginService(identifier, password, rememberMe);
    res.status(result.success ? 200 : 400).json(result);

  } catch (err) {
    res.status(500).json({ message: MSG.ERROR.SERVER_ERROR });
  }
};


export const getAllUsersController = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "profiles",          // collection name
          localField: "_id",
          foreignField: "userId",
          as: "profile",
        },
      },
      {
        $unwind: {
          path: "$profile",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};


export const checkUsernameController = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      userName: new RegExp(`^${username}$`, "i"), // case-insensitive
    });

    if (user) {
      return res.status(200).json({
        success: false,
        available: false,
        message: "Username already taken",
      });
    }

    res.status(200).json({
      success: true,
      available: true,
      message: "Username available",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking username",
    });
  }
};


