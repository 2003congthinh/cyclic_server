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
  "name": String,
  "site_latitude": Number,
  "site_longitude": Number,
  "joined_people": Array,
  "owner": String
})

const accounts = new mongoose.model('testData', accountSchema, 'test') // name - schema - collection
const sites = new mongoose.model('sitetData', siteSchema, 'sites')

// Data handler
// TEST
app.get('/testAdmin', async (req, res) => {
  const owner1 = "dev";
  const owner2 = "s3926387@rmit.edu.vn";
  try {
    const result1 = await sites.find({owner: owner1});
    const result2 = await sites.find({owner: owner2});
    res.send("Single owner: "+result1+" Admin owner: "+result2);
  } catch (error) {
    console.log(error);
  }
});

// GET
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

app.get('/printAllSites', async (req, res) => {
  try {
    console.log(1)
    const found_sites = await sites.find();
    console.log(found_sites)
    res.send(found_sites);
  } catch (error) {
    console.log(error);
  }
});

// POST
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
    const nameExists = await accounts.findOne({ name });
    if (nameExists) { 
      return res.status(400).json({ message: 'Name already existed' });
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

app.post('/createSite', async(req, res) => {
  const { name, site_latitude, site_longitude, owner } = req.body;
  try {
    console.log('Received name:', name);
    console.log('Received latitude:', site_latitude);
    console.log('Received longitude:', site_longitude);
    console.log('Received owner:', owner);

    const siteExists = await sites.findOne({ name });
    if (siteExists) { 
      return res.status(400).json({ message: 'Site already created' });
    }
    // const ownerExists = await sites.findOne({ owner });
    // if (ownerExists && owner != "dev") { 
    //   return res.status(400).json({ message: 'You already created a site' });
    // }
    const numberOfSite = await sites.countDocuments()
    const new_s_id = 's' + (numberOfSite + 1).toString()
    const newSite = new sites({
      id: new_s_id,
      name,
      site_latitude,
      site_longitude,
      owner
    });
    await newSite.save();
    return res.status(200).json({ message: 'Site created successfully' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred' });
  }
});

app.post('/printMySites', async (req, res) => {
  const { owner } = req.body;
  if (owner == "dev"){
    try {
      const result = await sites.find();
      res.json(result);
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
      const result = await sites.find({ owner });
      res.json(result);
    } catch (error) {
      console.log(error);
    }
  }
});

app.post('/findSearchSites', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await sites.find({ name });
    res.json(result);
  } catch (error) {
    console.log(error);
  }
});

app.post('/joinInSite', async (req, res) => {
  const { id, name } = req.body;
  try {
    // Check if the user with the given name already joined
    const userExists = await sites.exists({
      "id": id,
      "joined_people": { $in: [name] }
    });

    if (userExists) {
      return res.status(401).json({ message: 'User already joined this site' });
    }

    const result = await sites.updateOne(
      { "id": id },
      { $push: { "joined_people": name } }
    );

    // Check if the update was successful
    if (result.modifiedCount === 1) {
      return res.status(200).json({ message: 'Site created successfully' });
    } else {
      res.status(404).json({ error: "Document not found or not updated." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/getAccount', async (req, res) => {
  const { email } = req.body;
  try {
    const result = await accounts.find({ email });
    res.json(result);
  } catch (error) {
    console.log(error);
  }
});

app.post('/getSiteDetails', async (req, res) => {
  const { id } = req.body;
  try {
    const result = await sites.find({ id });
    res.json(result);
  } catch (error) {
    console.log(error);
  }
});

app.post('/getSitesIJoined', async (req, res) => {
  const { owner } = req.body;
  try {
    // Check if the user with the given name already joined
    const userExists = await sites.find({
      "joined_people": { $in: [owner] }
    });

    if (userExists) {
      res.json(userExists);
    }
    return res.status(401).json({ message: 'User already joined this site' });
  } catch (error) {
    console.log(error);
  }
});

const HTTP_PORT = process.env.PORT || 8000;
app.listen(HTTP_PORT, () => console.log(`Express Server started on port ${HTTP_PORT}`));