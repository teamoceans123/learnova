const express = require("express");
const {
  enrollCourseController,
  dropCourseController,
} = require("../controllers/enrollmentController");
const { protect, requireRole } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { enrollmentParamSchema } = require("../validators/courseValidators");

const router = express.Router();

router.use(protect, requireRole("STUDENT", "ADMIN"));
router.post("/:courseId", validate(enrollmentParamSchema, "params"), enrollCourseController);
router.delete("/:courseId", validate(enrollmentParamSchema, "params"), dropCourseController);

module.exports = router;
