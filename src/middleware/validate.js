const ApiError = require("../utils/ApiError");

const validate = (schema, source = "body") => (req, res, next) => {
  const parsed = schema.safeParse(req[source]);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(", ");
    return next(new ApiError(400, message));
  }
  req[source] = parsed.data;
  return next();
};

module.exports = validate;
