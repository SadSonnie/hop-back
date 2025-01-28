const { Router } = require("express");
const userController = require("../controllers/userController");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = new Router();

//users

router.post("/users", userController.authUser); // Support singular form
router.get("/users", userController.getUser); // get all users
router.get("/users/:id", userController.getUser); // get 1 user
router.patch(
  "/users",
  adminMiddleware,
  userController.updateUser,
); // update user
router.post("/users", userController.authUser); // auth user (if new user return token)
router.delete("/users", userController.removeUser); // remove user
router.post("/users/toggle_role", adminMiddleware, userController.toggleRole); // toggle user role

//users

module.exports = router;
