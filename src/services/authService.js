const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");
const env = require("../config/env");

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

const signToken = (userId) =>
  jwt.sign(
    {
      userId,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );

const register = async (payload) => {
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    throw new ApiError(409, "Email already in use");
  }

  const password = await bcrypt.hash(payload.password, 12);
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password,
      role: payload.role,
    },
  });

  return { user: sanitizeUser(user), token: signToken(user.id) };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  return { user: sanitizeUser(user), token: signToken(user.id) };
};

module.exports = { register, login };
