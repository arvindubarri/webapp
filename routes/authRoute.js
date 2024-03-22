import express from "express";
import {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  uplodController,
  recivedQueryController,
  queryController,
} from "../controller/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import multer from "multer";

// const upload = multer({ dest: "uploads/" });

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });
//router object
const router = express.Router();



//routing
//REGISTER || METHOD POST
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", loginController);

//LOGIN || POST
router.post("/forgot-password", forgotPasswordController);

// contact us query
router.post("/contactus", queryController);
//test routes
router.get("/test", requireSignIn, isAdmin, testController);

//test routes
//protected  User route auth
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

//protected Admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});
// router.get("/allvoters",requireSignIn, )

router.post(
  "/uploads",
  requireSignIn,
  isAdmin,
  upload.single("csv"),
  uplodController,
  (req, res) => {
    res.status(200).send({ ok: true });
  }
);

// all queries
router.get("/queries", requireSignIn, isAdmin, recivedQueryController);

export default router;
