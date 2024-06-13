const jwt = require('jsonwebtoken');
const User = require('../models/users');

const authenticate = (req, res, next) => {
  try {
    const token = req.header('Authorization')
    console.log('token', token)
    const user = jwt.verify(token, 'secretKey');
    console.log('userResponse', user)
    User.findByPk(user.userId).then((user) => {
      req.user = user
      next()
    })
  } catch (err) {
    console.log(err)
  }
}

module.exports = {
  authenticate
}
