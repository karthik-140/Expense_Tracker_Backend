const sequelize = require('../util/database');
const expenses = require('../models/expenses');
const users = require('../models/users');
const DownloadedFiles = require('../models/downloadedFiles');

const UserServices = require('../services/userServices');
const S3Services = require('../services/s3Services');

exports.addExpense = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const { amount, description, category } = req.body;
    const totalExpense = Number(req.user.totalExpenses) + Number(amount)

    const expense = await expenses.create(
      { amount, description, category, userId: req.user.id },
      { transaction: t }
    )
    await users.update(
      { totalExpenses: totalExpense },
      { where: { id: req.user.id }, transaction: t },
    )

    await t.commit()
    res.status(201).json({ message: 'Expense added successfully!!', expense })

  } catch (err) {
    await t.rollback()
    console.log('something went wrong!!', err)
    res.status(400).json({ message: 'Something went wrong!!', err })
  }
}

exports.getExpenses = async (req, res, next) => {
  try {
    // Dynamic pagination code

    console.log('req.queryPage--->', +req.query.page)
    console.log('req.queryLimit--->', +req.query.limit)
    const page = +req.query.page || 0
    const ITEMS_PER_PAGE = +req.query.limit
    const response = await expenses.findAndCountAll(
      {
        where: { userId: req.user.id },
        offset: page * ITEMS_PER_PAGE, limit: ITEMS_PER_PAGE
      },
    )

    // const response = await expenses.findAll({ where: { userId: req.user.id } })
    // console.log('response---->', response);
    if (response) {
      res.status(200).json({ message: 'Expenses fetched successfully!!', totalExpenses: response.count, expenses: response.rows })
    } else {
      res.status(400).json({ message: 'Something went wrong!!', response })
    }
  } catch (err) {
    console.log('Server error!!', err);
    res.status(500).json({ message: 'Server error!!', details: err })
  }
}

exports.deleteExpense = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const { id } = req.params;
    const { amount } = req.body
    const updateTotalExpense = Number(req.user.totalExpenses) - Number(amount)

    const response = await expenses.destroy(
      {
        where: { id: id, userId: req.user.id },
        transaction: t
      })

    if (response === 0) {
      await t.rollback()
      return res.status(404).json({ message: 'Expense not found!!' })
    }

    await users.update(
      { totalExpenses: updateTotalExpense },
      {
        where: { id: req.user.id },
        transaction: t
      }
    )

    await t.commit()
    res.status(200).json({ message: 'Expense deleted successfully!!' })

  } catch (err) {
    t.rollback()
    console.log('Server error!!', err);
    res.status(500).json({ message: 'Server error!!', details: err })
  }
}

exports.downloadExpenses = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const expenses = await UserServices.getExpenses(req, {
      attributes: ['amount', 'description', 'category']
    })
    const stringifiedExpenses = JSON.stringify(expenses)

    const userId = req.user.id
    const fileName = `Expense${userId}/${new Date()}.txt`
    const fileUrl = await S3Services.uploadToS3(stringifiedExpenses, fileName)

    if (fileUrl) {
      await DownloadedFiles.create({ userId, fileUrl }, { transaction: t })
      await t.commit()
      res.status(200).json({ fileUrl, success: true })
    } else {
      await t.rollback()
      res.status(404).json({ message: 'Something went wrong!!', success: false })
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error!!', details: err })
  }
}

exports.getDownloadedExpenses = async (req, res, next) => {
  try {
    const userId = req.user.id
    const downloadedFiles = await DownloadedFiles.findAll({ where: { userId } })
    res.status(200).json(downloadedFiles)
  } catch (err) {
    console.log('Server error!!', err);
    res.status(500).json({ message: 'Server error!!', details: err })
  }
}
