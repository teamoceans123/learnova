const asyncHandler = require("../utils/asyncHandler");
const { enrollInCourse, dropCourse, getMyCourses } = require("../services/enrollmentService");

const enrollCourseController = asyncHandler(async (req, res) => {
  const enrollment = await enrollInCourse(req.user.id, Number(req.params.courseId));
  res.status(201).json(enrollment);
});

const dropCourseController = asyncHandler(async (req, res) => {
  await dropCourse(req.user.id, Number(req.params.courseId));
  res.status(200).json({ message: "Course dropped successfully" });
});

const myCoursesController = asyncHandler(async (req, res) => {
  const enrollments = await getMyCourses(req.user.id);
  res.status(200).json(enrollments);
});

module.exports = { enrollCourseController, dropCourseController, myCoursesController };
