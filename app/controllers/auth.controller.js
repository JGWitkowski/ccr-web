const config = require("../config/auth.config");
const db = require("../models");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "jgwitkowski@gmail.com",
    pass: "qpuq nwrs poxy vukq",
  },
});
const User = db.user;
const Role = db.role;
const Clam = db.clam;
const RefreshToken = db.refreshToken;
const axios = require("axios");

const API_KEY = "AIzaSyAv9_xmZqNEp1dzVjfZYHWOKBs-Mk71pak";

const passwordResetTokens = {};

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
          const token = jwt.sign({ id: user.id }, config.secret, {
            algorithm: "HS256",
            allowInsecureKeySizes: true,
            expiresIn: 86400, // 24 hours
          });
          res.send({
            message: "User was registered successfully!",
            token: token,
            user: user.username,
          });
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
    totalScore: req.body.totalScore,
    lat: req.body.lat,
    long: req.body.lng,
  });
  console.log("lame: ", clam);
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
  // res.status(200).send({
  //   clam: "test",
  // });
};
exports.clamList = (req, res) => {
  const clams = Clam.find()
    .then((clams) => {
      res.status(200).send({ data: clams });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    });
};
exports.getLongLat = (req, res) => {
  const PLACE_ID = req.query.placeid;
  const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${PLACE_ID}&key=${API_KEY}`;
  //res.status(200).send({ long: 234234234, lat: 234234 });
  axios
    .get(url)
    .then((response) => {
      const result = response.data.result;
      const location = result.geometry.location;
      res.status(200).send({ lng: location.lng, lat: location.lat });
    })
    .catch((error) => {
      console.error("Error fetching data from Google Places API:", error);
    });

  // const clams = Clam.find()
  //   .then((clams) => {
  //     res.status(200).send({ data: clams });
  //   })
  //   .catch((err) => {
  //     res.status(500).send({ message: err });
  //   });
};
exports.findUser = async (req, res) => {
  console.log("sdjfklsjdfklsfindsiofnsd f");
  try {
    const user = await User.findOne({
      $or: [{ username: req.body.user }, { email: req.body.user }],
    });
    console.log("user: ", user);
    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }
    res.status(200).json({ message: "User found" });
  } catch (err) {
    console.error("Error sending email:", error);
    res.status(500).send("Could not find user");
  }
};

exports.signin = (req, res) => {
  // const userByUsername = User.findOne({
  //   $or: [
  //     { username: req.body.username },
  //     { email: req.body.username },
  //   ],
  // });
  //   const userByEmail = User.findOne({
  //     email: req.body.username,
  //   });
  User.findOne({
    $or: [{ username: req.body.username }, { email: req.body.username }],
  })
    .populate("roles", "-__v")
    .exec(async (err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(401).send({ message: "User Not found." });
      }
      console.log("user.password: ", user.password);
      console.log("req.body.password: ", req.body.password);
      console.log("us trhfsfiudifsd: ", user.password === req.body.password);
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password",
        });
      }

      const token = jwt.sign({ id: user.id }, config.secret, {
        algorithm: "HS256",
        allowInsecureKeySizes: true,
        expiresIn: 86400, // 24 hours
      });
      let refreshToken = await RefreshToken.createToken(user);

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        token: token,
        refreshToken: refreshToken,
      });
    });
};
exports.refreshToken = async (req, res) => {
  console.log("indj refreshhfsfhjs");
  const { refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    let refreshToken = await RefreshToken.findOne({ token: requestToken });

    if (!refreshToken) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.findByIdAndRemove(refreshToken._id, {
        useFindAndModify: false,
      }).exec();

      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }

    let newAccessToken = jwt.sign(
      { id: refreshToken.user._id },
      config.secret,
      {
        expiresIn: config.jwtExpiration,
      }
    );

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

exports.forgotPassword = async (req, res) => {
  const { to } = req.body;
  const r = (Math.random() + 1).toString(36).substring(7);
  passwordResetTokens[to] = r;
  const subject = "Clam Chowder Inn: Password Reset";
  const text =
    "If you requested a password reset use the confirmation code below to complete the process. If you didn't make this request, ignore this email. " +
    r;
  try {
    // Send email
    const info = await transporter.sendMail({
      from: "jgwitkowski@gmail.com",
      to,
      subject,
      text,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Error sending email" });
  }
};

exports.saveNewPassword = async (req, res) => {
  const { newPassword, userName } = req.body;
  console.log("sdjfklsdjfkljsdklreq.body.username: ", userName);
  try {
    const user = await User.findOne({
      $or: [{ username: userName }, { email: userName }],
    });
    if (!user) {
      return res.status(409).json({ message: "User not found" });
    }
    if (user) {
      console.log("newnewPassword: ", newPassword);
      user.password = bcrypt.hashSync(newPassword, 8);
      await user.save();
      res.status(200).json({ message: "Password updated successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.confirmCode = async (req, res) => {
  const { code, userName } = req.body;
  try {
    if (passwordResetTokens[userName] === code) {
      res.status(200).json({ message: "Confirmation code correct" });
    } else {
      res.status(409).json({ message: "Confirmation code incorrect" });
    }
  } catch (error) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
