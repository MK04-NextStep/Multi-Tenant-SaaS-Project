const { body } = require('express-validator');

let emailValidator = body("email").trim()
                    .notEmpty().withMessage("Email should not be empty")
                    .isEmail().withMessage("Invalid Email")

let passwordValidator = body("password").trim()
                       .notEmpty().withMessage("Password should not be empty")
                       .isStrongPassword({
                        minLength: 8,
                        minLowercase: 1,
                        minUppercase: 1,
                        minNumbers: 1,
                        minSymbols: 1
                       }).withMessage(" Password must have uppercase, lowercase, number and symbol")

let authValidator = [ emailValidator, passwordValidator]

module.exports = { authValidator, emailValidator, passwordValidator }