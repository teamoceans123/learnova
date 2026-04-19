const express = require("express");
const { registerUser, loginUser, logoutUser } = require("../controllers/authController");
const validate = require("../middleware/validate");
const { loginSchema, registerSchema } = require("../validators/authValidators");

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/logout", logoutUser);

module.exports = router;
