var mongoose =require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    ad:{type:String,required:true},
    soyad:{type:String,required:true},
    sifre:{type:String,required:true},
    email : { type : String, required : true,unique:true, match:/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/},
    sehir :{type:String},
    hakkinda:{type:String},
    adres:{type:String},
    resim:{type:String},
},{collection:'kullanicilar'}); 

var User = mongoose.model('Kullanici',userSchema);

module.exports = User;