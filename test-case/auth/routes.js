const router = require("express").Router()
const User = require("./model")
const { authenticate, getToken, hash } = require("./lib")

router.get("/guarded", authenticate, (req, res) => res.send(req.user))

router.post("/login", async (req, res) => {
  if (!req.body.login || !req.body.password){
    return res.status(400).send({ message: "Ne zvoni s`uda bolshe" })
  }

  const user = await User.findOne({
    login: req.body.login
  })

  if (req.body.login === "admin" && req.body.password === "pass" && !user) {
    const adminNew = new User({
      login: "admin",
      password: "pass",
      isAdmin: true
    })
    await adminNew.save()
    //res.send("Hi, admin")
    return res.send({
      token: getToken({ _id: user._id, login: user.login, isAdmin: true })
    })
  }

  if (req.body.login === "admin" && req.body.password === "pass" && user) {
    return res.send({
      token: getToken({ _id: user._id, login: user.login, isAdmin: true })
    })
  }

  if (!user) {
    const newUser = new User({
      login: req.body.login,
      password: hash(req.body.password),
      isAdmin: false
    })
    await newUser.save()

    return res.send({
      token: getToken({ _id: newUser._id, login: newUser.login, isAdmin: false })
    })
  } 
  
  if (user.password !== hash(req.body.password)) {
    return res.status(400).send({ message: "pass ne tot" })
  } 
  
  if (user.isBanned === true){
    return res.status(400).send({ message: "Ne zvoni s`uda bolshe" })
  }
    
  return res.send({
      token: getToken({ _id: user._id, login: user.login, isAdmin: user.isAdmin })
  })
})

module.exports = router
