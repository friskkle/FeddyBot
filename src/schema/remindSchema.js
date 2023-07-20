const { model, Schema } = require('mongoose');

let remindSchema = new Schema({
    User: String,
    Time: String,
    Title: String,
    Desc: String,
})

module.exports = model("rSch", remindSchema);