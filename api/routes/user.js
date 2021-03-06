var express = require("express");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var userModel = require("../models/user");
var mongoose = require("mongoose");
const multer = require("multer");

var router = express.Router();

//sunucuya indirilcek resmin formatı ve boyutunun ayarlandığı yer//
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
//sunucuya indirilcek resmin formatı ve boyutunun ayarlandığı yer//

//Kullanici giriş yapmışmı diye token i okuyor eğer giriş yapmıssa kullaniic id sini döndürüyor//
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
//Kullanici giriş yapmışmı diye token i okuyor eğer giriş yapmıssa kullaniic id sini döndürüyor//

//Kullanici mail ve sifresini girerek login'e post istei yapıyor eğer mail varsa sifrelenmiş şifreyi çözüp kontrol ediyor eğer
//şifre uygunsa giriş işlemini yapıyor
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
//Kullanici mail ve sifresini girerek login'e post istei yapıyor eğer mail varsa sifrelenmiş şifreyi çözüp kontrol ediyor eğer
//şifre uygunsa giriş işlemini yapıyor

//kullanici bilgilerini alıyor eğer email varsa 409 hatası döndürüyor , eğer email veritabanında mevcut değilse girilen şifreyi
//şifreleyip veritabanına kaydediyor
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
//kullanici bilgilerini alıyor eğer email varsa 409 hatası döndürüyor , eğer email veritabanında mevcut değilse girilen şifreyi
//şifreleyip veritabanına kaydediyor

//verilen idye göre kullanıcının tüm bilgilerini veritabanından siler.//
router.delete("/userId=:userId", (req, res, next) => {
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
//verilen idye göre kullanıcının tüm bilgilerini veritabanından siler.//

//Tek bir kullanıcıya ait bilgileri json formatında döndürür//
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
//Tek bir kullanıcıya ait bilgileri json formatında döndürür//

//Tek bir kullanıcının bilgilerini değiştirmek istiyorsak bu linkte patch ederiz//
router.patch("/userId=:userId", upload.single("resim"), (req, res, next) => {
  const id = req.params.userId;
  if (typeof req.file === "undefined") {
    image=req.body.resim
  }
  else{
    image=req.file.path
  }
  userModel.update(
    { _id: id },
    {
      $set: {
        ad: req.body.ad,
        soyad: req.body.soyad,
        sehir: req.body.sehir,
        hakkinda: req.body.hakkinda,
        adres: req.body.adres,
        resim: image
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
//Tek bir kullanıcının bilgilerini değiştirmek istiyorsak bu linkte patch ederiz//

function verifyToken(req, res, next) {
  //headerdan kimlik doğrulama bilgisini alır
  const bearerHeader = req.body["authorization"];
  console.log(bearerHeader);
  //bearerHeader boşmu diye kontrol ediyor
  if (typeof bearerHeader !== "undefined") {
    //bir boşluk öteliyor
    const bearer = bearerHeader.split(" ");
    // token arrayini yerleştiriyor
    const bearerToken = bearer[1];
    //tokeni geri döndürüyor
    req.token = bearerToken;
    //bu fonksiyon bir middleware oldugu için next işlemini yapmamız gerekir.
    next();
  } else {
    //eğer token ulaşamazsa hata döndürür.
    res.sendStatus(403);
  }
  next;
}

module.exports = router;
