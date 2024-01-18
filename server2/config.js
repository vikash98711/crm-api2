const sql = require('mssql');
require('dotenv').config();


const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, 
    trustServerCertificate: true, 
  },
};

// const config = {
//   user: 'upcloud', // Replace with process.env.DB_USER if using environment variable
//   password: 'Noida@105', // Replace with process.env.DB_PASSWORD if using environment variable
//   server: 'SG2NWPLS19SQL-v04.mssql.shr.prod.sin2.secureserver.net', // Replace with process.env.DB_SERVER if using environment variable
//   database: 'cmsIeducationalize', // Replace with process.env.DB_DATABASE if using environment variable
//   options: {
//     encrypt: true,
//     trustServerCertificate: true,
//   },
// };



const checkDbConnection = async () => {
  try {
    const pool = await sql.connect(config);
    if (pool.connected) {
      console.log('Database connection successful');
      return pool; 
    } else {
      console.log('Database connection failed');
    }
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  }
};

module.exports = { checkDbConnection };