const asyncHandler = require("../utils/asyncHandler");
const { register, login } = require("../services/authService");

const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

const registerUser = asyncHandler(async (req, res) => {
  const result = await register(req.body);
  setAuthCookie(res, result.token);
  res.status(201).json(result);
});

const loginUser = asyncHandler(async (req, res) => {
  const result = await login(req.body);
  setAuthCookie(res, result.token);
  res.status(200).json(result);
});

const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = { registerUser, loginUser, logoutUser };
