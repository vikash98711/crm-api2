'use strict';
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
// const port = 8080;
const fs = require('fs');
const { checkDbConnection } = require('./config');


// const port = process.env.PORT || 8080;
const port = 8080



// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
const routes = require('./routes'); 


const app = express();
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original filename
  },
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  // Handle the uploaded file
  const file = req.file;
  console.log(file);

  // Process the file as needed
  // ...

  // Read the CSV file
  const csvFilePath = file.path;
 
  const results = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // Return the CSV data in JSON format
      res.status(200).json({ message: 'File uploaded successfully', data: results });
    });
});

app.use(express.json());
app.use(cors());
app.use('/', routes);
// Start the server
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  checkDbConnection()
});


















