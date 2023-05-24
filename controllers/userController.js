const { body, validationResult } = require("express-validator");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Post = require("../models/post");
const Friendship = require("../models/friendship");
const { uploadImage, deleteImage } = require("../utils/cloudinaryUtil");

// const tempUsers = {};

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

exports.logout = async (req, res, next) => {
  if (req.user) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      return res.json({ success: "Successfully logged out." });
    });
    return;
  }

  return res.json({ success: "Successfully logged out." });
};

exports.googleLoginSuccess = async (req, res, next) => {
  // const user = tempUsers[req.query.userId];
  const user = await User.findById(req.query.userId);
  if (!user) {
    return res.status(401).json({ error: "Google authentication failed." });
  }

  const plainUserObject = JSON.parse(JSON.stringify(user));
  const token = jwt.sign({ user: plainUserObject }, process.env.JWT_SECRET);
  // delete tempUsers[user._id];
  return res.json({ userInfo: plainUserObject, token });
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
      tempUsers[user._id] = user;
      return res.redirect(`${process.env.CLIENT_URI}?google=${user._id}`);
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
      return res.json({ userInfo: user, token });
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
        return res.json({ userInfo: user, token });
      });
    })(req, res, next);
  },
];

exports.searchUsers = async (req, res, next) => {
  try {
    const searchTexts = req.query.text.replace(/%20/g, " ").split("@")[0];
    // const searchResult = await User.find(
    //   { $text: { $search: `\"${searchTexts}\"` } }, // exact search (AND)
    //   { score: { $meta: "textScore" } }
    // ).sort({ score: { $meta: "textScore" } });

    const searchResult = await User.find(
      { $text: { $search: `${searchTexts}` } }, // OR search
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .select("firstName lastName profilePic");

    return res.json({ searchResult });
  } catch (err) {
    return next(err);
  }
};

exports.removeFromFriendlist = async (req, res, next) => {
  try {
    const friendship = await Friendship.findById(req.params.friendshipId);

    if (!friendship) {
      return res.status(404).json({ error: "Friendship not found. " });
    }

    const friends = await Promise.all([
      User.findById(req.user._id),
      User.findById(req.params.userId),
    ]);

    await Promise.all([
      friends[1].updateOne({ $pull: { friends: req.user._id } }),
      friends[0].updateOne({ $pull: { friends: req.params.userId } }),
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
    const posts = await Post.find({ author: req.params.userId })
      .sort({ $natural: -1 })
      .skip(req.query.skip)
      .limit(10)
      .populate("author", "firstName lastName profilePic");

    return res.json({ posts, success: "Posts fetched successfully. " });
  } catch (err) {
    return next(err);
  }
};

exports.getUserFriends = async (req, res, next) => {
  try {
    const friends = await User.find(
      {
        _id: [...req.user.friends],
      },
      "firstName lastName profilePic"
    );

    return res.json({
      friends,
      success: "Successfully fethced user friends",
    });
  } catch (error) {
    return next(error);
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

exports.addPic = async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.userId.toString()) {
      return res
        .status(403)
        .json({ error: "You can only update own account info. " });
    }

    const data = await uploadImage(req.file.buffer, req.body.imageName);
    return res.json({
      imageUrl: data.secure_url,
      success: "Picture added successfully. ",
    });
  } catch (error) {
    return next(error);
  }
};

exports.deletePic = async (req, res, next) => {
  try {
    console.log(req.user._id, req.params.userId);
    if (req.user._id.toString() !== req.params.userId.toString()) {
      return res
        .status(403)
        .json({ error: "You can only update own account info. " });
    }

    await deleteImage(req.body.imageUrl);

    return res.json({ success: "Successfully deleted picture. " });
  } catch (error) {
    return next(error);
  }
};

exports.replacePic = async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.userId.toString()) {
      return res
        .status(403)
        .json({ error: "You can only update own account info. " });
    }

    const results = await Promise.all([
      uploadImage(req.file.buffer, req.body.imageName),
      deleteImage(req.body.existingImageUrl),
    ]);

    return res.json({
      imageUrl: results[0].secure_url,
      success: "Profile Pic replaced successfully. ",
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.userId.toString()) {
      return res
        .status(403)
        .json({ error: "You can only update own account info. " });
    }

    const user = await User.findById(req.user._id);
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.profilePic = req.body.profilePic;
    user.coverPic = req.body.coverPic;
    user.desc = req.body.desc;
    user.job = req.body.job;
    user.edu = req.body.edu;
    user.city = req.body.city;
    user.from = req.body.from;
    user.relationship = req.body.relationship;

    const savedUser = await user.save();
    return res.json({
      user: savedUser,
      success: "User account updated successfully. ",
    });
  } catch (error) {
    return next(error);
  }
};
