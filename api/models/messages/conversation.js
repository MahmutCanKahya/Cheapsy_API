var mongoose =require('mongoose');

var conversationSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    konusmacilar: [mongoose.Schema.Types.ObjectId]
},{collection:'konusmalar'}); 


module.exports = mongoose.model('konusma',conversationSchema);