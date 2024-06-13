const users = require('../models/users');

exports.getPremiumLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await users.findAll({
      attributes: ['id', 'name', 'totalExpenses'],
      order: [['totalExpenses', 'DESC']]
    })

    res.status(200).json(leaderboard);

  } catch (err) {
    console.log('Server Error!!', err);
    res.status(500).json({ message: 'Server Error', details: err });
  }
}
