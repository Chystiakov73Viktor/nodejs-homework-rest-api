const { HttpError } = require("../helpers");

const validateBody = (schema, validationType) => {
  const func = (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      let errorMessage;

      if (validationType === "add") {
        errorMessage = "missing required name field";
      } else if (validationType === "update") {
        errorMessage = "missing fields";
      } else if (validationType === "updateFavorite") {
        errorMessage = "missing field favorite";
      } else {
        errorMessage = error.message;
      }
      next(HttpError(400, errorMessage));
    } else {
      next();
    }
  };

  return func;
};

module.exports = validateBody;
