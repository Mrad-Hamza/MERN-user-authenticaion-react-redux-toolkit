var express = require('express');
const jwt = require("jsonwebtoken");
let User = require("../models/user.model");
const passport = require("passport");
const router = express.Router();
require('../config/passport')

// protected api example
// router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
//     res.json(req.user)
// })

router.route("/register").post((req, res) => {
    const username = req.body.username;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const mailAddress = req.body.mailAddress;
    const password = req.body.password;

    const newUser = new User({ username, firstname, lastname, mailAddress, password });
    newUser
        .save()
        .then(() => res.json("User added!"))
        .catch((err) => {
            console.log(err)
            res.status(400).json("Error: " + err)
        });
})

router.route("/login").post( async (req, res) => {
    User.getAuthenticated(req.body.username, req.body.mailAddress, req.body.password, function (err, user, reason) {
        if (err) throw err;
        // login was successful if we have a user
        if (user) {
            // handle login success
            const accessToken = jwt.sign(user.toJSON(), process.env.ACCES_TOKEN_SECRET, {
                expiresIn: "1d",
            });
            res.json({ accessToken: accessToken, user: user });
            return;
        }
        // otherwise we can determine why we failed
        else {
            var reasons = User.failedLogin;
            switch (reason) {
                case reasons.NOT_FOUND:
                    res.status(400).send("No User Found!");
                    break;
                case reasons.PASSWORD_INCORRECT:
                    
                    // note: these cases are usually treated the same - don't tell
                    // the user *why* the login failed, only that it did
                    res.status(400).send("Invalid details");
                    break;
                case reasons.MAX_ATTEMPTS:
                    // send email or otherwise notify user that account is
                    // temporarily locked
                    res.status(400).send("You failed too many times. Your account is locked for two hours.");
                    break;
                default:
            }
        }
    });
});

router.route("/").get(passport.authenticate('jwt', { session: false }), (req, res) => {
    User.find()
        .then((users) => res.json(users))
})

router.route("/:id").get(passport.authenticate('jwt', { session: false }), (req, res) => {
    User.findById(req.params.id)
        .then((user) => res.json(user))
        .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/:id").delete(passport.authenticate('jwt', { session: false }), (req, res) => {
    User.findByIdAndDelete(req.params.id)
        .then(() => res.json("User deleted."))
        .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
