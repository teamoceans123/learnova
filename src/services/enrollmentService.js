const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");

const enrollInCourse = async (userId, courseId) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) {
    throw new ApiError(409, "Already enrolled in this course");
  }

  const enrolledCount = await prisma.enrollment.count({ where: { courseId } });
  if (enrolledCount >= course.capacity) {
    throw new ApiError(400, "Course is full");
  }

  return prisma.enrollment.create({
    data: { userId, courseId },
    include: { course: true },
  });
};

const dropCourse = async (userId, courseId) => {
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!existing) {
    throw new ApiError(404, "Enrollment not found");
  }

  await prisma.enrollment.delete({ where: { id: existing.id } });
};

const getMyCourses = async (userId) =>
  prisma.enrollment.findMany({
    where: { userId },
    orderBy: { enrolledAt: "desc" },
    include: {
      course: true,
    },
  });

module.exports = { enrollInCourse, dropCourse, getMyCourses };
