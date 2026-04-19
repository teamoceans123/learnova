const express = require("express");
const {
  getCourses,
  createCourseController,
  updateCourseController,
  deleteCourseController,
} = require("../controllers/courseController");
const { protect, requireRole } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { courseBodySchema, courseParamSchema } = require("../validators/courseValidators");

const router = express.Router();

router.get("/", getCourses);
router.post("/", protect, requireRole("ADMIN"), validate(courseBodySchema), createCourseController);
router.put(
  "/:id",
  protect,
  requireRole("ADMIN"),
  validate(courseParamSchema, "params"),
  validate(courseBodySchema),
  updateCourseController,
);
router.delete(
  "/:id",
  protect,
  requireRole("ADMIN"),
  validate(courseParamSchema, "params"),
  deleteCourseController,
);

module.exports = router;
