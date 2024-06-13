const users = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Sib = require('sib-api-v3-sdk');
const uuid = require('uuid');
const ForgotPasswordRequests = require('../models/forgotPasswordRequests');
const sequelize = require('../util/database');

const isNotValidString = (value) => {
  return !!(value === undefined || value.length === 0);
}

const generateAccessToken = (id, name, isPremiumUser) => {
  return jwt.sign({ userId: id, name: name, isPremiumUser }, process.env.JWT_SECRET_KEY)
}

exports.generateAccessToken = generateAccessToken;

exports.singupUser = (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (isNotValidString(name) || isNotValidString(email) || isNotValidString(password)) {
      return res.status(400).json({ message: 'Bad parameters!!' });
    }

    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
      console.log('hashErr', err);
      users.create({ name: name, email: email, password: hash })
        .then((result) => {
          console.log('User sing-up succesful');
          res.status(201).json({ message: 'User sign-up successful', result });
        }).catch(err => {
          console.log('Email already exists!!', err);
          res.status(500).json({ message: 'Email already exists!!', details: err });
        })
    })

  } catch (err) {
    console.log('Error in signupUser function', err);
    res.status(500).json({ error: 'Server error' });
  }
}

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await users.findOne({ where: { email: `${email}` } })

    if (user === null) {
      res.status(404).json({ message: 'User not found!!' })
    }

    bcrypt.compare(password, user.password, (err, response) => {
      if (err) {
        res.status(500).json({ message: 'something went wrong!!' });
      }
      if (response) {
        res.status(200).json({ message: 'User login successful', response: user, token: generateAccessToken(user.id, user.name, user.isPremiumUser) })
      } else {
        res.status(400).json({ message: 'Password is Incorrect!!' })
      }
    })

  } catch (err) {
    console.log('Server Error!!', err)
    res.status(500).json({ message: 'Server Error!!', details: err })
  }
}

exports.forgotPassword = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { email } = req.body

    const user = await users.findOne({ where: { email: email } })

    if (user) {
      console.log('user ----->', user)
      const id = uuid.v4();

      await ForgotPasswordRequests.create(
        { id, userId: user.id, active: true },
        { transaction: t }
      )
      // else {
      //   return res.status(404).json({ message: 'User not found' });
      // }

      const client = Sib.ApiClient.instance

      const apiKey = client.authentications['api-key']
      apiKey.apiKey = process.env.API_KEY

      const tranEmailApi = new Sib.TransactionalEmailsApi()

      const sender = {
        email: 'karthikshanigaram01@gmail.com'
      }

      const receiver = [
        { email: email },
      ]

      const result = await tranEmailApi.sendTransacEmail({
        sender,
        to: receiver,
        subject: 'Password reset mail',
        textContent: `
        Click the link to reset your password.
      `,
        htmlContent: `
       <h1>Click on the below link to reset your password.</h1>
       <a href='http://localhost:3000/user/password/resetPassword/${id}'>Reset Password<a/>
      `
      })

      console.log('sib---> ', result)
      await t.commit();
      res.status(200).json({ message: 'Link to reset password sent to your mail!!' })

    } else {
      console.log('User not found')
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    await t.rollback();
    console.log('Server Error!!', err)
    res.status(500).json({ message: 'Server Error!!', details: err })
  }
}

exports.resetPassword = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    console.log('reqBody ----> ', req.body)
    console.log('reqParams ----> ', req.params)
    console.log('reqParams ----> ', req.query)
    const { password } = req.body
    const { id } = req.params

    const forgotPasswordRequest = await ForgotPasswordRequests.findOne({ where: { id: id } })

    if (forgotPasswordRequest.active) {
      const user = await users.findOne({ where: { id: forgotPasswordRequest.userId } })

      const saltRounds = 10;
      bcrypt.hash(password, saltRounds, async (err, hash) => {

        if (err) {
          console.log('hashErr', err)
          throw new Error(err)
        }

        await user.update({ password: hash }, { transaction: t })
        await forgotPasswordRequest.update({ active: false }, { transaction: t })

        t.commit();
        res.status(201).json({ message: 'Password changed successfully!!' });
      })
    } else {
      res.status(404).json({ message: 'Bad request!!' })
    }

  } catch (err) {
    await t.rollback();
    console.log('Server Error!!', err)
    res.status(500).json({ message: 'Server Error!!', details: err })
  }
}
