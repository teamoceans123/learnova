const { z } = require("zod");

const courseBodySchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  instructor: z.string().trim().min(2, "Instructor name must be at least 2 characters"),
  capacity: z
    .number({ message: "Capacity must be a number" })
    .int("Capacity must be an integer")
    .positive("Capacity must be greater than 0"),
});

const courseParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const enrollmentParamSchema = z.object({
  courseId: z.coerce.number().int().positive(),
});

module.exports = { courseBodySchema, courseParamSchema, enrollmentParamSchema };
