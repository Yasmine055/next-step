const express = require("express");
const router = express.Router();
const datacenterController = require("../../controllers/cloud/datacenterController");

// Routes
router.get("/", datacenterController.getAllDatacenters);
router.post("/", datacenterController.createDatacenter);
router.get("/:id", datacenterController.getDatacenterById);
router.put("/:id", datacenterController.updateDatacenter);
router.delete("/:id", datacenterController.deleteDatacenter);

module.exports = router;
