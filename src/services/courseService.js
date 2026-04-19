const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");

const getAllCourses = async () => {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { enrollments: true },
      },
    },
  });

  return courses.map((course) => ({
    ...course,
    enrolledCount: course._count.enrollments,
    remainingSeats: Math.max(0, course.capacity - course._count.enrollments),
  }));
};

const createCourse = async (payload) =>
  prisma.course.create({
    data: payload,
  });

const updateCourse = async (id, payload) => {
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Course not found");
  }

  const enrolledCount = await prisma.enrollment.count({ where: { courseId: id } });
  if (payload.capacity < enrolledCount) {
    throw new ApiError(400, `Capacity cannot be lower than enrolled students (${enrolledCount})`);
  }

  return prisma.course.update({
    where: { id },
    data: payload,
  });
};

const deleteCourse = async (id) => {
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Course not found");
  }

  await prisma.course.delete({ where: { id } });
};

module.exports = { getAllCourses, createCourse, updateCourse, deleteCourse };
