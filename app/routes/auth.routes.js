const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");

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
  app.post(
    "/api/save-clam",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted,
    ],
    controller.clam
  );

  app.post("/api/auth/signin", controller.signin);
  app.get("/api/clams-list", controller.clamList);
  app.get("/api/get-long-lat", controller.getLongLat);
};
