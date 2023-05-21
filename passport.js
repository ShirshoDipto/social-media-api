const passport = require("passport");
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("./models/user");
const GoogleStrategy = require("passport-google-oidc");

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
          return cb(null, false, {
            message: "Incorrect Password. Did you log in with Google?",
          });
        }
      } catch (err) {
        console.log(err);
        return cb(err, false, { message: "Some internal error occured." });
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
        return cb(err, false, { meessage: "Some internal error occured. " });
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URI}/api/users/oauth2/redirect/google`,
      scope: ["profile", "email"],
    },
    async function verify(issuer, profile, cb) {
      try {
        const user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          return cb(null, user);
        }

        const hashedPassword = await bcrypt.hash(profile.id, 10);
        const newUser = new User({
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          password: hashedPassword,
        });

        const savedUser = await newUser.save();
        return cb(null, savedUser);
      } catch (err) {
        console.log(err);
        return cb(err, false, { meessage: "Some internal error occured. " });
      }
    }
  )
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  cb(null, user);
});
