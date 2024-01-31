const express = require("express");

const ctrl = require("../../controllers/contacts");

const { validateBody, isValidId, authenticete } = require("../../middlewares");

const { schemas } = require("../../models/contact");

const router = express.Router();

router.get("/", authenticete, ctrl.listContacts);

router.get("/:contactId", authenticete, isValidId, ctrl.getContactById);

router.post(
  "/",
  authenticete,
  validateBody(schemas.addSchema, "add"),
  ctrl.addContacts
);

router.delete("/:contactId", authenticete, isValidId, ctrl.removeContact);

router.put(
  "/:contactId",
  authenticete,
  isValidId,
  validateBody(schemas.addSchema, "update"),
  ctrl.updateContact
);

router.patch(
  "/:contactId/favorite",
  authenticete,
  isValidId,
  validateBody(schemas.updateFavoriteSchema, "fieldMissing"),
  ctrl.updateStatusContact
);

module.exports = router;
