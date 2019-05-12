var express = require("express");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var userModel = require("../models/user");
var mongoose = require("mongoose");
const multer = require("multer");

var router = express.Router();

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/users");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + ".jpg"); //Appending .jpg
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

var upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API"
  });
  console.log("test api");
});

router.post("/posts", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
    if (err) {
      console.log(err);
      res.sendStatus(403);
    } else {
      res.json({
        message: " Post created...",
        authData
      });
    }
    console.log(authData);
  });
});

router.post("/login", (req, res) => {
  userModel
    .find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      bcrypt.compare(req.body.sifre, user[0].sifre, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        if (result) {
          console.log("Giriş işlemi başarılı");
          const token = jwt.sign(
            {
              userId: user[0]._id,
              email: user[0].email
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h"
            }
          );
          console.log(token);
          return res.status(200).json({
            mesage: "Auth successful",
            token: token
          });
        }
        console.log("Şifre yanlış");
        return res.status(401).json({
          message: "Auth failed"
        });
      });
    })
    .catch(err => {
      console(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post("/signup", (req, res, next) => {
  userModel
    .find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        console.log("burda");
        return res.status(409).json({
          message: "Mail exists"
        });
      } else {
        bcrypt.hash(req.body.sifre, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const newUser = new userModel({
              _id: new mongoose.Types.ObjectId(),
              ad: req.body.ad,
              soyad: req.body.soyad,
              email: req.body.email,
              sifre: hash,
              sehir: req.body.sehir,
              hakkinda: req.body.hakkinda,
              adres: req.body.adres,
              resim: req.body.resim
            });
            newUser
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: "User created"
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    })
    .catch();
});

router.delete("/:userId", (req, res, next) => {
  userModel
    .remove({ _id: req.params.userId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "User deleted"
      });
    })
    .catch(err => {
      console(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get("/userId=:userId", (req, res, next) => {
    const id = req.params.userId;
  userModel.findById(id)
    .select(
      "_id ad soyad email sehir hakkinda adres resim"
    )
    .exec()
    .then(doc => {
      console.log("From database = ", doc);
      if (doc) {
        res.status(200).json({
          advert: doc,
          request: {
            type: "GET",
            description: "GET_ALL_PRODUCTS",
            url: "http://localhost:5000/api/adverts"
          }
        });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch("/userId=:userId", upload.single("resim"), (req, res, next) => {
  const id = req.params.userId;
  userModel.update(
    { _id: id },
    {
      $set: {
        ad: req.body.ad,
        soyad: req.body.soyad,
        email: req.body.email,
        sehir: req.body.sehir,
        hakkinda: req.body.hakkinda,
        adres: req.body.adres,
        resim: req.file.path
      }
    }
  )
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: "User Updated",
        request: {
          type: "GET",
          url: "http:/localhost:5000/api/user" + id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

function verifyToken(req, res, next) {
  //get auth header value
  const bearerHeader = req.body["authorization"];
  console.log(bearerHeader);
  //Check if bearer is undefined
  if (typeof bearerHeader !== "undefined") {
    //Split at the space
    const bearer = bearerHeader.split(" ");
    // Get token from array
    const bearerToken = bearer[1];
    //Set the token
    req.token = bearerToken;
    //Net middleware
    next();
  } else {
    //Forbidden
    res.sendStatus(403);
  }

  next;
}

module.exports = router;
