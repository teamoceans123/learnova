const asyncHandler = require("../utils/asyncHandler");
const { getAllCourses, createCourse, updateCourse, deleteCourse } = require("../services/courseService");

const getCourses = asyncHandler(async (req, res) => {
  const courses = await getAllCourses();
  res.status(200).json(courses);
});

const createCourseController = asyncHandler(async (req, res) => {
  const course = await createCourse(req.body);
  res.status(201).json(course);
});

const updateCourseController = asyncHandler(async (req, res) => {
  const course = await updateCourse(Number(req.params.id), req.body);
  res.status(200).json(course);
});

const deleteCourseController = asyncHandler(async (req, res) => {
  await deleteCourse(Number(req.params.id));
  res.status(200).json({ message: "Course deleted" });
});

module.exports = {
  getCourses,
  createCourseController,
  updateCourseController,
  deleteCourseController,
};
