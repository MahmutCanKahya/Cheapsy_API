const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Message = require("../models/messages/message");
const Conversation = require("../models/messages/conversation");

//girilen kullanici id sine karşılık gelen tüm konusmadiyologlarını json formatı ile döndürür//
router.get("/kullaniciId=:kullaniciId", (req, res, next) => {
  const id = req.params.kullaniciId;
  Conversation.find({konusmacilar:id}).select('_id konusmacilar')
  .exec()
  .then(doc => {
      console.log("From database = ",doc);
      if(doc){
          res.status(200).json({
              message:doc,
          });
      }else{
          res.status(404).json({message:'No valid entry found for provided ID'})
      }
  })
  .catch(err=>{
      console.log(err);
      res.status(500).json({error:err});
  });
});
//girilen kullanici id sine karşılık gelen tüm konusmadiyologlarını json formatı ile döndürür//

//girilen konusmaIdsine göre o konusmadaki tüm mesajları json formatı ile döndürür//
router.get("/konusmaId=:konusmaId", (req, res, next) => {
  const id = req.params.konusmaId;
  Message.find({konusmaciId:id}).select('_id gonderici mesaj mesaj_zaman konusmaciId')
  .exec()
  .then(doc => {
      console.log("From database = ",doc);
      if(doc){
          res.status(200).json({
              message:doc,
          });
      }else{
          res.status(404).json({message:'No valid entry found for provided ID'})
      }
  })
  .catch(err=>{
      console.log(err);
      res.status(500).json({error:err});
  });
});
//girilen konusmaIdsine göre o konusmadaki tüm mesajları json formatı ile döndürür//

//Yeni bir mesaj olusturmak için konusmaciId , mesaj , gonderici ve mesaj zaman ile birlikte sunucuya gönderilir.//
router.post("/", (req, res, next) => {

  const message = new Message({
    _id: new mongoose.Types.ObjectId(),
    gonderici: req.body.gonderici,
    mesaj: req.body.mesaj,
    mesaj_zaman: new Date(),
    konusmaciId: req.body.konusmaId
  });
  message
    .save()
    .then(result => {
      res.status(201).json({
        message: "Created message succefully",
        createdAdvert: {
          _id: result._id,
          sender:result.gonderici,
          content:result.mesaj,
          conversation:result.konusmaId,
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
//Yeni bir mesaj olusturmak için konusmaciId , mesaj , gonderici ve mesaj zaman ile birlikte sunucuya gönderilir.//

//gelen id leri eşleştirerek bir ilişki kurar//
router.post("/conversation", (req, res, next) => {
  const conversation = new Conversation({
    _id: new mongoose.Types.ObjectId(),
    konusmacilar: [req.body.gonderici, req.body.alici]
  });
  conversation
    .save()
    .then(result => {
      res.status(201).json({
        message: "Created conversation succefully",
        createdAdvert: {
          _id: result._id,
          konusmacilar: [result.gonderici, result.alici],
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
//gelen id leri eşleştirerek bir ilişki kurar//

module.exports = router;
