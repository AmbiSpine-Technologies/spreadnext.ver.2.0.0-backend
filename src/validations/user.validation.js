import Joi from "joi";
const USERNAME_REGEX = /^(?![0-9._])(?!.*[_.]{2})[a-zA-Z0-9._]{3,20}(?<![_.])$/;
export const registerValidation = Joi.object({
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  mobileNo: Joi.string().optional().allow(""),
  userName: Joi.string()
    .pattern(USERNAME_REGEX)
    .required()
    .messages({
      "string.pattern.base": 
        "Username 3-20 characters ka hona chahiye, letter se start hona chahiye, aur usmein lagatar do dots ya underscores nahi hone chahiye."
    }),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).optional(),
  confirmPassword: Joi.valid(Joi.ref("password")).optional(),
  isEmailVerified: Joi.boolean().optional()
});

export const loginValidation = Joi.object({
  identifier: Joi.string().optional(),
  password: Joi.string().optional(),
  rememberMe: Joi.boolean().optional()
});
