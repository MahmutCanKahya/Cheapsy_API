var express = require('express'); 
var db=require('./api/models/db');
var bodyparser = require('body-parser'); 
const morgan = require('morgan');
// intialize express app 
var app = express(); 

app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers'
    , 'X-Requested-With,Content-Type,Accept, Authorization');
    if(req.method==='OPTIONS'){
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
        return res.status(200).json({});
    }
    next();
})
/*
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
*/


const advertRoutes = require('./api/routes/adverts');
const userRoutes = require('./api/routes/user');
app.use('/api/user',userRoutes);
app.use('/api/adverts',advertRoutes);

//Handeling Error
app.use((req,res,next)=>{
    const error =new Error('Not found');
    error.status=404;
    next(error);
});

app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error:{
            message:error.message
        }
    })
});

const port = 5000; 
app.listen(port, () => { 
    console.log("Server running at port: " + port); 
}); 





