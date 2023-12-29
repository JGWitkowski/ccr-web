const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");
const { authJwt } = require("../middlewares");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted,
    ],
    controller.signup
  );
  app.post("/api/save-clam", [authJwt.verifyToken], controller.clam);

  app.post("/api/auth/signin", controller.signin);
  app.post("/api/forgot-password", controller.forgotPassword);
  app.post("/api/confirm-code", controller.confirmCode);
  app.post("/api/reset", controller.saveNewPassword);
  app.get("/api/clams-list", controller.clamList);
  app.get("/api/get-long-lat", controller.getLongLat);
  app.post("/api/find-user", controller.findUser);
  app.post("/api/auth/refreshtoken", controller.refreshToken);
};
