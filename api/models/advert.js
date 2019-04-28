var mongoose =require('mongoose');

var advertSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    kullanici_id:String,
    ilan_adi:{type:String,require:true},
    ilan_aciklama:String,
    ilan_url:String,
    fiyat:{type:Number,require:true},
    ilan_durumu:Boolean,
    ilan_tarihi:{type:Date,default:Date.now},
    sehir:{type:String,require:true},
    ilce:{type:String,require:true},
    mahalle:{type:String,require:true}
},{collection:'ilanlar'}); 


module.exports = mongoose.model('ilan',advertSchema);