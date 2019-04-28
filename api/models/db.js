var mongoose = require('mongoose');

mongoose.Promise = require('../../node_modules/bluebird');

var mongoDB= 'mongodb://3.16.138.226:27017/cheapsy';

mongoose.connect(mongoDB,function(err,err){
    useMongoClient:true;
    if(err){
        console.log('mongoose hatasi '+err);
    }
    else{
        console.log('mongoose bağlantısı başarılı' +mongoDB)
    }
})

mongoose.Promise = global.Promise;