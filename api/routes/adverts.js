const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");


//sunucuya indirilcek resmin formatı ve boyutunun ayarlandığı yer//

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/adverts");
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

const Advert = require("../models/advert");


//Veritabanındaki tüm kayıtları sondan başa doğru json formatında geri döndüren get isteği//
router.get("/", (req, res, next) => {
  Advert.find()
    .sort({ ilan_tarihi: -1 })
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        products: docs.map(doc => {
          return {
            _id: doc._id,
            kullanici_id: doc.kullanici_id,
            ilan_adi: doc.ilan_adi,
            kategori: doc.kategori,
            ilan_aciklama: doc.ilan_aciklama,
            ilan_url: [doc.ilan_url],
            fiyat: doc.fiyat,
            ilan_durumu: doc.ilan_durumu,
            ilan_tarihi: doc.ilan_tarihi,
            request: {
              type: "GET",
              url: "http:/localhost:5000/apiadverts/" + doc._id
            }
          };
        })
      };
      console.log(response);
      if (docs.length >= 0) {
        res.status(200).json(docs);
      } else {
        res.status(404).json({
          message: "no entries found"
        });
      }
    })
    .catch(err => {
      console.log(err);
      releaseEvents.status(500).json(err);
    });
});
//Veritabanındaki tüm kayıtları sondan başa doğru json formatında geri döndüren get isteği//

//İlan yayınlancağı zaman bu urlye  post isteği yaparak ilanı veri tabanına kaydediyoruz//
router.post("/", upload.single("ilan_url"), (req, res, next) => {
  console.log(req.file);
  if (req.file.path == null) {
    req.file.path = "uploads\resimyok.png";
  }
  var kullaniciID = "";
  kullaniciID = req.body.kullanici_id;
  var kullanici = mongoose.Types.ObjectId(kullaniciID);
  const advert = new Advert({
    _id: new mongoose.Types.ObjectId(),
    kullanici_id: kullanici,
    kategori: req.body.kategori,
    ilan_adi: req.body.ilan_adi,
    ilan_aciklama: req.body.ilan_aciklama,
    ilan_url: req.file.path,
    fiyat: req.body.fiyat,
    ilan_durumu: true,
    ilan_tarihi: new Date()
  });
  advert
    .save()
    .then(result => {
      res.status(201).json({
        message: "Created advert succefully",
        createdAdvert: {
          _id: result._id,
          kullanici_id: result.kullanici_id,
          ilan_adi: result.ilan_adi,
          ilan_aciklama: result.ilan_aciklama,
          ilan_url: [result.ilan_url],
          fiyat: result.fiyat,
          ilan_durumu: result.ilan_durumu,
          ilan_tarihi: result.ilan_tarihi,
          request: {
            type: "GET",
            url: "http:/localhost:5000/api/adverts/" + result._id
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});
//İlan yayınlancağı zaman bu urlye  post isteği yaparak ilanı veri tabanına kaydediyoruz//

//Tek bir ürüne tıklandıgında tek bir ürüne ayit bilgileri gösteren ve json formatında geri döndüren get isteği//
router.get("/advertId=:advertId", (req, res, next) => {
  const id = req.params.advertId;
  Advert.findById(id)
    .select(
      "_id kullanici_id kategori ilan_adi ilan_aciklama ilan_url fiyat ilan_durum ilan_tarihi"
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
//Tek bir ürüne tıklandıgında tek bir ürüne ayit bilgileri gösteren ve json formatında geri döndüren get isteği//

//İlanda güncelleme yapılınca bu linke istek yapılıcak//
router.patch("/advertId=:advertId", (req, res, next) => {
  const id = req.params.advertId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Advert.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: "Advert Updated",
        request: {
          type: "GET",
          url: "http:/localhost:5000/adverts/" + id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});
//İlanda güncelleme yapılınca bu linke istek yapılıcak//

//İlan kaydını silmemize yarıyor//
router.delete("/advertId=:advertId", (req, res, next) => {
  const id = req.params.advertId;
  Advert.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Advert Deleted",
        request: {
          type: "POST",
          url: "httmp://localhost:5000/adverts"
        }
      });
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});
//İlan kaydını silmemize yarıyor//

//Kategoriye ayit ilanları listeliyor//
router.get("/category/categoryName=:categoryName", (req, res, next) => {
  const categoryName = req.params.categoryName;
  console.log(categoryName);
  Advert.find({ kategori: categoryName })
    .sort({ ilan_tarihi: -1 })
    .exec()
    .then(docs => {
      const response = {
        products: docs.map(doc => {
          return {
            _id: doc._id,
            kullanici_id: doc.kullanici_id,
            ilan_adi: doc.ilan_adi,
            kategori: doc.kategori,
            ilan_aciklama: doc.ilan_aciklama,
            ilan_url: [doc.ilan_url],
            fiyat: doc.fiyat,
            ilan_durumu: doc.ilan_durumu,
            ilan_tarihi: doc.ilan_tarihi,
            request: {
              type: "GET",
              url: "http:/localhost:5000/apiadverts/" + doc._id
            }
          };
        })
      };
      console.log(response);
      if (docs.length >= 0) {
        res.status(200).json(docs);
      } else {
        res.status(404).json({
          message: "no entries found"
        });
      }
    })
    .catch(err => {
      console.log(err);
      releaseEvents.status(500).json(err);
    });
});
//Kategoriye ayit ilanları listeliyor//

module.exports = router;
