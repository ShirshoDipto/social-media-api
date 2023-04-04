const { body, validationResult } = require("express-validator");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

function generatePlainUserObject(user) {
  const userOb = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: user.password,
    isBlogOwner: user.isBlogOwner,
  };

  return userOb;
}

function makeErrorObject(errorArray) {
  const errObj = {};
  errorArray.forEach((err) => {
    if (errObj[err.param]) {
      errObj[err.param].push(err.msg);
    } else {
      errObj[err.param] = [err.msg];
    }
  });
  return errObj;
}

exports.signup = [
  body("firstName", "First Name must be specified. ")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  body("lastName", "Last Name must be specified. ")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  body("email")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Email must be specifeid. ")
    .isEmail()
    .withMessage("Input has to be an email. ")
    .escape(),

  body("password", "password must be at least 8 characters long. ")
    .trim()
    .isLength({ min: 8 })
    .escape(),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password doesn't match. ");
    }
    return true;
  }),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errObj = makeErrorObject(errors.array());
        return res.status(400).json({ errors: errObj });
      }
      if (await User.findOne({ email: req.body.email })) {
        return res
          .status(400)
          .json({ error: "User already exists. Try Logging in. " });
      }
      const hashedPassword = await bcrypt.hash(req.body.confirmPassword, 10);
      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
      });
      await user.save();

      const plainUserObject = generatePlainUserObject(user);

      const token = jwt.sign({ user: plainUserObject }, process.env.JWT_SECRET);
      return res.json({ user, token });
    } catch (err) {
      return next(err);
    }
  },
];

exports.login = [
  body("email")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Email must be specified. ")
    .isEmail()
    .withMessage("Input has to be an email. ")
    .escape(),

  body("password", "Password has to be at least 8 characters long. ")
    .trim()
    .isLength({ min: 8 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errObj = makeErrorObject(errors.array());
      return res.status(400).json({ errors: errObj });
    }

    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.status(400).json({
          error: info.message,
        });
      }

      req.login(user, { session: false }, (err) => {
        if (err) {
          return next(err);
        }
        const plainUserObject = generatePlainUserObject(user);

        const token = jwt.sign(
          { user: plainUserObject },
          process.env.JWT_SECRET
        );
        res.currentUser = plainUserObject;
        return res.json({ user, token });
      });
    })(req, res, next);
  },
];
