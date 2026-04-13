import jwt from "jsonwebtoken";

export const generateToken = (id,  expiresIn = "7d" ) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured in environment variables");
  }

  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

export const generateResetToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "5m"
  });
};
