import express from "express";
import { getCaretakers, getPatients, assignPatient,caretakerLogin,getCaretakerProfile,getCaretakerSettings,putCaretakerSettings } from "../controllers/caretaker.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getCaretakers);
router.get("/:id/patients", auth, getPatients);
router.post("/assign", auth, assignPatient);
router.post("/login", caretakerLogin);
router.get("/profile", auth, getCaretakerProfile);
router.get("/settings", auth, getCaretakerSettings);
router.put("/settings", auth, putCaretakerSettings);

export default router;