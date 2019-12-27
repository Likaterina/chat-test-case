const crypto = require("crypto")
const jwt = require("jsonwebtoken")

const SALTjwt = "reactcal"

const getToken = obj => jwt.sign(obj, SALTjwt)

const decode = token => {
  return new Promise((resolve, reject) => {
    return jwt.verify(token, SALTjwt, (err, decoded) => {
      if (err) {
        reject(err)
      }
      resolve(decoded)
    })
  })
}

const SALT = "asslist"

const hash = password => {
  return crypto
    .createHash("sha256")
    .update(password + SALT)
    .digest("base64")
}

const authenticate = async (req, res, next) => {
  const authorization = req.get("Authorization")
  if (!authorization) {
    res.status(403).end()
    return
  }
  try {
    const decoded = await decode(authorization)
    req.user = decoded
    next()
  } catch (error) {
    res.status(403).end()
  }
}

module.exports = { getToken, hash, authenticate }
