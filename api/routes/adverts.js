const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '.jpg') //Appending .jpg
    }
  })
  
const fileFilter = (req,file,cb) =>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
        cb(null,true);
    }else{
        cb(null,false);
    }
    
    
};

var upload = multer({ 
    storage: storage , 
    limits:{
    fileSize: 1024*1024*5
    },
    fileFilter:fileFilter
});

const Advert = require('../models/advert');

router.get('/',(req,res,next)=>{
    Advert.find()
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            products: docs.map(doc=>{
                return {
                    _id: doc._id,
                    kullanici_id:doc.kullanici_id,
                    ilan_adi:doc.ilan_adi,
                    ilan_aciklama:doc.ilan_aciklama,
                    ilan_url:[doc.ilan_url],
                    fiyat:doc.fiyat,
                    ilan_durumu:doc.ilan_durumu,
                    ilan_tarihi:doc.ilan_tarihi,
                    sehir:doc.sehir,
                    ilce:doc.ilce,
                    mahalle:doc.mahalle,
                    request:{
                        type: 'GET',
                        url: 'http:/localhost:5000/apiadverts/'+ doc._id
                    }
                }
            })
        };
        console.log(response);
        if(docs.length >=0){
            res.status(200).json(docs);
        }else{
            res.status(404).json({
                message:'no entries found'
            });
        }
    })
    .catch(err => {
        console.log(err);
        releaseEvents.status(500).json(err);
    });
});

router.post('/',upload.single('ilan_url'),(req,res,next)=>{
    console.log(req.file);
;    const advert = new Advert({
        _id: new mongoose.Types.ObjectId(),
        kullanici_id:req.body.kullanici_id,
        ilan_adi:req.body.ilan_adi,
        ilan_aciklama:req.body.ilan_aciklama,
        ilan_url:req.file.path,
        fiyat:req.body.fiyat,
        ilan_durumu:req.body.ilan_durumu,
        ilan_tarihi:new Date,
        sehir:req.body.sehir,
        ilce:req.body.ilce,
        mahalle:req.body.mahalle
    });
    advert.save()
    .then(reslut => {
        console.log(reslut);
        res.status(201).json({
            message: 'Created advert succefully',
            createdAdvert:{
                _id: reslut._id,
                kullanici_id:reslut.kullanici_id,
                ilan_adi:reslut.ilan_adi,
                ilan_aciklama:reslut.ilan_aciklama,
                ilan_url:[reslut.ilan_url],
                fiyat:reslut.fiyat,
                ilan_durumu:reslut.ilan_durumu,
                ilan_tarihi:reslut.ilan_tarihi,
                sehir:reslut.sehir,
                ilce:reslut.ilce,
                mahalle:reslut.mahalle,
                request:{
                    type: 'GET',
                    url: 'http:/localhost:5000/apiadverts/'+ reslut._id
                }
            }
        })
    }).catch(err=>{
        console.log(err);
        res.status(500).json({error:err});
    });
});

router.get('/:advertId',(req,res,next)=>{
    const id = req.params.advertId;
    Advert.findById(id)
    .select('_id kullanici_id ilan_adi ilan_aciklama ilan_url fiyat ilan_durum ilan_tarihi sehir ilce mahalle')
    .exec()
    .then(doc => {
        console.log("From database = ",doc);
        if(doc){
            res.status(200).json({
                advert:doc,
                request:{
                    type:'GET',
                    description: 'GET_ALL_PRODUCTS',
                    url:'http://localhost:5000/api/adverds'
                }
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

router.patch('/:advertId',(req,res,next)=>{
    const id = req.params.advertId;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Advert.update({_id:id},{$set:updateOps})
    .exec()
    .then(result=>{
        console.log(result);
        res.status(200).json({
            message: 'Advert Updated',
            request:{
                type:'GET',
                url:'http:/localhost:5000/adverds/'+id
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error:err});
    });
});

router.delete('/:advertId',(req,res,next)=>{
    const id = req.params.advertId;
    Advert.remove({_id:id})
    .exec()
    .then(result => {
        res.status(200).json({
            message:'Advert Deleted',
            request:{
                type:'POST',
                url:'httmp://localhost:5000/adverts'
            }
        });
    })
    .catch(err=>{
        res.status(500).json({error:err});
    });
});


module.exports= router;