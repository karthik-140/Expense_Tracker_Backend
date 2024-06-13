const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const helmet = require('helmet');
const morgan = require('morgan');

const sequelize = require('./util/database');
const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const premiumRoutes = require('./routes/premium');

const users = require('./models/users');
const expenses = require('./models/expenses');
const Order = require('./models/order');
const ForgotPasswordRequests = require('./models/forgotPasswordRequests');
const DownloadedFiles = require('./models/downloadedFiles');

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

app.use(cors());
app.use(helmet());
app.use(morgan('combined', { stream: accessLogStream }));

app.use(bodyParser.json({ extended: false }));

app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumRoutes);

users.hasMany(expenses);
expenses.belongsTo(users);

users.hasMany(Order);
Order.belongsTo(users);

users.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(users);

users.hasMany(DownloadedFiles);
DownloadedFiles.belongsTo(users);

sequelize
  .sync()
  .then(() => {
    app.listen(process.env.PORT);
  })
  .catch((err) => {
    console.log(err)
  })
