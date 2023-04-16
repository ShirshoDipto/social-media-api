const { body, validationResult } = require("express-validator");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Post = require("../models/post");
const Friendship = require("../models/friendship");

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

exports.googleLoginSuccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Google authentication failed." });
  }

  const plainUserObject = new Object(req.user);
  const token = jwt.sign({ user: plainUserObject }, process.env.JWT_SECRET);
  return res.json({ user: plainUserObject, token });
};

exports.googleLogin = async (req, res, next) => {
  passport.authenticate("google", (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        error: info.message,
      });
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect(`${process.env.CLIENT_URI}/login/google/confirm`);
    });
  })(req, res, next);
};

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
        return res.status(400).json({
          error:
            "User already exists. Try Logging in. Or did you log in with Google?",
        });
      }
      const hashedPassword = await bcrypt.hash(req.body.confirmPassword, 10);
      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
      });
      await user.save();

      const plainUserObject = new Object(user);

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
        const plainUserObject = new Object(user);

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

exports.searchUsers = async (req, res, next) => {
  try {
    const searchResult = await User.find(
      { $text: { $search: `\"${req.body.searchTexts}\"` } }, // exact search (AND)
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });

    return res.json({ searchResult });
  } catch (err) {
    return next(err);
  }
};

exports.removeFromFriendlist = async (req, res, next) => {
  try {
    const friendship = await Friendship.findOne({
      $or: [
        {
          $and: [
            { requester: req.user._id },
            { recipient: req.params.friendId },
          ],
        },
        {
          $and: [
            { requester: req.params.friendId },
            { recipient: req.user._id },
          ],
        },
      ],
    });

    const friend = await User.findById(req.params.friendId);

    await Promise.all([
      friend.updateOne({ $pull: { friends: req.user._id } }),
      req.user.updateOne({ $pull: { friends: req.params.friendId } }),
      Friendship.deleteOne({ _id: friendship._id }),
    ]);

    return res.json({
      success: "Removed friend from the friend list successfully. ",
    });
  } catch (err) {
    return next(err);
  }
};

exports.getUsersPosts = async (req, res, next) => {
  try {
    const page = req.query.page;
    const posts = await Post.find({ author: req.params.userId })
      .sort({ $natural: -1 })
      .skip(10 * page)
      .limit(10)
      .populate("author", "firstName lastName profiePic");

    return res.json({ posts, success: "Posts fetched successfully. " });
  } catch (err) {
    return next(err);
  }
};

exports.getSingleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).populate(
      "friends",
      "firstName lastName profilePic"
    );

    if (!user) {
      return res.status(404).json({ error: "No user found. " });
    }

    return res.json({ user, success: "User fetched successfully. " });
  } catch (err) {
    return next(err);
  }
};
