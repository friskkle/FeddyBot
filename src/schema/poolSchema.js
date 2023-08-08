const { model, Schema } = require('mongoose');

let poolSchema = new Schema({
    Term: String,
    Category: String,
    Owner: String
})

module.exports = model("pSch", poolSchema);