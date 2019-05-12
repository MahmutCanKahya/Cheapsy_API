var mongoose =require('mongoose');

var messageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    gonderici:mongoose.Schema.Types.ObjectId,
    mesaj:String,
    mesaj_zaman:{type:Date,default:Date.now},
    konusmaciId: mongoose.Schema.Types.ObjectId
},{collection:'mesajlar'}); 


module.exports = mongoose.model('mesaj',messageSchema);