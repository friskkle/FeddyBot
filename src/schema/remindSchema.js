const { model, Schema } = require('mongoose');

let remindSchema = new Schema({
    User: String,
    Time: String,
    Title: String,
    Desc: String,
    Channel: String,
    DM: Boolean
})

module.exports = model("rSch", remindSchema);