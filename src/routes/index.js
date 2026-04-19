const express = require("express");
const authRoutes = require("./authRoutes");
const courseRoutes = require("./courseRoutes");
const enrollmentRoutes = require("./enrollmentRoutes");
const { myCoursesController } = require("../controllers/enrollmentController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/courses", courseRoutes);
router.use("/enroll", enrollmentRoutes);
router.get("/my-courses", protect, requireRole("STUDENT", "ADMIN"), myCoursesController);

module.exports = router;
