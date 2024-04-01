import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  getAllFamiliesController,
  getAllVillagesController,
  getAllVoterController,
  getAllVotersController,
  getFamilyVottersController,
  getVillageVottersController,
  getVoterDetailController,
  searchVotersController,
  updateVoterDetailsController,
} from "../controller/productController.js";
import formidable from "express-formidable";
const router = express.Router();

//routes

// search
router.get("/search/:searchTerm", searchVotersController);
// local store voters
router.get("/allvoter", getAllVoterController);

// all votes
router.get("/allvotes", getAllVotersController);

router.get("/allvotes/:slug", getVoterDetailController);

router.put("/allvotes/:slug", updateVoterDetailsController);

router.get("/village", getAllVillagesController);

router.get("/village/:slug", getVillageVottersController);

router.get("/family", getAllFamiliesController);

router.get("/family/:slug", getFamilyVottersController);

export default router;
