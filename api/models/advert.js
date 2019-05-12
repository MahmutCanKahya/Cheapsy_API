var mongoose =require('mongoose');

var advertSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    kullanici_id:mongoose.Schema.Types.ObjectId,
    kategori:String,
    ilan_adi:{type:String,require:true},
    ilan_aciklama:String,
    ilan_url:String,
    fiyat:{type:Number,require:true},
    ilan_durumu:Boolean,
    ilan_tarihi:{type:Date,default:Date.now},
},{collection:'ilanlar'}); 


module.exports = mongoose.model('ilan',advertSchema);