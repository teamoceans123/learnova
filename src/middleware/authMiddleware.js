const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");
const env = require("../config/env");

const extractToken = (req) => {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return req.cookies?.token || null;
};

const protect = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!user) {
      return next(new ApiError(401, "Invalid token"));
    }

    req.user = user;
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired token"));
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, "Forbidden"));
  }
  return next();
};

module.exports = { protect, requireRole };
