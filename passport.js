const passport = require("passport");
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("./models/user");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async function (email, password, cb) {
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          return cb(null, false, {
            message: "Email does not exist. Sign Up instead. ",
          });
        }

        const res = await bcrypt.compare(password, user.password);

        if (res) {
          return cb(null, user);
        } else {
          return cb(null, false, { message: "Incorrect Password. " });
        }
      } catch (err) {
        console.log(err);
        return cb(err);
      }
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async function (jwtPayload, cb) {
      try {
        return cb(null, jwtPayload.user);
      } catch (err) {
        console.log(err);
        return cb(err);
      }
    }
  )
);
