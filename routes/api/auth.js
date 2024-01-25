const express = require("express");

const ctrl = require("../../controllers/auth");

const { validateBody, authenticete, upload } = require("../../middlewares");

const { schemas } = require("../../models/user");

const router = express.Router();

router.post("/register", validateBody(schemas.registerSchema), ctrl.register);

router.post("/login", validateBody(schemas.loginSchema), ctrl.login);

router.get("/current", authenticete, ctrl.getCurrent);

router.post("/logout", authenticete, ctrl.logout);

router.patch(
  "/",
  authenticete,
  validateBody(schemas.subscriptionSchema, "update"),
  ctrl.updatedSubscriptionUser
);

router.patch(
  "/avatars",
  authenticete,
  upload.single("avatar"),
  ctrl.updatedAvatar
);

module.exports = router;
