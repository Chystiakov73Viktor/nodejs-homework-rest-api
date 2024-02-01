const { HttpError } = require("../helpers");

const validateBody = (schema, validationType) => {
  const errorMessages = {
    add: "missing fields",
    update: "missing fields",
    fieldMissing: "missing field favorite",
    requiredField: "missing required field email",
  };
  const func = (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      const errorMessage = errorMessages[validationType] || error.message;
      next(HttpError(400, errorMessage));
    } else {
      next();
    }
  };

  return func;
};

module.exports = validateBody;
