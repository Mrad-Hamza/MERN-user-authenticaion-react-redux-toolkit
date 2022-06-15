const mongoose = require("mongoose");

const Schema = mongoose.Schema;
//mdp criptage lib
const bcrypt = require("bcrypt"),
    SALT_WORK_FACTOR = 10,
    MAX_LOGIN_ATTEMPTS = 4,
    LOCK_TIME = 2 * 60 * 60 * 1000 ;

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        firstname: {
            type: String,
            required: true,
            minlength: [3, "First Name Minimum 3 charachters."],
        },
        lastname: {
            type: String,
            required: true,
            minlength: [3, "Last Name Minimum 3 charachters."],
        },
        mailAddress: {
            type: String,
            required: true,
            unique: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"],
        },
        password: {
            type: String,
            required: true,
            minlength: [6, "Password Minimum 6 charachters."],
        },
        loginAttempts: { type: Number, required: true, default: 0 },
        lockUntil: { type: Number },
    },
    {
        timestamps: true,
    }
);
var reasons = (userSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2,
});

userSchema.virtual("isLocked").get(function () {
    // check for a future lockUntil timestamp
    return this.lockUntil && this.lockUntil > Date.now();
});

userSchema.statics.getAuthenticated = function (username, mailAddress, password, cb) {
    this.findOne({ $or: [{ username: username }, { mailAddress: mailAddress }] }, function (err, user) {
        if (err) return cb(err);
        // make sure the user exists
        if (!user) {
            return cb(null, null, reasons.NOT_FOUND);
        }
        // check if the account is currently locked
        if (user.isLocked) {
            // just increment login attempts if account is already locked
            return user.incLoginAttempts(function (err) {
                return cb(null, null, reasons.MAX_ATTEMPTS);
            });
        }
        user.comparePassword(password, function (err, isMatch) {
            if (err) return cb(err);
            // check if the password was a match
            if (isMatch) {
                // if there's no lock or failed attempts, just return the user
                if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
                // reset attempts and lock info
                var updates = {
                    $set: { loginAttempts: 0 },
                    $unset: { lockUntil: 1 },
                };
                return user.update(updates, function (err) {
                    if (err) return cb(err);
                    return cb(null, user);
                });
            }
            if (!isMatch) {
                user.incLoginAttempts(function (err) {
                    // password is incorrect, so increment login attempts before responding
                    if (err) return cb(err);
                    return cb(null, null, reasons.PASSWORD_INCORRECT);
                });
            }
        });
    });
};

userSchema.methods.incLoginAttempts = function (cb) {
    // if we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } }, cb);
    }
    // otherwise we're incrementing
    var updates = { $inc: { loginAttempts: 1 } };
    // lock the account if we've reached max attempts and it's not locked already
    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + LOCK_TIME };
        console.log("Account locked for two hours!")
    }
    return this.update(updates, cb);
};

userSchema.pre("save", function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified("password")) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
