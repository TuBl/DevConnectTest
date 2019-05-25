const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const User = require("../../models/Users");
const config = require("config");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//check express-validator docs to see how to validate if email is valid, password minimum length etc..

//@route    GET api/users
//@desc     Register user
//@access   Public (no need for token for authentication)
router.post(
  "/",
  [
    check("name", "Name is required")
      .not()
      .isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password that is at least 6 characters long"
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    //if any of the previous checks is not passed, we get error and response accordingly
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //bad request
      //responsed with array of errors object containing msgs from our error checks, remember to return the res.status if it isn't the last one
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
      //create user variable and see if exists based on email
      //we can use {email} instead of email:email because we used same var name when destructuring
      let user = await User.findOne({ email });
      if (user) {
        return res //remember to return the res.status if it is not the last one
          .status(400)
          .json({ errors: [{ msg: "User Already exists" }] });
      }
      //Get users gravatar (based on their email) s=>size, r=>rating (no nudity), d: "mm" default icon
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm"
      });
      //Create new User instance, still doesn't save it to the DB
      user = new User({
        name,
        email,
        avatar,
        password
      });
      //Encrypt password via bcrypt genSalt(val), higher val = more secure but slower
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      //Return jsonwebtoken (so the user gets logged in right away) mongoose allows us to use .id instead of ._id
      const payload = {
        user: {
          id: user.id
        }
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
