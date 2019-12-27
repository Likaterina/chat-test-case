const jwt = require("jsonwebtoken")
const User = require("./auth/model")
const Message = require("./messages/model")

let users = {}
let sockets = {}
const SALTjwt = "reactcal"

const socket = io => {
  io.use((socket, next) => {
    const { token } = socket.handshake.query
    if (jwt.verify(token, SALTjwt)) {
      return next()
    }
    return next(new Error("authentication error"))
  })

  io.on("connection", async socket => {
    console.log("socket connected")

    const { token } = socket.handshake.query
    const userFromToken = jwt.decode(token, SALTjwt)

    let user = await User.findOne({
      _id: userFromToken._id
    })
    if (!user || user.isBanned) {
      socket.logout()
      return
    }

    user = user.toObject()
    socket.userId = user._id

    users[user._id] = user
    sockets[user._id] = socket

    let allMessages = await Message.find({}).lean()

    socket.emit("allMessages", allMessages)

    socket.broadcast.emit("sendAllUsers", users)
    socket.emit("sendAllUsers", users)

    socket.on("message", async msg => {
      let user = await User.findOne({
        _id: userFromToken._id
      })
      if (user.isMuted) return  
      const message = new Message({
        userId: user._id,
        text: msg.text,
        userName: user.login
      })
      await message.save()
      socket.broadcast.emit("message", message)
      socket.emit("message", message)
    })

    socket.on("muteUser", async thisUser => {
      const mutedUser = await User.findOne({
        _id: thisUser._id
      })
      mutedUser.isMuted = true
      await mutedUser.save()
      users[thisUser._id] = mutedUser
      socket.broadcast.emit("sendAllUsers", users)
      socket.emit("sendAllUsers", users)
      console.log("muted", mutedUser)
    })

    socket.on("unmuteUser", async thisUser => {
      const unmutedUser = await User.findOne({
        _id: thisUser._id
      })

      unmutedUser.isMuted = false
      await unmutedUser.save()
      users[thisUser._id] = unmutedUser
      socket.broadcast.emit("sendAllUsers", users)
      socket.emit("sendAllUsers", users)
      console.log("unmuted", unmutedUser)
    })

    socket.on("banUser", async thisUser => {
      const userToBan = await User.findOne({
        _id: thisUser._id
      })
      userToBan.isBanned = true
      await userToBan.save()
      users[thisUser._id] = userToBan
      sockets[thisUser._id].disconnect()
    })

    socket.on("disconnect", () => {
      console.log("disconnected")
      delete sockets[user._id]
      delete users[user._id]
      socket.broadcast.emit("sendAllUsers", users)
      socket.emit("sendAllUsers", users)
    })
  })
}
module.exports = { socket }
