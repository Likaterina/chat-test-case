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
      console.log("logout", user)
      socket.logout()
      socket.disconnect()
      return
    } 

    user = user.toObject()
    socket.userId = user._id

    users[user._id] = user
    sockets[user._id] = socket

    if (users[user._id] === undefined) {
      users[user._id] = { ...user, online: true }
    } else {
      users[user._id].online = true
    }

    let allMessages = await Message.find({}).lean()

    socket.emit("allMessages", allMessages)

    socket.broadcast.emit("sendAllUsers", users)
    socket.emit("sendAllUsers", users)

    let lastMessage = 0

    socket.on("message", async msg => {
      if(Date.now() - lastMessage <= 15000) {
        return 
      } else {
        lastMessage = Date.now()
      }
      let user = await User.findOne({
        _id: userFromToken._id
      })
      if (msg.text.length > 200 || user.isMuted) return
      const message = new Message({
        userId: user._id,
        text: msg.text,
        userName: user.login
      })
      await message.save()
      socket.broadcast.emit("message", message)
      socket.emit("message", message)
    })

    if (user.isAdmin) {
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
        socket.emit("sendAllUsers", users)
      })

      socket.on("unbanUser", async thisUser => {
        const userToUnban = await User.findOne({
          _id: thisUser._id
        })
        console.log("unban", userToUnban)
        userToUnban.isBanned = false
        await userToUnban.save()
        users[thisUser._id] = userToUnban
        socket.broadcast.emit("sendAllUsers", users)
        socket.emit("sendAllUsers", users)        
      })
    }

    socket.on("disconnect", () => {
      console.log("disconnected")
      users[user._id].online = false
      delete sockets[user._id]
      socket.broadcast.emit("sendAllUsers", users)
      socket.emit("sendAllUsers", users)
    })
  })
}
module.exports = { socket }
