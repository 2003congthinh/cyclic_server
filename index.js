const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser');

const connection_string = "mongodb+srv://thinhdeptrai:T12namhsgioiT@cluster02703.syx3xrh.mongodb.net/test?retryWrites=true&w=majority"

mongoose.connect(connection_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())

// code here
// Schema handler
const accountSchema = new mongoose.Schema({
  "email": String,
  "password": String,
  "name": String
})

const siteSchema = new mongoose.Schema({
  "id": String,
  "criteria": Number,
  "location": Array,
  "name": String,
  "joined_people": Array,
  "owner": String
})

const accounts = new mongoose.model('testData', accountSchema, 'test') // name - schema - collection
const sites = new mongoose.model('sitetData', siteSchema, 'sites')

// Data handler
app.get('/printAllData', async (req, res) => {
  try {
    console.log(1)
    const found_student = await accounts.find();
    console.log(found_student)
    res.send(found_student);
  } catch (error) {
    console.log(error);
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Received email:', email);
    console.log('Received password:', password);
    try {
      // Find the account by either email or phone
      const accountFound = await accounts.findOne({
        $or: [{ email: email }],
      });
      console.log(accountFound.password);
      if (!accountFound) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      if (accountFound.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      } else {
        return res.status(200).json({message: 'Login successful' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred' });
  }
});

app.post('/signup', async(req, res) => {
  const { email, password, name } = req.body;
  try {
    console.log('Received email:', email);
    console.log('Received password:', password);
    console.log('Received name:', name);
    const accountExists = await accounts.findOne({ email });
    if (accountExists) { 
      return res.status(400).json({ message: 'Email already registered' });
    }
    const newAccount = new accounts({
      email,
      password,
      name
    });
    await newAccount.save();
    return res.status(200).json({ message: 'Signup successful' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred' });
  }
});

const HTTP_PORT = process.env.PORT || 8000;
app.listen(HTTP_PORT, () => console.log(`Express Server started on port ${HTTP_PORT}`));