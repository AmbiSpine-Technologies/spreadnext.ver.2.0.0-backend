import User from "../models/user.model.js";
import { MSG } from "../constants/messages.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import Profile from "../models/profile.model.js";
import admin from "../config/firebase.js";

export const registerService = async (data) => {
  const { email, userName, password } = data;

  const existing = await User.findOne({ 
    $or: [{ email }, { userName }] 
  });

  if (existing) {
    return { success: false, message: MSG.AUTH.USER_EXISTS };
  }

  const hashed = await hashPassword(password);

  const user = await User.create({ 
    ...data, 
    password: hashed,
    emailVerified: true, 
    lastLogin: new Date()
    
  });

  await Profile.create({
    userId: user._id,
    personalInfo: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email,
      userName: user.userName,
    },
  });
  const token = generateToken(user._id);
     
  
  return {
    success: true,
    message: MSG.AUTH.REGISTER_SUCCESS,
    token,
    data: user
  };
};

export const loginService = async (identifier, password, rememberMe) => {
   const user = await User.findOne({
    $or: [
      { email: identifier },
      { userName: identifier },
    ],
  });

  if (!user) {
    return { success: false, message: MSG.AUTH.INVALID_CREDENTIALS };
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    return { success: false, message: MSG.AUTH.INVALID_CREDENTIALS };
  }

   const tokenExpiry = rememberMe ? "30d" : "7d";

  const token = generateToken(user._id, tokenExpiry);
   user.lastLogin = new Date();
   await user.save();
  return {
    success: true,
    message: MSG.AUTH.LOGIN_SUCCESS,
    token,
    user: {
      _id: user._id,
      userName: user.userName,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
    },
    data: user, 
  };
};


export const generateUniqueUsername = async (email) => {
  let baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
  let username = baseUsername;
  let count = 1;

  while (await User.findOne({ userName: username })) {
    username = `${baseUsername}${count++}`;
  }

  return username;
};




export const googleSignupService = async (idToken) => {
  const decoded = await admin.auth().verifyIdToken(idToken);
  const { email, name, picture, uid } = decoded;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists. Please login.");
  }

  const username = await generateUniqueUsername(email);

  const user = await User.create({
    email,
    userName: username,
    firebaseUid: uid,
    authProvider: "google",
    firstName: name?.split(" ")[0] || "",
    lastName: name?.split(" ").slice(1).join(" ") || "",
    emailVerified: true,
    onboardingCompleted: false,
    lastLogin: new Date()
     
  });

 const  profile =  await Profile.create({
    userId: user._id,
    personalInfo: {
      firstName: user.firstName,
      lastName: user.lastName,
      email,
      userName: username,
      profileImage: {
  url: picture || "",
  public_id: null
}
    },
  });

  return {
    success: true,
    token: generateToken(user._id),
     loginUser: profile,
  };
};

export const googleLoginService = async (idToken) => {
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { email, uid } = decoded;

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User not found. Please signup first.");
    }

    // Update fields
    if (!user.firebaseUid) {
      user.firebaseUid = uid;
      user.authProvider = "google";
      user.emailVerified = true;
    }

    // Always update last login
    user.lastLogin = new Date();

    await user.save();

    // Profile fetch
    const profile = await Profile.findOne({ userId: user._id });

    return {
      success: true,
      token: generateToken(user._id),
      loginUser: profile || user, // fallback
    };

  } catch (error) {
    console.error("Google Login Error:", error.message);
    throw new Error("Google login failed");
  }
};


// export const findInactiveUsersService = async () => {


//   const fiftyDaysAgo = new Date();
//   console.log(fiftyDaysAgo)
//   fiftyDaysAgo.setDate(fiftyDaysAgo.getDate() - 20);
// console.log("curretnt date to minus", fiftyDaysAgo);
//   console.log("Filter date:", fiftyDaysAgo);

//   const inactiveUsers = await Profile.find({
//     updatedAt: { $lt: fiftyDaysAgo }
//   })
//     .populate({
//       path: "userId",
//       select: "firstName lastName mobileNo email"
//     })
//     .lean();

//   console.log("Inactive users found:", inactiveUsers.length);

//   return inactiveUsers.map((profile) => {
//     const missingFields = [];

//     if (!profile.profileSummary) missingFields.push("profileSummary");
//     if (!profile.skills?.technical?.length) missingFields.push("technicalSkills");
//     if (!profile.education?.length) missingFields.push("education");
//     if (!profile.skills?.technical.length) missingFields.push("education");
//     if (!profile.skills?.soft.length) missingFields.push("education");

//     const inactiveDays = Math.floor(
//       (new Date() - new Date(profile.updatedAt)) / (1000 * 60 * 60 * 24)
//     );

//     return {
//       userId: profile.userId?._id,
//       firstName: profile.userId?.firstName,
//       lastName: profile.userId?.lastName,
//       mobileNo: profile.userId?.mobileNo,
//       email: profile.userId?.email, 
//       profileUpdatedAt: profile.updatedAt,
//       missingFields,
//       inactiveDays
//     };
//   });
// };


export const findInactiveUsersService = async () => {
  const fiftyDaysAgo = new Date();
  fiftyDaysAgo.setDate(fiftyDaysAgo.getDate() - 20);

  const users = await Profile.find({
    updatedAt: { $lt: fiftyDaysAgo }
  })
    .populate({
      path: "userId",
      select: "firstName lastName mobileNo email isPremium"
    })
    .lean();

  return users.map((profile) => {
    const missingFields = [];

    if (!profile.profileSummary) missingFields.push("profileSummary");
    if (!profile.skills?.technical?.length) missingFields.push("technicalSkills");
    if (!profile.education?.length) missingFields.push("education");

    return {
      userId: profile.userId?._id,
      firstName: profile.userId?.firstName,
      mobileNo: profile.userId?.mobileNo,
      email: profile.userId?.email,
      journeyType: profile.personalInfo?.journeyType || "",
      missingFields,
      updatedAt: profile.updatedAt
    };
  });
};