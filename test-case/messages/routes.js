const router = require("express").Router()
const Message = require("./model")
const { authenticate } = require("../auth/lib")

router.post("/", authenticate, async (req, res) => {
  const message = new Message({
    userId: req.user._id,
    title: req.body.title,
    time: req.body.time
  })
  await message.save()
  res.send(message)
})

router.get("/", authenticate, async (req, res) => {
  const messages = await Message.find({
    userId: req.user._id
  })
  console.log(messages)
  res.send(messages)
})

router.delete("/:messageId", async (req, res) => {
  const id = req.params.messageId
  await Message.deleteOne({
    _id: id
  })
  res.status(200).end()
})

module.exports = router