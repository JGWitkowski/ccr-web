const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const Clam = db.clam;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles },
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map((role) => role._id);
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

exports.clam = (req, res) => {
  const clam = new Clam({
    name: req.body.name,
    address: JSON.stringify(req.body.address),
    consistencyScore: req.body.consistencyScore,
    volumeScore: req.body.volumeScore,
    tasteScore: req.body.tasteScore,
    priceScore: req.body.priceScore,
    price: req.body.price || null,
    cuisine: req.body.cuisine || null,
    awardWinning: req.body.awardWinning || null,
    notes: req.body.notes || null,
  });
  clam.save((err, clam) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    } else {
      res.status(200).send({
        clam: clam,
      });
    }
  });
};

exports.signin = (req, res) => {
  // User.findOne({
  //   username: req.body.username,
  // })
  //   .populate("roles", "-__v")
  //   .exec((err, user) => {
  //     if (err) {
  //       res.status(500).send({ message: err });
  //       return;
  //     }

  //     if (!user) {
  //       return res.status(404).send({ message: "User Not found." });
  //     }

  //     var passwordIsValid = bcrypt.compareSync(
  //       req.body.password,
  //       user.password
  //     );

  //     if (!passwordIsValid) {
  //       return res.status(401).send({
  //         accessToken: null,
  //         message: "Invalid Password!",
  //       });
  //     }

  //     const token = jwt.sign({ id: user.id }, config.secret, {
  //       algorithm: "HS256",
  //       allowInsecureKeySizes: true,
  //       expiresIn: 86400, // 24 hours
  //     });

  //     var authorities = [];

  //     for (let i = 0; i < user.roles.length; i++) {
  //       authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
  //     }
  res.status(200).send({
    // id: user._id,
    user: "Justin",
    // email: user.email,
    // roles: authorities,
    token: "dumbtoken",
  });
  // });
};
