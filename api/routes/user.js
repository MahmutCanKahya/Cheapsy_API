var express = require('express');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var userModel = require('../models/user');
var mongoose = require('mongoose');


var router = express.Router();


router.get('/',(req,res)=>{
    res.status(200).json({
        message:'Welcome to the API'
    })
    console.log("test api")
});


router.post('/posts',verifyToken, (req,res)=>{
    jwt.verify(req.token,process.env.JWT_KEY,(err,authData)=>{
        if(err){
            console.log(err);
            res.sendStatus(403);
        }else{
            res.json({
                message: ' Post created...',
                authData
            });
        }
        console.log(authData);

    });
});

router.post('/login',(req,res)=>{
    userModel.find({email: req.body.email})
    .exec()
    .then(user =>{
        if(user.length < 1){
            return res.status(401).json({
                message: 'Auth failed'
            });
        }
        bcrypt.compare(req.body.sifre, user[0].sifre,(err,result)=>{
            if(err){
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            if(result){
                console.log("Giriş işlemi başarılı")
                const token = jwt.sign({
                    userId:user[0]._id,
                    email:user[0].email
                },process.env.JWT_KEY,{
                    expiresIn: "1h"
                }

                );
                console.log(token);
                return res.status(200).json({
                    mesage: 'Auth successful',
                    token:token
                })
                
            }
            console.log("Şifre yanlış")
            return res.status(401).json({
                message: 'Auth failed'
            });
        })
    })
    .catch(err => {
        console(err);
        res.status(500).json({
            error:err
        })
    });

});


router.post('/signup',(req,res,next)=>{
    userModel.find({email: req.body.email})
    .exec()
    .then(user => {
        if(user.length >=1){
            console.log("burda")
            return res.status(409).json({
                message: 'Mail exists'
            });
        }else{
            bcrypt.hash(req.body.sifre,10,(err,hash)=>{
                if(err){
                    return res.status(500).json({
                        error:err
                    });
                }else{
                    const newUser = new userModel({
                        _id: new mongoose.Types.ObjectId(),
                        ad: req.body.ad,
                        soyad: req.body.soyad,
                        email : req.body.email,
                        sifre: hash
                        });
                        newUser
                        .save()
                        .then(result=>{
                            console.log(result);
                            res.status(201).json({
                                message: 'User created'
                            })
                        }).catch(err =>{
                            console.log(err);
                            res.status(500).json({
                                error:err
                            })
                        });
                    }
                    });
        }
    })
    .catch();
    
});

router.delete('/:userId',(req,res,next)=>{
    userModel.remove({_id: req.params.userId})
    .exec()
    .then(result=>{
        res.status(200).json({
            message: 'User deleted'
        });
    })
    .catch(err => {
        console(err);
        res.status(500).json({
            error:err
        });
    });
});


function verifyToken(req,res,next){
    //get auth header value
    const bearerHeader = req.body['authorization'];
    console.log(bearerHeader);
    //Check if bearer is undefined
    if(typeof bearerHeader !== 'undefined'){
        //Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken =bearer[1];
        //Set the token
        req.token = bearerToken;
        //Net middleware
        next();
    }else{
        //Forbidden
        res.sendStatus(403);
    }

    next;
}


module.exports= router;