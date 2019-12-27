const db = require("../db")

const Message = db.model(
  "messages",
  new db.Schema({
    userId: db.Schema.Types.ObjectId,
    userName: String,
    text: String,
    time: Date,
  })
)

module.exports = Message