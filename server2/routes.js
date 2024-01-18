const express = require('express');
const sql = require('mssql');
const multer = require('multer');
const config = require('./config'); 
const nodemailer = require("nodemailer");

const { checkDbConnection } = require('./config');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



const router = express();




router.post('/send-email', async (req, res) => {  
  try {
    const {
      subject,
      emails,
      BccEmail,
      username,
      password,
      header,
      footer,
      emailProtocol,
      emailEncryption,
      smtpHost,
      smtpPort,
      emailCharset,
      emailSignature,
      CreatedBy
    } = req.body;
console.log(req.body);
    // Use the values from the request body or fallback to default values
    const mailOptions = {
      from: username || 'vikashkumar.125911@gmail.com',
      to: emails,
      bcc: BccEmail || '',
      subject: subject || 'Default Subject',
      html: `
      <html>
        <head>
        <meta charset="${emailCharset || 'UTF-8'}">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f2f2f2;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
            }
    
            header {
              background-color: #4CAF50;
              padding: 20px;
              text-align: center;
            }
    
            header h1 {
              color: white;
            }
    
            main {
              padding: 20px;
            }
    
            footer {
              background-color: #4CAF50;
              color: white;
              padding: 10px;
              text-align: center;
              margin-top: auto; /* Push the footer to the bottom */
            }
          </style>
        </head>
        <body>
          <header>
            ${header}
          </header>
          <main>
         <p>bodycontent</p>
          </main>
          <footer>${footer || '<p>Default Body</p>'}</footer>
          <p>Signature </p>
          <p>${emailSignature || ''}</p>
        </body>
      </html>
    `,
    };

    const transportOptions = {
      service: emailProtocol || 'gmail',
      host: smtpHost || 'smtp.gmail.com',
      port: smtpPort || 465,
      secure: emailEncryption === 'SSL' ? true : emailEncryption === 'TLS' ? true : false,
      auth: {
        user: username || 'vikashkumar.125911@gmail.com',
        pass: password || 'pvao hwtf pxnd ncqk',
      },
    };

    const customTransporter = nodemailer.createTransport(transportOptions);

    const info = await customTransporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);

    // Save email information to the database using the stored procedure
 
   // Replace with the actual user ID or information

    const request = new sql.Request(/* your SQL Server connection pool */);

    await request
      .input('Subject', sql.VarChar(250), subject)
      .input('Emails', sql.VarChar(250), emails)
      .input('BccEmail', sql.VarChar(250), BccEmail)
      .input('UserName', sql.VarChar(250), username)
      .input('EmailSignature', sql.VarChar(250), emailSignature)
      .input('CreatedBy', sql.Int, CreatedBy)
     
      .execute('InsertEmail');

    res.json({ message: 'Email sent successfully and saved to the database!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'An error occurred while sending the email.' });
  }
});








router.get('/api/CommonStatus', async (req, res) => {
  try {
    // Connect to the SQL Server
    await sql.connect(config);

    // Execute the stored procedure
    const result = await sql.query('SelectDisplayStatus');

    // Send the result as JSON
    res.json(result.recordsets);

  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});
router.get('/api/AccountStatus', async (req, res) => {
  try {
    // Connect to the SQL Server
    await sql.connect(config);

    // Execute the stored procedure
    const result = await sql.query('GetAccountStatusData');

    // Send the result as JSON
    res.json(result.recordsets);

  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});




router.post('/Role', async (req, res) => {
  // console.log(req.body)
  const { deafaultvar, RoleName, DisplayStatus } = req.body;

  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    // Convert deafaultvar to integer
    const deafaultvarAsInt = parseInt(deafaultvar);

    // console.log('Executing SQL query...');
    // console.log('Params:', deafaultvarAsInt, RoleName, DisplayStatus);

    // Call the stored procedure to insert data into the table
    await request
  .input('deafaultvar', sql.Int, deafaultvarAsInt)
  .input('RoleName', sql.VarChar(50), RoleName)
  .input('DisplayStatus', sql.Bit, DisplayStatus)
  // .execute('[upcloud].[InsertRolee]');
  // .execute('InsertRolee');
  .execute('InsertIntoRole');
  // .execute('[upcloudglobal].[InsertIntoCRMRole]');



    console.log('SQL query executed successfully.');

    res.status(201).json({ message: 'Registration inserted successfully' });
  } catch (error) {
    console.error('Error inserting registration data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.get('/getAllRoles', async (req, res) => {
  try {
    // Reuse the existing config object
    const pool = await sql.connect(config);
    const request = pool.request();

    // Execute the stored procedure to get all roles
    // const result = await request.execute('SelectAllFromRole');
    const result = await request.execute('SelectIntoRole');

    // Send the retrieved data as JSON
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'Internal server error' });
  } 
});



router.post('/SelectRoleFromId', async (req, res) => {
  try {
    // Connect to the database
    const pool = await sql.connect(config);

    // Get the ID from the request body
    const roleId = req.body.deafaultvar;

    // Execute the stored procedure with the provided ID
    const result = await pool.request()
      .input('deafaultvar', sql.Int, roleId)
      .query('EXEC upcloudglobal.SelectRoleFromId @Deafaultvar');

    // Send the result as JSON
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error processing the request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// role api ending















// department api starting here 
router.post('/departmentregistered', async (req, res) => {
  // console.log(req.body)
  const { deafaultvar, DepartmentName, DisplayStatus } = req.body;

  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    // Convert deafaultvar to integer
    const deafaultvarAsInt = parseInt(deafaultvar);

    // console.log('Executing SQL query...');
    // console.log('Params:', deafaultvarAsInt, RoleName, DisplayStatus);

    // Call the stored procedure to insert data into the table
    await request
  .input('deafaultvar', sql.Int, deafaultvarAsInt)
  .input('DepartmentName', sql.VarChar(50), DepartmentName)
  .input('DisplayStatus', sql.Bit, DisplayStatus)
  // .execute('[upcloud].[InsertRolee]');
  // .execute('InsertRolee');
  .execute('InsertIntoDepartment');
  // .execute('[upcloudglobal].[InsertIntoCRMRole]');



    console.log('SQL query executed successfully.');

    res.status(201).json({ message: 'Registration inserted successfully' });
  } catch (error) {
    console.error('Error inserting registration data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/api/getAlldepartment', async (req, res) => {
  try {
    // Reuse the existing config object
    const pool = await sql.connect(config);
    const request = pool.request();

    // Execute the stored procedure to get all roles
    // const result = await request.execute('SelectAllFromRole');
    const result = await request.execute('SelectIntoDepartment');

    // Send the retrieved data as JSON
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'Internal server error' });
  } 
});


// department api ending 



// setting api starting here 
// setting api starting here 
// general api starting 
// router.post('/SettingGeneral', upload.fields([
//   { name: 'CompanyLogo', maxCount: 1 },
//   { name: 'CompanyLogoDark', maxCount: 1 },
//   { name: 'Favicon', maxCount: 1 },
// ]), async (req, res) => {
//   console.log(req.body);
//   try {
//     const { defaultVar, CompanyName, CompanyDomain, AllowedFileTypes, RTLAdmin, RTLCustomerArea} = req.body;

//     // const rtlAdminBool = RTLAdmin === 'true';
// // const rtlCustomerAreaBool = RTLCustomerArea === 'true';

//     // Check if a file was uploaded
//     if (!req.files || Object.keys(req.files).length === 0) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     // Extract file buffers from req.files
//     const {
//       CompanyLogo,
//       CompanyLogoDark,
//       Favicon,
//     } = req.files;

//     // Convert string values to boolean
//     // const RTLAdmin = Boolean(req.body.RTLAdmin);
//     // const RTLCustomerArea = Boolean(req.body.RTLCustomerArea);

//     const pool = await sql.connect(config);
//     const request = pool.request();

//     request
//       .input('defaultVar', sql.Int, defaultVar)
//       .input('CompanyLogo', sql.VarBinary(sql.MAX), CompanyLogo[0].buffer)
//       .input('CompanyLogoDark', sql.VarBinary(sql.MAX), CompanyLogoDark[0].buffer)
//       .input('Favicon', sql.VarBinary(sql.MAX), Favicon[0].buffer)
//       .input('CompanyName', sql.VarChar(100), CompanyName)
//       .input('CompanyDomain', sql.VarChar(255), CompanyDomain)
//       .input('RTLAdmin', sql.VarChar(50), RTLAdmin)
//       .input('RTLCustomerArea', sql.VarChar(50), RTLCustomerArea)
//       .input('AllowedFileTypes', sql.VarChar(sql.MAX), AllowedFileTypes);

//     const result = await request.execute('InsertIntoSetting_General');

//     // sql.close(); // Close the database connection

//     if (result.returnValue === 0) {
//       res.status(201).json({ message: 'Data inserted or updated successfully' });
//     } else {
//       res.status(500).json({ error: 'Error inserting or updating data' });
//     }
//   } catch (err) {
//     console.error('Error processing the request:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
// router.post('/SettingGeneral', upload.fields([
//   { name: 'CompanyLogo', maxCount: 1 },
//   { name: 'CompanyLogoDark', maxCount: 1 },
//   { name: 'Favicon', maxCount: 1 },
// ]), async (req, res) => {
//   console.log(req.body);
//   try {
//     const { defaultVar, CompanyName, CompanyDomain, AllowedFileTypes, RTLAdmin, RTLCustomerArea,CreatedBy} = req.body;

// //     const rtlAdminBool = RTLAdmin === 'true';
// // const rtlCustomerAreaBool = RTLCustomerArea === 'true';
// const rtlAdminBool = RTLAdmin === 'true' ? 1 : 0;
// const rtlCustomerAreaBool = RTLCustomerArea === 'true' ? 1 : 0;

//     // Check if a file was uploaded
//     if (!req.files || Object.keys(req.files).length === 0) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     // Extract file buffers from req.files
//     const {
//       CompanyLogo,
//       CompanyLogoDark,
//       Favicon,
//     } = req.files;

//     // Convert string values to boolean
//     // const RTLAdmin = Boolean(req.body.RTLAdmin);
//     // const RTLCustomerArea = Boolean(req.body.RTLCustomerArea);

//     const pool = await sql.connect(config);
//     const request = pool.request();

//     request
//       .input('defaultVar', sql.Int, defaultVar)
//       .input('CompanyLogo', sql.VarBinary(sql.MAX), CompanyLogo[0].buffer)
//       .input('CompanyLogoDark', sql.VarBinary(sql.MAX), CompanyLogoDark[0].buffer)
//       .input('Favicon', sql.VarBinary(sql.MAX), Favicon[0].buffer)
//       .input('CompanyName', sql.VarChar(100), CompanyName)
//       .input('CompanyDomain', sql.VarChar(255), CompanyDomain)
//       .input('RTLAdmin', sql.Bit, rtlAdminBool)
//       .input('RTLCustomerArea',sql.Bit, rtlCustomerAreaBool)
//       .input('AllowedFileTypes', sql.VarChar(sql.MAX), AllowedFileTypes)
//       .input('CreatedBy', sql.Int, CreatedBy);


//     const result = await request.execute('InsertIntoSetting_General');

//     // sql.close(); // Close the database connection

//     if (result.returnValue === 0) {
//       res.status(201).json({ message: 'Data inserted or updated successfully' });
//     } else {
//       res.status(500).json({ error: 'Error inserting or updating data' });
//     }
//   } catch (err) {
//     console.error('Error processing the request:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

router.post('/SettingGeneral', upload.fields([
  { name: 'CompanyLogo', maxCount: 1 },
  { name: 'CompanyLogoDark', maxCount: 1 },
  { name: 'Favicon', maxCount: 1 },
]), async (req, res) => {
  // console.log(req.body);
  try {
    const { defaultVar, CompanyName, CompanyDomain, AllowedFileTypes, RTLAdmin, RTLCustomerArea, CreatedBy } = req.body;

    const rtlAdminBool = RTLAdmin === 'true' ? 1 : 0;
    const rtlCustomerAreaBool = RTLCustomerArea === 'true' ? 1 : 0;

    // Extract file buffers from req.files
    const {
      CompanyLogo,
      CompanyLogoDark,
      Favicon,
    } = req.files || {};

    const pool = await sql.connect(config);
    const request = pool.request();

    request
      .input('defaultVar', sql.Int, defaultVar)
      .input('CompanyLogo', sql.VarBinary(sql.MAX), CompanyLogo ? CompanyLogo[0].buffer : null)
      .input('CompanyLogoDark', sql.VarBinary(sql.MAX), CompanyLogoDark ? CompanyLogoDark[0].buffer : null)
      .input('Favicon', sql.VarBinary(sql.MAX), Favicon ? Favicon[0].buffer : null)
      .input('CompanyName', sql.VarChar(100), CompanyName)
      .input('CompanyDomain', sql.VarChar(255), CompanyDomain)
      .input('RTLAdmin', sql.Bit, rtlAdminBool)
      .input('RTLCustomerArea', sql.Bit, rtlCustomerAreaBool)
      .input('AllowedFileTypes', sql.VarChar(sql.MAX), AllowedFileTypes)
      .input('CreatedBy', sql.Int, CreatedBy);

    const result = await request.execute('InsertIntoSetting_General');

    if (result.returnValue === 0) {
      res.status(201).json({ message: 'Data inserted or updated successfully' });
    } else {
      res.status(500).json({ error: 'Error inserting or updating data' });
    }
  } catch (err) {
    console.error('Error processing the request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});











router.get('/SelectIntoSetting_General', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    const result = await request.execute('upcloudglobal.SelectIntoSetting_General');

    // sql.close(); // Close the database connection

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json({ error: 'No data found' });
    }
  } catch (err) {
    console.error('Error processing the request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/Setting_GeneralCompanyLogo', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    const result = await request.execute('upcloudglobal.GetCompanyLogo');

    // sql.close(); // Close the database connection

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json({ error: 'No data found' });
    }
  } catch (err) {
    console.error('Error processing the request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// general api ending

// company information api starting here 
router.post('/InsertCompanyInfo', async (req, res) => {
  console.log(req.body);
  try {
  const {Deafaultvar,CompanyName,Address,City,State,Country_Code,Zip_Code,Phone_No,VAT_Num,Company_Format,CreatedBy} = req.body;

    const pool = await sql.connect(config);
    const request = pool.request();

    request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('CompanyName', sql.VarChar(55), CompanyName)
      .input('Address', sql.VarChar(60), Address)
      .input('City', sql.VarChar(55), City)
      .input('State', sql.VarChar(55), State)
      .input('Country_Code', sql.VarChar(50), Country_Code)
      .input('Zip_Code', sql.Int, Zip_Code)
      .input('Phone_No', sql.BigInt, Phone_No)
      .input('VAT_Num', sql.VarChar(100), VAT_Num)
      .input('Company_Format', sql.VarChar(sql.MAX), Company_Format)
      .input('CreatedBy', sql.Int, CreatedBy);

    const result = await request.execute('InsertCompanyInfo');

    // sql.close(); // Close the database connection

    if (result.returnValue === 0) {
      res.status(201).json({ message: 'Data inserted or updated successfully' });
    } else {
      res.status(500).json({ error: 'Error inserting or updating data' });
    }
  } catch (err) {
    console.error('Error processing the request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});











router.get('/SelectCompanyInfo', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    const result = await request.execute('upcloudglobal.SelectCompanyInfo');

    // sql.close(); // Close the database connection

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json({ error: 'No data found' });
    }
  } catch (err) {
    console.error('Error processing the request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// company information api ending  here 


// localization api starting here

router.post('/InsertLocalization', async (req, res) => {
  try {
    const {
      CreatedBy,
      DefaultVar,
      Date_Format,
      Time_Format,
      Default_Timezone,
      Default_Language,
      Disable_Language,
      Client_Language,
     
    } = req.body;
console.log(req.body);
    // const DisableLanguage = Disable_Language === 'true' ? 1 : Disable_Language === 'false' ? 0 : 1;
    // const ClientLanguage = Client_Language === 'true' ? 1 : Client_Language === 'false' ? 0 : 1;
    // const DisableLanguage = Disable_Language === 'true' ? 1 : 0;
    // const ClientLanguage = Client_Language === 'true' ? 1 : 0;

  //  console.log("ClientLanguage",ClientLanguage);
    
// console.log(req.body);
    const pool = await sql.connect(config);
    const request = pool.request();

    request
    .input('CreatedBy', sql.Int, CreatedBy)
      .input('DefaultVar', sql.Int,  DefaultVar)
      .input('Date_Format', sql.VarChar(50), Date_Format)
      .input('Time_Format', sql.VarChar(50), Time_Format)
      .input('Default_Timezone', sql.VarChar(50), Default_Timezone)
      .input('Default_Language', sql.VarChar(50), Default_Language)
      .input('Disable_Language', sql.Bit, Disable_Language)
      .input('Client_Language', sql.Bit, Client_Language);

    const result = await request.execute('InsertLocalization');

    // sql.close(); // Close the database connection

    if (result.returnValue === 0) {
      res.status(201).json({ message: 'Data inserted or updated successfully' });
    } else {
      res.status(500).json({ error: 'Error inserting or updating data' });
    }
  } catch (err) {
    console.error('Error processing the request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.get('/SelectLocalization', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    const result = await request.execute('upcloudglobal.SelectLocalization');

    // sql.close(); // Close the database connection

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json({ error: 'No data found' });
    }
  } catch (err) {
    console.error('Error processing the request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// select all lanugauses in this api starting here 
// all city code with currency api starting here 
router.get('/getAllcities', async (req, res) => {
  try {
    // Reuse the existing config object
    const pool = await sql.connect(config);
    const request = pool.request();

    // Execute the stored procedure to get all roles
    // const result = await request.execute('SelectAllFromRole');
    const result = await request.execute('upcloudglobal.SelectCountry');
    // console.log("result",result);

    // Send the retrieved data as JSON
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'Internal server error' });
  } 
});


// all city code with currency api ending here 

// select all lanugauses in this api ending here 

// localization api ending here 



// email api starting here

router.post('/InsertEmailSmtpSettings', async (req, res) => {
  try {
    const {
      Deafaultvar,
    emailProtocol,
    emailEncryption,
    smtpHost,
    smtpPort,
    email,
    smtpUsername,
    smtpPassword,
    emailCharset,
    BccEmail,
    emailSignature,
    predefinedHeader,
    predefinedFooter,
    // testEmailAddress,
    CreatedBy  
    } = req.body;
console.log("smtpdata",req.body);
    const pool = await sql.connect(config);
    const request = pool.request();

    request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      // .input('MailEngine', sql.VarChar(255), MailEngine)
      .input('EmailProtocol', sql.VarChar(50), emailProtocol)
      .input('EmailEncryption', sql.VarChar(50), emailEncryption)
      .input('SmtpHost', sql.VarChar(255), smtpHost)
      .input('SmtpPort', sql.BigInt, smtpPort)
      .input('Email', sql.VarChar(255), email)
      .input('SmtpUsername', sql.VarChar(255), smtpUsername)
      .input('SmtpPassword', sql.VarChar(255), smtpPassword)
      .input('EmailCharset', sql.VarChar(50), emailCharset)
      .input('BccEmail', sql.VarChar(60), BccEmail)
      .input('EmailSignature', sql.VarChar(sql.MAX), emailSignature)
      .input('PreHeader', sql.VarChar(sql.MAX), predefinedHeader)
      .input('PreFooter', sql.VarChar(sql.MAX), predefinedFooter)
      .input('CreatedBy', sql.Bit, CreatedBy);

    const result = await request.execute('InsertEmailSmtpSettings');



    if (result.returnValue === 0) {
      res.status(201).json({ message: 'Data inserted or updated successfully' });
    } else {
      res.status(500).json({ error: 'Error inserting or updating data' });
    }
  } catch (err) {
    console.error('Error processing the request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





router.get('/SelectEmail_SMTP', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    const result = await request.execute('upcloudglobal.SelectEmail_SMTP');



    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json({ error: 'No data found' });
    }
  } catch (err) {
    console.error('Error processing the request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// email api ending here 


// Finance api starting here 
router.post('/InsertFinanceGeneral', async (req, res) => {
  try {
    const {
      Defaultvar,
      Decimalseparator,
      Thousandseparator,
      Zeropadding,
      AutoAssignment,
      ShowTax,
      RemoveTaxName,
      ExcludeCurrencySymbol,
      DefaultTax,
      RemovalDecimal,
      AmountToWordsEnable,
      NumberWordsToLowercase,
      CreatedBy
    } = req.body;
    
    console.log(req.body);

    const Assignment = AutoAssignment === 'true' ? 1 : 0;
    const ShowTaxs = ShowTax === 'true' ? 1 : 0;
    const RemoveTaxs = RemoveTaxName === 'true' ? 1 : 0;
    const CurrencySyntaxes = ExcludeCurrencySymbol === 'true' ? 1 : 0;
    
    const RemovalDecimals = RemovalDecimal === 'true' ? 1 : 0;
    const AmountEnables = AmountToWordsEnable === 'true' ? 1 : 0;
    const AmountLowercasings = NumberWordsToLowercase === 'true' ? 1 : 0;
   


    const pool = await sql.connect(config);
    const request = pool.request();

    request
      .input('Defaultvar', sql.Int, Defaultvar)
      .input('Decimalseparator', sql.NVarChar(1), Decimalseparator)
      .input('Thousandseparator', sql.VarChar(55), Thousandseparator)
      .input('Zeropadding', sql.BigInt, Zeropadding)
      .input('AutoAssignment', sql.Bit, Assignment)
      .input('ShowTax', sql.Bit, ShowTaxs)
      .input('RemoveTax', sql.Bit, RemoveTaxs)
      .input('CurrencySyntax', sql.Bit, CurrencySyntaxes)
      .input('DefaultTax', sql.VarChar(sql.MAX), DefaultTax)
      .input('RemovalDecimal', sql.Bit, RemovalDecimals)
      .input('AmountEnable', sql.Bit, AmountEnables)
      .input('AmountLowercasing', sql.Bit, AmountLowercasings)
      .input('CreatedBy', sql.Int, CreatedBy);

    const result = await request.execute('[upcloudglobal].[InsertFinanceGeneral]');

    if (result.returnValue === 0) {
      res.status(201).json({ message: 'Data inserted or updated successfully' });
    } else {
      res.status(500).json({ error: 'Error inserting or updating data' });
    }
  } catch (err) {
    console.error('Error processing the request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




router.get('/SelectFinanceGeneral', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    const result = await request.execute('upcloudglobal.SelectFinanceGeneral');

    // sql.close(); // Close the database connection

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json({ error: 'No data found' });
    }
  } catch (err) {
    console.error('Error processing the request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/GeneralGetBYID', async (req, res) => {
  try {
    const pool = await sql.connect(config);

    const request = new sql.Request(pool);
    const deafaultvar = req.body.deafaultvar || 0; // Default value if not provided

    const result = await request
      .input('deafaultvar', sql.Int, deafaultvar)
      .execute('[upcloudglobal].[SelectFinanceGeneral]');

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
// finace tab api starting here  invoice 



router.post('/InsertFinanceInvoice', async (req, res) => {
  try {
    const {
      Deafaultvar,
      InvoiceNoPrefix,
      InvoiceNextNo,
      InvoiceDueDate,
      ClientAuth,
      ClientLogin,
      DeleteInvoices,
      DecrementInvoice,
      FilteringInvoice,
      ShowsaleAgent,
      ShowProjectName,
      ShowTotalPaid,
      ShowCreditApplied,
      ShowAmountDue,
      InvoiceAttachment,
      InvoiceNoFormat,
      PredefinedClientNote,
      PredefinedTC,
      CreatedBy
    } = req.body;


    const ClientAuths = ClientAuth === 'true' ? 1 : 0;
    const ClientLogins = ClientLogin === 'true' ? 1 : 0;
    const DeleteInvoiceses = DeleteInvoices === 'true' ? 1 : 0;
    const DecrementInvoices = DecrementInvoice === 'true' ? 1 : 0;
    
    const FilteringInvoices = FilteringInvoice === 'true' ? 1 : 0;
    const ShowsaleAgents = ShowsaleAgent === 'true' ? 1 : 0;
    const ShowProjectNames = ShowProjectName === 'true' ? 1 : 0;
    const ShowTotalPaids = ShowTotalPaid === 'true' ? 1 : 0;
    const ShowCreditApplieds = ShowCreditApplied === 'true' ? 1 : 0;
    const ShowAmountDues = ShowAmountDue === 'true' ? 1 : 0;
    const InvoiceAttachments = InvoiceAttachment === 'true' ? 1 : 0;




    const pool = await sql.connect(config);
    const request = pool.request();

    request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('InvoiceNoPrefix', sql.VarChar(255), InvoiceNoPrefix)
      .input('InvoiceNextNo', sql.BigInt, InvoiceNextNo)
      .input('InvoiceDueDate', sql.BigInt, InvoiceDueDate)
      .input('ClientAuth', sql.Bit, ClientAuths)
      .input('ClientLogin', sql.Bit, ClientLogins)
      .input('DeleteInvoices', sql.Bit, DeleteInvoiceses)
      .input('DecrementInvoice', sql.Bit, DecrementInvoices)
      .input('FilteringInvoice', sql.Bit, FilteringInvoices)
      .input('ShowsaleAgent', sql.Bit, ShowsaleAgents)
      .input('ShowProjectName', sql.Bit, ShowProjectNames)
      .input('ShowTotalPaid', sql.Bit, ShowTotalPaids)
      .input('ShowCreditApplied', sql.Bit, ShowCreditApplieds)
      .input('ShowAmountDue', sql.Bit, ShowAmountDues)
      .input('InvoiceAttachment', sql.Bit, InvoiceAttachments)
      .input('InvoiceNoFormat', sql.VarChar(sql.MAX), InvoiceNoFormat)
      .input('PredefinedClientNote', sql.VarChar(sql.MAX), PredefinedClientNote)
      .input('PredefinedTC', sql.VarChar(sql.MAX), PredefinedTC)
      .input('CreatedBy', sql.Int, CreatedBy);

    const result = await request.execute('InsertFinanceInvoice');

    if (result.returnValue === 0) {
      res.status(201).json({ message: 'Data inserted or updated successfully' });
    } else {
      res.status(500).json({ error: 'Error inserting or updating data' });
    }
  } catch (err) {
    console.error('Error processing the request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/SelectFinanceInvoices', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('EXEC upcloudglobal.SelectFinanceInvoices');

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error processing the request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/selectFinanceInvoicesBYID', async (req, res) => {
  try {
    const pool = await sql.connect(config);

    const request = new sql.Request(pool);
    const deafaultvar = req.body.deafaultvar || 0; // Default value if not provided

    const result = await request
      .input('Deafaultvar', sql.Int, deafaultvar)
      .execute('[upcloudglobal].[SelectFinanceInvoices]');

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
// finace tab api ending here  invoice 

// Finance api ending here 



// finace tabs credit notes api starting here

router.post('/InsertFinanceCreditNote', async (req, res) => {
  console.log(req.body);
  try {
    const {
      Deafaultvar,
      CreditNoteNoPrefix,
      NextCreditNo,
      FormatCreditNo,
      DecrCreditNo,
      ShowProjectName,
      PredefinedClientNote,
      PredefinedTC,
      CreatedBy
    } = req.body;


    const DecrCreditNos = DecrCreditNo === 'true' ? 1 : 0;
    const ShowProjectNames = ShowProjectName === 'true' ? 1 : 0;
 

    const pool = await sql.connect(config);
    const request = pool.request();

    request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('CreditNoteNoPrefix', sql.VarChar(255), CreditNoteNoPrefix)
      .input('NextCreditNo', sql.BigInt, NextCreditNo)
      .input('FormatCreditNo', sql.VarChar(550), FormatCreditNo)
      .input('DecrCreditNo', sql.Bit, DecrCreditNos)
      .input('ShowProjectName', sql.Bit, ShowProjectNames)
      .input('PredefinedClientNote', sql.VarChar(sql.MAX), PredefinedClientNote)
      .input('PredefinedTC', sql.VarChar(sql.MAX), PredefinedTC)
      .input('CreatedBy', sql.Int,  CreatedBy);

    const result = await request.execute('InsertFinanceCreditNote');

    if (result.returnValue === 0) {
      res.status(201).json({ message: 'Data inserted or updated successfully' });
    } else {
      res.status(500).json({ error: 'Error inserting or updating data' });
    }
  } catch (err) {
    console.error('Error processing the request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/SelectfinanceCredit', async (req, res) => {
  try {
    // Connect to the database
    const pool = await sql.connect(config);

    // Execute the stored procedure
    const result = await pool.request().query('EXEC upcloudglobal.SelectfinanceCredit');

    // Send the result as JSON
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error processing the request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/selectFinanceCreditBYID', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const { Deafaultvar } = req.body;

    const result = await pool.request()
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .query('EXEC upcloudglobal.SelectfinanceCredit @Deafaultvar');

    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// estimates api starting here 



router.post('/insertFinanceEstimate', async (req, res) => {
  console.log(req.body)
  try {
    const pool = await sql.connect(config);

    const {
      Deafaultvar,
      EstimateNoPrefix,
      EstimateNextNo,
      EstimateDueDate,
      DeleteEstimate,
      DecrEstimate,
      ClientAuth,
      ClientLogin,
      ShowSaleEstimate,
      ShowProjectEstimate,
      AutoConvEstimate,
      ExcludeDraftEstimate,
      EstimateNoFormat,
      PipelineLimitPerStatus,
      DefaultPipelineSort,
      DefaultSortAlternating,
      PredefinedClientNote,
      PredefinedTC,
      CreatedBy
    } = req.body;

    const result = await pool.request()
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('EstimateNoPrefix', sql.VarChar(255), EstimateNoPrefix)
      .input('EstimateNextNo', sql.BigInt, EstimateNextNo)
      .input('EstimateDueDate', sql.BigInt, EstimateDueDate)
      .input('DeleteEstimate', sql.Bit, DeleteEstimate)
      .input('DecrEstimate', sql.Bit, DecrEstimate)
      .input('ClientAuth', sql.Bit, ClientAuth)
      .input('ClientLogin', sql.Bit, ClientLogin)
      .input('ShowSaleEstimate', sql.Bit, ShowSaleEstimate)
      .input('ShowProjectEstimate', sql.Bit, ShowProjectEstimate)
      .input('AutoConvEstimate', sql.Bit, AutoConvEstimate)
      .input('ExcludeDraftEstimate', sql.Bit, ExcludeDraftEstimate)
      .input('EstimateNoFormat', sql.VarChar(55), EstimateNoFormat)
      .input('PipelineLimitPerStatus', sql.BigInt, PipelineLimitPerStatus)
      .input('DefaultPipelineSort', sql.VarChar(55), DefaultPipelineSort)
      .input('DefaultSortAlternating', sql.VarChar(55), DefaultSortAlternating)
      .input('PredefinedClientNote', sql.VarChar(sql.MAX), PredefinedClientNote)
      .input('PredefinedTC', sql.VarChar(sql.MAX), PredefinedTC)
      .input('CreatedBy', sql.Int, CreatedBy)
      .execute('InsertFinanceEstimate');

    res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});





router.get('/selectFinanceEstimates', async (req, res) => {
  // try {
  //   const pool = await sql.connect(config);
  //   const result = await pool.request().execute('upcloudglobal.SelectFinanceEstimates');
    
  //   res.json({ success: true, data: result.recordset });
  // } catch (err) {
  //   console.error(err);
  //   res.status(500).json({ success: false, error: 'Internal Server Error' });
  // }

  try {
    // Connect to the database
    const pool = await sql.connect(config);

    // Execute the stored procedure
    const result = await pool.request().execute('upcloudglobal.SelectFinanceEstimates');

    // Send the result as JSON
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error processing the request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }






});

router.get('/selectFinanceEstimatesBYID', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const { Deafaultvar } = req.body;

    const result = await pool
      .request()
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .query('EXEC upcloudglobal.SelectFinanceEstimates @Deafaultvar');

    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


// estimates api ending here 


// proposals api starting here 
router.post('/insertFinanceProposals', async (req, res) => {
  try {
    const pool = await sql.connect(config);

    const {
      Deafaultvar,
      ProposalNoPrefix,
      ProposalDueDays,
      PipelineLimitStatus,
      DefaultPipelineSort,
      DefaultSortAlter,
      ShowProjectProposal,
      FilterProposal,
      ClientAuthProposal,
      ProposalFormat,
      CreatedBy
    } = req.body;


    const ShowProjectProposals = ShowProjectProposal === 'true' ? 1 : 0;
    const FilterProposals = FilterProposal === 'true' ? 1 : 0;
    const ClientAuthProposals = ClientAuthProposal === 'true' ? 1 : 0;

    const result = await pool.request()
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('ProposalNoPrefix', sql.VarChar(55), ProposalNoPrefix)
      .input('ProposalDueDays', sql.BigInt, ProposalDueDays)
      .input('PipelineLimitStatus', sql.BigInt, PipelineLimitStatus)
      .input('DefaultPipelineSort', sql.VarChar(55), DefaultPipelineSort)
      .input('DefaultSortAlter', sql.VarChar(55), DefaultSortAlter)
      .input('ShowProjectProposal', sql.Bit, ShowProjectProposals)
      .input('FilterProposal', sql.Bit, FilterProposals)
      .input('ClientAuthProposal', sql.Bit, ClientAuthProposals)
      .input('ProposalFormat', sql.VarChar(sql.MAX), ProposalFormat)
      .input('CreatedBy', sql.Int, CreatedBy)

      .execute('InsertFinanceProposals');

    res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


// router.get('/selectFinanceProposalsBYID', async (req, res) => {
//   try {
//     const pool = await sql.connect(config);
//     const result = await pool.request().query('EXEC upcloudglobal.SelectFinanceProposals');
    
//     res.json({ success: true, data: result.recordset });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, error: 'Internal Server Error' });
//   }
// });

router.get('/selectFinanceProposals', async (req, res) => {
 try {
    // Connect to the database
    const pool = await sql.connect(config);

    // Execute the stored procedure
    const result = await pool.request().execute('upcloudglobal.SelectFinancePropTable');

    // Send the result as JSON
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error processing the request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }






});



// proposals api ending here 


router.get('/financeproposalsBYID', async (req, res) => {
  try {
    const pool = await sql.connect(config);

    const request = new sql.Request(pool);
    const defaultVar = req.query.defaultVar || 0; // Default value if not provided

    const result = await request
      .input('Deafaultvar', sql.Int, defaultVar)
      .execute('[upcloudglobal].[SelectFinanceProposals]');

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


// finace tabs credit notes api ending here 



// Subscriptions api starting here 

router.post('/insertSubscriptions', async (req, res) => {
  try {
    const pool = await sql.connect(config);

    const {
      Deafaultvar,
      ShowSubscriptions,
      AfterSubscriptions,
      CreatedBy
    } = req.body;
    const ShowSubscriptionses = ShowSubscriptions === 'true' ? 1 : 0;


    const result = await pool.request()
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('ShowSubscriptions', sql.Bit, ShowSubscriptionses)
      .input('AfterSubscriptions', sql.VarChar(55), AfterSubscriptions)
      .input('CreatedBy', sql.Int, CreatedBy)

      .execute('upcloudglobal.InsertSubscriptions');

    res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.get('/GetAllSubscriptions', async (req, res) => {
  try {
     // Connect to the database
     const pool = await sql.connect(config);
 
     // Execute the stored procedure
     const result = await pool.request().execute('upcloudglobal.GetSubscriptions');
 
     // Send the result as JSON
     res.status(200).json(result.recordset);
   } catch (err) {
     console.error('Error processing the request:', err);
     res.status(500).json({ error: 'Internal Server Error' });
   }
 
 
 
 
 
 
 });

router.get('/subscriptionsGETBYID', async (req, res) => {
  try {
    const pool = await sql.connect(config);

    const defaultVar = req.query.defaultVar || 0; // Default value if not provided

    const request = new sql.Request(pool);

    const result = await request
      .input('Deafaultvar', sql.Int, defaultVar)
      .execute('[upcloudglobal].[SelectSubscriptions]');

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
// Subscriptions api ending here 
// setting api ending here 
// setting api ending here 


// paymentgetway api starting here 

router.post('/paymentgatewayGeneral', async (req, res) => {
  console.log(req.body);
  try {
    const pool = await sql.connect(config);

    const {
      Deafaultvar,
      PaymentAlert,
      CustomerAuth
    } = req.body;

    const result = await pool.request()

    
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('PaymentAlert', sql.Bit, PaymentAlert)
      .input('CustomerAuth', sql.Bit, CustomerAuth)
      .execute('[upcloudglobal].[InsertPayGateWayGeneral]');

      res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
// paymentgetway api ending here 



// customer api starting here








router.post('/Settingscustomers', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();

    const {
      Deafaultvar,
      DefaultCustTheme,
      DefaultCountry,
       CompanyField,
      CompanyVATNo,
      CustomerRegister,
      CustomerRegConfirmation,
      CustomerContacts,
      SpamValidation,
      CustomerAuth,
      CustomerProfileFiles,
      CustomerDelete,
      UtilizeCustomer,
      UnrestrictAccess,
      ShowEstimate,
      DefaultContact,
      CustomerInfo,
      CreatedBy,
    } = req.body;

    const CompanyFields = CompanyField === 'true' ? 1 : 0;
    const CompanyVATNos = CompanyVATNo === 'true' ? 1 : 0;
    const CustomerRegisters = CustomerRegister === 'true' ? 1 : 0;
    const CustomerRegConfirmations = CustomerRegConfirmation === 'true' ? 1 : 0;
    const CustomerContactss = CustomerContacts === 'true' ? 1 : 0;
    const SpamValidations = SpamValidation === 'true' ? 1 : 0;
    const CustomerAuths = CustomerAuth === 'true' ? 1 : 0;
    const CustomerProfileFiless = CustomerProfileFiles === 'true' ? 1 : 0;
    const CustomerDeletes = CustomerDelete === 'true' ? 1 : 0;
    const UtilizeCustomers = UtilizeCustomer === 'true' ? 1 : 0;
    const UnrestrictAccesss = UnrestrictAccess === 'true' ? 1 : 0;
  



    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('DefaultCustTheme', sql.VarChar(255), DefaultCustTheme)
      .input('DefaultCountry', sql.VarChar(255), DefaultCountry)
   
      .input('CompanyField', sql.Bit, CompanyFields)
      .input('CompanyVATNo', sql.Bit, CompanyVATNos)
      .input('CustomerRegister', sql.Bit, CustomerRegisters)
      .input('CustomerRegConfirmation', sql.Bit, CustomerRegConfirmations)
      .input('CustomerContacts', sql.Bit, CustomerContactss)
      .input('SpamValidation', sql.Bit, SpamValidations)
      .input('CustomerAuth', sql.Bit, CustomerAuths)
      .input('CustomerProfileFiles', sql.Bit, CustomerProfileFiless)
      .input('CustomerDelete', sql.Bit, CustomerDeletes)
      .input('UtilizeCustomer', sql.Bit, UtilizeCustomers)
      .input('UnrestrictAccess', sql.Bit, UnrestrictAccesss)
      .input('ShowEstimate', sql.VarChar(55), ShowEstimate)
      .input('DefaultContact', sql.VarChar(55), DefaultContact)
      .input('CustomerInfo', sql.VarChar(sql.MAX), CustomerInfo)
      .input('CreatedBy', sql.Int, CreatedBy)

      .execute('upcloudglobal.InsertCustomers');

      res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});





router.get('/SettingscustomersGetAll', async (req, res) => {
  try {
     // Connect to the database
     const pool = await sql.connect(config);
 
     // Execute the stored procedure
     const result = await pool.request().execute('upcloudglobal.GetAllCustomers');
 
     // Send the result as JSON
     res.status(200).json(result.recordset);
   } catch (err) {
     console.error('Error processing the request:', err);
     res.status(500).json({ error: 'Internal Server Error' });
   }
 
 
 
 
 
 
 });






router.get('/customersGETbyid', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const Deafaultvar = req.body.Deafaultvar;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .execute('upcloudglobal.SelectCustomers');

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});

// customer api ending here 


// setting Task api starting here 
router.post('/Settingstasks', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();

    const {
      Deafaultvar,
      LimitTask,
      AllowStaff,
      AllowCustomer,
      AssignTask,
      AutoAddCreator,
      StopTimerOnNewTimer,
      TimeStartProgress,
      BillableCheck,
      RoundOffTimer,
      RoundOffTaskMultiOf,
      DefaultStatus,
      DefaultPriority,
      ModalWidthClass,
      CreatedBy
    } = req.body;
    const AllowStaffs = AllowStaff === 'true' ? 1 : 0;
    const AllowCustomers = AllowCustomer === 'true' ? 1 : 0;
    const AssignTasks = AssignTask === 'true' ? 1 : 0;
    const AutoAddCreators = AutoAddCreator === 'true' ? 1 : 0;
    const StopTimerOnNewTimers = StopTimerOnNewTimer === 'true' ? 1 : 0;
    const TimeStartProgresss = TimeStartProgress === 'true' ? 1 : 0;
    const BillableChecks = BillableCheck === 'true' ? 1 : 0;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('LimitTask', sql.BigInt, LimitTask)
      .input('AllowStaff', sql.Bit, AllowStaffs)
      .input('AllowCustomer', sql.Bit, AllowCustomers)
      .input('AssignTask', sql.Bit, AssignTasks)
      .input('AutoAddCreator', sql.Bit, AutoAddCreators)
      .input('StopTimerOnNewTimer', sql.Bit, StopTimerOnNewTimers)
      .input('TimeStartProgress', sql.Bit, TimeStartProgresss)
      .input('BillableCheck', sql.Bit, BillableChecks)
      .input('RoundOffTimer', sql.VarChar(55), RoundOffTimer)
      .input('RoundOffTaskMultiOf', sql.VarChar(55), RoundOffTaskMultiOf)
      .input('DefaultStatus', sql.VarChar(55), DefaultStatus)
      .input('DefaultPriority', sql.VarChar(55), DefaultPriority)
      .input('ModalWidthClass', sql.VarChar(55), ModalWidthClass)
      .input('CreatedBy', sql.Int, CreatedBy)

      .execute('upcloudglobal.InsertTask');


      res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});

router.get('/TasksGetAllDataBYID', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const Deafaultvar = req.body.Deafaultvar;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .execute('upcloudglobal.SelectTasks');

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});


router.get('/TasksGetAllData', async (req, res) => {
  try {
     // Connect to the database
     const pool = await sql.connect(config);
 
     // Execute the stored procedure
     const result = await pool.request().execute('upcloudglobal.GetAllTasks');
 
     // Send the result as JSON
     res.status(200).json(result.recordset);
   } catch (err) {
     console.error('Error processing the request:', err);
     res.status(500).json({ error: 'Internal Server Error' });
   }
 
 
 
 
 
 
 });



// setting Task api ending here 



// setting  Support api starting here 
// setting  Support api starting here 
// setting  Support api starting here 
// setting  Support api starting here 

// support general tab api starting here 
router.post('/SupportGeneral', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();

    const {
      Deafaultvar,
      UseServices,
      AllowStaffDepart,
      NotifyAssigneeOnly,
      TicketNotification,
      CustReplyNotification,
      StaffOpenTickets,
      AutoAssignTickets,
      NotStaffTicketAccess,
      NonAdminDelAttachments,
      CustChangeStatus,
      LimitToLoggedContact,
      TicketReplyOrder,
      EnableSupportBadge,
      DefaultReplyStatus,
      MaxTickets,
      AllowFileExtensions,
      CreatedBy
    } = req.body;

    const UseServicess = UseServices === 'true' ? 1 : 0;
    const AllowStaffDeparts = AllowStaffDepart === 'true' ? 1 : 0;
    const NotifyAssigneeOnlys = NotifyAssigneeOnly === 'true' ? 1 : 0;
    const TicketNotifications = TicketNotification === 'true' ? 1 : 0;
    const CustReplyNotifications = CustReplyNotification === 'true' ? 1 : 0;
    const StaffOpenTicketss = StaffOpenTickets === 'true' ? 1 : 0;
    const AutoAssignTicketss = AutoAssignTickets === 'true' ? 1 : 0;
    const NotStaffTicketAccesss = NotStaffTicketAccess === 'true' ? 1 : 0;
    const NonAdminDelAttachmentss = NonAdminDelAttachments === 'true' ? 1 : 0;
    const CustChangeStatuss = CustChangeStatus === 'true' ? 1 : 0;
    const LimitToLoggedContacts = LimitToLoggedContact === 'true' ? 1 : 0;
    const EnableSupportBadges = EnableSupportBadge === 'true' ? 1 : 0;


    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('UseServices', sql.Bit, UseServicess)
      .input('AllowStaffDepart', sql.Bit, AllowStaffDeparts)
      .input('NotifyAssigneeOnly', sql.Bit, NotifyAssigneeOnlys)
      .input('TicketNotification', sql.Bit, TicketNotifications)
      .input('CustReplyNotification', sql.Bit, CustReplyNotifications)
      .input('StaffOpenTickets', sql.Bit, StaffOpenTicketss)
      .input('AutoAssignTickets', sql.Bit, AutoAssignTicketss)
      .input('NotStaffTicketAccess', sql.Bit, NotStaffTicketAccesss)
      .input('NonAdminDelAttachments', sql.Bit, NonAdminDelAttachmentss)
      .input('CustChangeStatus', sql.Bit, CustChangeStatuss)
      .input('LimitToLoggedContact', sql.Bit, LimitToLoggedContacts)
      .input('TicketReplyOrder', sql.VarChar(255), TicketReplyOrder)
      .input('EnableSupportBadge', sql.Bit, EnableSupportBadges)
      .input('DefaultReplyStatus', sql.VarChar(255), DefaultReplyStatus)
      .input('MaxTickets', sql.BigInt, MaxTickets)
      .input('AllowFileExtensions', sql.VarChar(255), AllowFileExtensions)
      .input('CreatedBy', sql.Int, CreatedBy)

      .execute('InsertSupportGeneral');

      res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 

});
router.get('/supportgeneralGETById', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const Deafaultvar = req.body.Deafaultvar;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .execute('upcloudglobal.SelectSupportGeneral');

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } finally {
    sql.close();
  }
});

router.get('/SupportGeneralGetAllData', async (req, res) => {
  try {
     // Connect to the database
     const pool = await sql.connect(config);
 
     // Execute the stored procedure
     const result = await pool.request().execute('upcloudglobal.SupportGeneralGetAll');
 
     // Send the result as JSON
     res.status(200).json(result.recordset);
   } catch (err) {
     console.error('Error processing the request:', err);
     res.status(500).json({ error: 'Internal Server Error' });
   }
 
 
 
 
 
 
 });



// support general tab api starting here 


// support General Tab two Email Piping api starting here 
router.post('/supportemailpiping', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();

    const {
      Deafaultvar,
      RegisteredFlag,
      EmailRepliesOnly,
      UnquotedTicketImport,
      PipedPriority,
      CreatedBy
    } = req.body;
    const RegisteredFlags = RegisteredFlag === 'true' ? 1 : 0;
    const EmailRepliesOnlys = EmailRepliesOnly === 'true' ? 1 : 0;
    const UnquotedTicketImports = UnquotedTicketImport === 'true' ? 1 : 0;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('RegisteredFlag', sql.Bit, RegisteredFlags)
      .input('EmailRepliesOnly', sql.Bit, EmailRepliesOnlys)
      .input('UnquotedTicketImport', sql.Bit, UnquotedTicketImports)
      .input('PipedPriority', sql.VarChar(10), PipedPriority)
      .input('CreatedBy', sql.Int, CreatedBy)

      .execute('InsertSupportEmailPiping');

      res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
})

router.get('/emailpipingGetData', async (req, res) => {
  try {
     // Connect to the database
     const pool = await sql.connect(config);
 
     // Execute the stored procedure
     const result = await pool.request().execute('upcloudglobal.EmailPipingGetAllData');
 
     // Send the result as JSON
     res.status(200).json(result.recordset);
   } catch (err) {
     console.error('Error processing the request:', err);
     res.status(500).json({ error: 'Internal Server Error' });
   }
 
 
 
 
 
 
 });


router.get('/emailpipingGetDataById', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const Deafaultvar = req.body.Deafaultvar;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .execute('upcloudglobal.SelectSupportEmailPiping');

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } finally {
    sql.close();
  }
});
// support General Tab two Email Piping api ending here 


// Support tab third   Ticket Form api starting here 
router.post('/supportticketform', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();

    const {
      Deafaultvar,
      EmbedForm,
    } = req.body;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('EmbedForm', sql.VarChar(sql.MAX), EmbedForm)
      .execute('InsertSupportTicketForm');
      res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});



router.get('/supportticketformGETBYID', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const Deafaultvar = req.body.Deafaultvar;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .execute('upcloudglobal.SelectSupportTicketForm');

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});

router.get('/tablesupportticketGetAllData', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();

    const result = await request
      .execute('SelectTableSupportTicket');

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});










// Support tab third   Ticket Form api ending  here 


// setting  Support api ending here 
// setting  Support api ending here 
// setting  Support api ending here 
// setting  Support api ending here 



// Etting leads api starting here 

router.post('/Settingsleads', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();

    const {
      Deafaultvar,
      LimitLeadsStatus,
      DefaultStatus,
      DefaultSource,
      ValidateDupLead,
      AutoAdminAssign,
      StaffLeadImport,
      DefaultLeadSort,
      DefaultLeadBisort,
      NonAdminConvertLock,
      ModalWidth,
      CreatedBy
    } = req.body;
    const AutoAdminAssigns = AutoAdminAssign === 'true' ? 1 : 0;
    const StaffLeadImports = StaffLeadImport === 'true' ? 1 : 0;
    const NonAdminConvertLocks = NonAdminConvertLock === 'true' ? 1 : 0;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('LimitLeadsStatus', sql.BigInt, LimitLeadsStatus)
      .input('DefaultStatus', sql.VarChar(255), DefaultStatus)
      .input('DefaultSource', sql.VarChar(255), DefaultSource)
      .input('ValidateDupLead', sql.VarChar(255), ValidateDupLead)
      .input('AutoAdminAssign', sql.Bit, AutoAdminAssigns)
      .input('StaffLeadImport', sql.Bit, StaffLeadImports)
      .input('DefaultLeadSort', sql.VarChar(255), DefaultLeadSort)
      .input('DefaultLeadBisort', sql.VarChar(255), DefaultLeadBisort)
      .input('NonAdminConvertLock', sql.Bit, NonAdminConvertLocks)
      .input('ModalWidth', sql.VarChar(55), ModalWidth)
      .input('CreatedBy', sql.Int, CreatedBy)

      .execute('InsertLeads');

      res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});

router.get('/leadsGetAllData', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();

    const result = await request
      .execute('SelectTableLeads');

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});

router.get('/leadsGetById', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const Deafaultvar = req.body.Deafaultvar;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .execute('upcloudglobal.SelectLeads');

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});

// Settings leads api ending here 



// Setting  Clander api starting here 
// Setting  Clander api starting here 
// Setting  Clander api starting here 
// Setting  Clander api starting here 


// Calender tab General   api starting here 
router.post('/Settingscalendar', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();

    const {
      Deafaultvar,
      CalendarLimit,
      DefaultView,
      FirstDay,
      HideCalendarReminder,
      LeadReminder,
      CustomerReminder,
      EstimateReminder,
      InvoiceReminder,
      ProposalReminder,
      ExpensesReminder,
      TaskReminder,
      CreditNoteReminder,
      TicketReminder,
      Invoices,
      Estimates,
      Proposal,
      Contracts,
      Task,
      LoggedInStaff,
      Project,
      CreatedBy
    } = req.body;

    const HideCalendarReminders = HideCalendarReminder === 'true' ? 1 : 0;
    const LeadReminders = LeadReminder === 'true' ? 1 : 0;
    const CustomerReminders = CustomerReminder === 'true' ? 1 : 0;
    const EstimateReminders = EstimateReminder === 'true' ? 1 : 0;
    const InvoiceReminders = InvoiceReminder === 'true' ? 1 : 0;
    const ProposalReminders = ProposalReminder === 'true' ? 1 : 0;
    const ExpensesReminders = ExpensesReminder === 'true' ? 1 : 0;
    const TaskReminders = TaskReminder === 'true' ? 1 : 0;
    const CreditNoteReminders = CreditNoteReminder === 'true' ? 1 : 0;
    const TicketReminders = TicketReminder === 'true' ? 1 : 0;
    const Invoicess = Invoices === 'true' ? 1 : 0;
    const Estimatess = Estimates === 'true' ? 1 : 0;
    const Proposals = Proposal === 'true' ? 1 : 0;
    const Contractss = Contracts === 'true' ? 1 : 0;
    const Tasks = Task === 'true' ? 1 : 0;
    const LoggedInStaffs = LoggedInStaff === 'true' ? 1 : 0;
    const Projects = Project === 'true' ? 1 : 0;


    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('CalendarLimit', sql.Int, CalendarLimit)
      .input('DefaultView', sql.VarChar(255), DefaultView)
      .input('FirstDay', sql.VarChar(255), FirstDay)
      .input('HideCalendarReminder', sql.Bit, HideCalendarReminders)
      .input('LeadReminder', sql.Bit, LeadReminders)
      .input('CustomerReminder', sql.Bit, CustomerReminders)
      .input('EstimateReminder', sql.Bit, EstimateReminders)
      .input('InvoiceReminder', sql.Bit, InvoiceReminders)
      .input('ProposalReminder', sql.Bit, ProposalReminders)
      .input('ExpensesReminder', sql.Bit, ExpensesReminders)
      .input('TaskReminder', sql.Bit, TaskReminders)
      .input('CreditNoteReminder', sql.Bit, CreditNoteReminders)
      .input('TicketReminder', sql.Bit, TicketReminders)
      .input('Invoices', sql.Bit, Invoicess)
      .input('Estimates', sql.Bit, Estimatess)
      .input('Proposal', sql.Bit, Proposals)
      .input('Contracts', sql.Bit, Contractss)
      .input('Task', sql.Bit, Tasks)
      .input('LoggedInStaff', sql.Bit, LoggedInStaffs)
      .input('Project', sql.Bit, Projects)
      .input('CreatedBy', sql.Int, CreatedBy)

      .execute('InsertCalendar')


      res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});


router.get('/calendarGetAlldata', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();

    const result = await request
      .execute('upcloudglobal.SelectTableCalendar');

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// get data by id api here Settings Calender tab General
router.get('/calendarGetAllDataByID', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const Deafaultvar = req.body.Deafaultvar;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .execute('upcloudglobal.SelectCalendar');

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } finally {
    sql.close();
  }
});

// Calender tab General api ending here 




// Calender Tab 2 Styling  api starting here 
// Calender Tab 2 Styling  api starting here 
router.post('/Settingscalendar-styling', async (req, res) => {
  console.log(req.body);
  try {
    await sql.connect(config);

    const request = new sql.Request();

    const {
      Deafaultvar,
      InvoiceColor,
      EstimateColor,
      ProposalColor,
      RemainderColor,
      ContractColor,
      ProjectColor,
      CreatedBy,
    } = req.body;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('InvoiceColor', sql.VarChar(55), InvoiceColor)
      .input('EstimateColor', sql.VarChar(55), EstimateColor)
      .input('ProposalColor', sql.VarChar(55), ProposalColor)
      .input('RemainderColor', sql.VarChar(55), RemainderColor)
      .input('ContractColor', sql.VarChar(55), ContractColor)
      .input('ProjectColor', sql.VarChar(55), ProjectColor)
      .input('CreatedBy', sql.Int, CreatedBy)
      .execute('InsertCalendarStyling');
      

      res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});



router.get('/calendar-stylingGetAllData', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();

    const result = await request
      .execute('upcloudglobal.SelectTableCalendarStyling');

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});

router.get('/calendar-stylingGetDataByID', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const Deafaultvar = req.body.Deafaultvar;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .execute('upcloudglobal.SelectCalendarStyling');

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});



// Calender Tab 2 Styling  api ending here 
// Calender Tab 2 Styling  api ending here 

// Setting  Clander api ending here 
// Setting  Clander api ending here 
// Setting  Clander api ending here 
// Setting  Clander api ending here 







// PDF api starting here 
// PDF api starting here 
// PDF api starting here 
// PDF api starting here 

// pdf tab one GENERAL api starting here 

router.post('/InsertPDFGeneral', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();

    const {
      Deafaultvar,
      PDFFont,
      CustomerDetails,
      DefaultFontSize,
      ItemTableHeadingColor,
      ItemTableTextColor,
      CompanyLogoURL,
      LogoWidth,
      ShowInvoices,
      ShowPayInvoices,
      ShowInvoicesTransaction,
      ShowPageNO,
    } = req.body;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('PDFFont', sql.VarChar(255), PDFFont)
      .input('CustomerDetails', sql.Bit, CustomerDetails)
      .input('DefaultFontSize', sql.BigInt, DefaultFontSize)
      .input('ItemTableHeadingColor', sql.VarChar(255), ItemTableHeadingColor)
      .input('ItemTableTextColor', sql.VarChar(255), ItemTableTextColor)
      .input('CompanyLogoURL', sql.VarChar(255), CompanyLogoURL)
      .input('LogoWidth', sql.BigInt, LogoWidth)
      .input('ShowInvoices', sql.Bit, ShowInvoices)
      .input('ShowPayInvoices', sql.Bit, ShowPayInvoices)
      .input('ShowInvoicesTransaction', sql.Bit, ShowInvoicesTransaction)
      .input('ShowPageNO', sql.Bit, ShowPageNO)
      .execute('[upcloudglobal].[InsertPDFGeneral]');

    res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.get('/SelectTablePDFGeneral', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const result = await request.query('[upcloudglobal].[SelectTablePDFGeneral]');

    res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


router.get('/SelectPDFGeneralGetByID', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const Deafaultvar = req.body.Deafaultvar;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .query('SELECT * FROM PDFGeneral WHERE Id = @Deafaultvar');

    res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
// pdf tab one GENERAL api ending here 



// pdf tab second Signature api starting here 
router.post('/InsertPDFSignature', upload.single('SignatureImage'), async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();

    const {
      Deafaultvar,
      InvoicePDFSign,
      EstimatePDFSign,
      CreditNotePDFSign,
      ContractPDFSign,
      ProposalPDFSign,
    } = req.body;

    const SignatureImage = req.file ? req.file.buffer : null;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('InvoicePDFSign', sql.Bit, InvoicePDFSign)
      .input('EstimatePDFSign', sql.Bit, EstimatePDFSign)
      .input('CreditNotePDFSign', sql.Bit, CreditNotePDFSign)
      .input('ContractPDFSign', sql.Bit, ContractPDFSign)
      .input('ProposalPDFSign', sql.Bit, ProposalPDFSign)
      .input('SignatureImage', sql.VarBinary(sql.MAX), SignatureImage)
      .execute('[upcloudglobal].[InsertPDFSignature]');

    res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.get('/SelectPDFSignature', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const result = await request.query('[upcloudglobal].[SelectPDFSignature]');

    res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



router.get('/SelectPDFSignatureById', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const Deafaultvar = req.body.Deafaultvar;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .execute('upcloudglobal.SelectIDPDFSignature');

      res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});


// pdf tab second Signature api ending here 



// pdf tab third  Documents format api starting here


router.post('/InsertPDFDocumentFormat', async (req, res) => {
  try {
    await sql.connect(config);

    const {
      Deafaultvar,
      Invoice,
      Estimate,
      Proposal,
      Payment,
      CreditNote,
      Contract,
      Statement,
    } = req.body;

    const request = new sql.Request();
    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('Invoice', sql.VarChar(60), Invoice)
      .input('Estimate', sql.VarChar(60), Estimate)
      .input('Proposal', sql.VarChar(55), Proposal)
      .input('Payment', sql.VarChar(55), Payment)
      .input('CreditNote', sql.VarChar(55), CreditNote)
      .input('Contract', sql.VarChar(55), Contract)
      .input('Statement', sql.VarChar(55), Statement)
      .execute('InsertPDFDocumentFormat');

    res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  } 
});


router.get('/SelectPDFDocumentFormat', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const result = await request.query('[upcloudglobal].[SelectPDFDocumentFormat]');

    res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


router.get('/SelectPDFDocumentFormatBYID', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const Deafaultvar = req.body.Deafaultvar;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .execute('upcloudglobal.SelectIdPDFDocFormat');

      res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});
// pdf tab third  Documents format api ending here


// PDF api ending here 
// PDF api ending here 
// PDF api ending here 
// PDF api ending here 


// Setting E-Sign api starting here 

router.post('/SettingInsertESign', async (req, res) => {
  try {
    await sql.connect(config);

    const {
      Deafaultvar,
      Proposal,
      Estimate,
      LegalBoundText
    } = req.body;

    const request = new sql.Request();
    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('Proposal', sql.Bit, Proposal)
      .input('Estimate', sql.Bit, Estimate)
      .input('LegalBoundText', sql.NVarChar(sql.MAX), LegalBoundText)
      .execute('InsertESign');

    res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  } 
});

router.get('/SelectE-Sign', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const result = await request.query('[upcloudglobal].[SelectESign]');

    res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


router.get('/SelectE-SignById', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const Deafaultvar = req.body.Deafaultvar;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .execute('upcloudglobal.SelectIDESign');

      res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});

// Setting E-Sign api starting ending



// setting MISC starting here 
// setting MISC starting here 
// setting MISC starting here 
// setting MISC starting here 
// setting MISC starting here 

// setting Misc tab first (Misc) api starting here 

router.post('/SettingInsertMISC', async (req, res) => {
 
  try {
    await sql.connect(config);

    const {
      Deafaultvar,
      ClientLoggedIn,
      DropBoxAPPKey,
      MaxFileMedia,
      MaxFilePost,
      LimitTopSearch,
      // DefaultStaff,
      DeleteSystem,
      ShowSetpMenu,
      ShowHelpMenu,
      MinifiedFile,
    } = req.body;

    const request = new sql.Request();
    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('ClientLoggedIn', sql.Bit, ClientLoggedIn)
      .input('DropBoxAPPKey', sql.VarChar(255), DropBoxAPPKey)
      .input('MaxFileMedia', sql.BigInt, MaxFileMedia)
      .input('MaxFilePost', sql.BigInt, MaxFilePost)
      .input('LimitTopSearch', sql.BigInt, LimitTopSearch)
      // .input('DefaultStaff', sql.VarChar(55), DefaultStaff)
      .input('DeleteSystem', sql.BigInt, DeleteSystem)
      .input('ShowSetpMenu', sql.Bit, ShowSetpMenu)
      .input('ShowHelpMenu', sql.Bit, ShowHelpMenu)
      .input('MinifiedFile', sql.Bit, MinifiedFile)
      .execute('InsertMISC');

    res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  } 
});

router.get('/SelectInsertMISC', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const result = await request.query('[upcloudglobal].[SelectMISC]');

    res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


router.get('/SelectMISCById', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const Deafaultvar = req.body.Deafaultvar;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .execute('upcloudglobal.SelectIDMISC');

      res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});



// setting  Misc Misc tab first (Misc)  api ending here 



// setting tab Second (Tables) api starting here 
router.post('/InsertMISCTable', async (req, res) => {
  try {
    await sql.connect(config);

    const {
      Deafaultvar,
      SaveLastOrder,
      ShowTable,
      TablePageLimit,
    } = req.body;

    const request = new sql.Request();
    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('SaveLastOrder', sql.Bit, SaveLastOrder)
      .input('ShowTable', sql.VarChar(sql.MAX), ShowTable)
      .input('TablePageLimit', sql.BigInt, TablePageLimit)
      .execute('[upcloudglobal].[InsertMISCTable]');

    res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  } 
});


router.get('/SelectMISCTable', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const result = await request.query('[upcloudglobal].[SelectMISCTable]');

    res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


router.get('/SelectMISCTableById', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const Deafaultvar = req.body.Deafaultvar;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .execute('upcloudglobal.SelectIDMISCTable');

      res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});


// setting tab Second (Tables) api ending here 



// setting TAB Third (inline-create)  api starting here 


router.post('/InsertMISCInlineCreate', async (req, res) => {
  try {
    await sql.connect(config);

    const {
      Deafaultvar,
      CreateLeadStatus,
      CreateLeadSource,
      CreateCustGroup,
      CreateService,
      SavePreReply,
      CreateContractType,
      CreateExpenseCateg,
    } = req.body;

    const request = new sql.Request();
    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .input('CreateLeadStatus', sql.Bit, CreateLeadStatus)
      .input('CreateLeadSource', sql.Bit, CreateLeadSource)
      .input('CreateCustGroup', sql.Bit, CreateCustGroup)
      .input('CreateService', sql.Bit, CreateService)
      .input('SavePreReply', sql.Bit, SavePreReply)
      .input('CreateContractType', sql.Bit, CreateContractType)
      .input('CreateExpenseCateg', sql.Bit, CreateExpenseCateg)
      .execute('InsertMISCInlineCreate');

    res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  } 
});

router.get('/SelectMISCInlineCreate', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const result = await request.query('[upcloudglobal].[SelectMISCInlineCreate]');

    res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


router.get('/SelectMISCInlineById', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const Deafaultvar = req.body.Deafaultvar;

    const result = await request
      .input('Deafaultvar', sql.Int, Deafaultvar)
      .execute('upcloudglobal.SelectMISCIDInline');

      res.json({ success: true, result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});



// router.post('/login', async (req, res) => {
//   console.log(req.body)
//   const {UserId, InputEmail, InputPassword} = req.body;

//   try {
//     const pool = await sql.connect(config);
//     const request = pool.request();

 
//     await request
//   .input('UserId', sql.Int, UserId)
//   // .input('UserId',  sql.Int, UserId)
//   .input('InputEmail', sql.VarChar(255), InputEmail)
//   .input('InputPassword',  sql.VarChar(255), InputPassword)
  
//   .execute('CheckLogin');
//   // .execute('[upcloudglobal].[InsertIntoCRMRole]');



//     console.log('SQL query executed successfully.');

//     res.status(201).json({ message: 'Registration inserted successfully' });
//   } catch (error) {
//     console.error('Error inserting registration data:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });






// router.post('/insertProfileData', async (req, res) => {
//   console.log(req.body);
//   const {
//     DefaultVar,
//     ProfileImage,
//     FirstName,
//     LastName,
//     Email,
//     HourlyRate,
//     Phone,
//     Username,
//     UsernameId,
//     Password,
//     Role,
//     Department,
//     DisplayStatus,
//     AccountStatus,
//   } = req.body;

//   try {
//     // Connect to the database
//     const pool = await sql.connect(config);
//     const request = pool.request();

//     // Convert base64-encoded ProfileImage to Buffer
//     const profileImageBuffer = Buffer.from(ProfileImage, 'base64');

//     // Provide input parameters to the stored procedure
//     request.input('DefaultVar', sql.Int, DefaultVar);
//     request.input('ProfileImage', sql.VarBinary(sql.MAX), profileImageBuffer);
//     request.input('FirstName', sql.NVarChar(50), FirstName);
//     request.input('LastName', sql.NVarChar(50), LastName);
//     request.input('Email', sql.NVarChar(100), Email);
//     request.input('HourlyRate', sql.Decimal(10, 2), HourlyRate);
//     request.input('Phone', sql.VarChar(255), Phone);
//     request.input('Username', sql.NVarChar(50), Username);
//     request.input('UsernameId', sql.Int, UsernameId);
//     request.input('Password', sql.NVarChar(50), Password);
//     request.input('Role', sql.Int, Role);
//     request.input('Department', sql.Int, Department);
//     request.input('DisplayStatus', sql.Int, DisplayStatus);
//     request.input('AccountStatus', sql.Int, AccountStatus);

//     // Execute the stored procedure
//     const result = await request.execute('InsertDataIntoTables');

//     console.log('Stored procedure executed successfully.');

//     res.status(201).json({ message: 'Data inserted or updated successfully' });
//   } catch (error) {
//     console.error('Error executing stored procedure:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

router.post('/insertProfileData', upload.single('ProfileImage'), async (req, res) => {
  console.log(req.body);

  const {
    DefaultVar,
    FirstName,
    LastName,
    Email,
    HourlyRate,
    Phone,
    Password,
    Role,
    Department,
    DisplayStatus,
    AccountStatus,
    CreatedBy,
    CreatedById,
    DefaultLanguage,
    Direction
  } = req.body;

  try {
    // Connect to the database
    const pool = await sql.connect(config);
    const request = pool.request();

    // Extract file buffer from req.file
    const { buffer } = req.file || {};
    
    // Provide input parameters to the stored procedure
    request.input('DefaultVar', sql.Int, DefaultVar);
    request.input('ProfileImage', sql.VarBinary(sql.MAX), buffer || null); // Use null if buffer is not defined
    request.input('FirstName', sql.NVarChar(50), FirstName);
    request.input('LastName', sql.NVarChar(50), LastName);
    request.input('Email', sql.NVarChar(100), Email);
    request.input('HourlyRate', sql.Decimal(10, 2), HourlyRate);
    request.input('Phone', sql.VarChar(255), Phone);    
    request.input('Password', sql.NVarChar(50), Password);
    request.input('Role', sql.Int, Role);
    request.input('Department', sql.Int, Department);
    request.input('DisplayStatus', sql.Int, DisplayStatus);
    request.input('AccountStatus', sql.Int, AccountStatus);
    request.input('CreatedBy', sql.NVarChar(50), CreatedBy);
    request.input('CreatedById', sql.Int, CreatedById);
    request.input('DefaultLanguage', sql.VarChar(50), DefaultLanguage);
    request.input('Direction', sql.VarChar(50), Direction);

    // Execute the stored procedure
    const result = await request.execute('InsertDataIntoTables');

    console.log('Stored procedure executed successfully.');

    res.status(201).json({ message: 'Data inserted or updated successfully' });
  } catch (error) {
    console.error('Error executing stored procedure:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});











// setting TAB Third (inline-create)  api ending here 


// setting MISC ending here 
// setting MISC ending here 
// setting MISC ending here 
// setting MISC ending here 
// setting MISC ending here 


// login api starting here 
// login api starting here 
router.post('/login', async (req, res) => {
  const { InputEmail, InputPassword } = req.body;

  try {
    // Connect to the database
    const pool = await sql.connect(config);
    const request = pool.request();

    // Provide input parameters to the stored procedure
    request.input('InputEmail', sql.VarChar(255), InputEmail);
    request.input('InputPassword', sql.VarChar(255), InputPassword);

    // Execute the stored procedure
    const result = await request.execute('CheckLogin');

    // Check if the stored procedure returned any data
    if (result.recordset.length > 0) {
      // If there is data, return it as a response
      res.status(200).json(result.recordset[0]);
    } else {
      // If no data is returned, the login credentials are invalid
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error executing CheckLogin stored procedure:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// login api ending here 
// login api ending here 


// getprofile data api starting here 
// getprofile data api starting here 


// router.post('/GetProfiledataById', async (req, res) => {
//   console.log(req.body);
//   const { LoginId } = req.body;

//   try {
//     // Connect to the database
//     await sql.connect(config);

//     // Create a new Request object
//     const request = new sql.Request();

//     // Add input parameter
//     request.input('LoginId', sql.Int, LoginId);

//     // Add output parameter
//     request.output('Message', sql.NVarChar(255));

//     // Execute the stored procedure
//     const result = await request.execute('upcloudglobal.GetLoginAndProfileDataaa');

//     // Check the output parameter for a message
//     const message = result.output.Message;

//     if (message) {
//       return res.status(401).json({ message });
//     }

//     // Send the data back to the client
//     res.json(result.recordset[0]);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   } 
// });

router.post('/GetProfiledataById', async (req, res) => {
  console.log(req.body);
  const { LoginId } = req.body;

  try {
    // Connect to the database
    const pool = await sql.connect(config);
    const request = pool.request();

    // Provide input parameters to the stored procedure
    request.input('LoginId', sql.Int, LoginId);

    // Execute the stored procedure
    const result = await request.execute('GetLoginAndProfileDataaa');
    console.log(result);

    // Check if the stored procedure returned any data
    if (result.recordset.length > 0) {
      // If there is data, return it as a response
      res.status(200).json(result.recordset[0]);
    } else {
      // If no data is returned, the login credentials are invalid
      res.status(401).json({ message: 'Try another Id' });
    }
  } catch (error) {
    console.error('Error executing GetLoginAndProfileDataaa stored procedure:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/GetProfileImageById', async (req, res) => {

  const { LoginId } = req.body;

  try {
    // Connect to the database
    const pool = await sql.connect(config);
    const request = pool.request();

    // Provide input parameters to the stored procedure
    request.input('LoginId', sql.Int, LoginId);

    // Execute the stored procedure (use the correct name)
    const result = await request.execute('GetProfileDataById');
    console.log(result);

    // Check if the stored procedure returned any data
    if (result.recordset.length > 0) {
      // If there is data, return it as a response
      res.status(200).json(result.recordset[0]);
    } else {
      // If no data is returned, the login credentials are invalid
      res.status(401).json({ message: 'Try another Id' });
    }
  } catch (error) {
    console.error('Error executing GetProfileDataById stored procedure:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/api/selectProfileandLogin', async (req, res) => {
  try {
    // Connect to the SQL Server
    await sql.connect(config);

    // Execute the stored procedure
    const result = await sql.query('GetAllProfile');

    // Send the result as JSON
    res.json(result.recordsets);

  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});


// API endpoint for inserting/updating CustomerGroup
router.post('/api/insertUpdateCustomerGroup', async (req, res) => {
  console.log(req.body);
   try {
    const pool = await sql.connect(config);
 

    const { Defaultvar, Name, CreatedBy } = req.body;

    // Call the stored procedure
    const result = await pool.request()
      .input('Deafaultvar', sql.Int, Defaultvar)
      .input('Name', sql.VarChar(255), Name)
      .input('CreatedBy', sql.Int, CreatedBy)
      .execute('upcloudglobal.InsertCustomerGroup');

    res.status(200).json({ success: true, message: 'Operation successful', result: result.recordset });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

router.get('/api/selectCustomerGroup', async (req, res) => {
  try {
    // Connect to the SQL Server
    await sql.connect(config);

    // Execute the stored procedure
    const result = await sql.query('SelectCustomerGroup');

    // Send the result as JSON
    res.json(result.recordsets);

  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
});


router.get('/api/GetByIdCustomerGroup', async (req, res) => {
  try {
    const CustomerID = req.query.CustomerID || 0;

    const result = await sql.query`[upcloudglobal].[SelectCustomerGroupID] @CustomerID = ${CustomerID}`;

    if (result.recordset.length > 0) {
      res.json(result.recordset);
    } else {
      res.status(404).json({ message: 'Record not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
router.delete('/api/deleteByIdCustomerGroup/:CustomerID', async (req, res) => {
  try {
    const CustomerID = req.params.CustomerID || 0;

    const result = await sql.query`[upcloudglobal].[DeleteCustomerGroup] @CustomerID = ${CustomerID}`;

    // Check if any rows were affected (operation successful)
    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ message: 'Record deleted successfully' });
    } else {
      res.status(200).json({ message: 'Record not found or already deleted' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});






module.exports = router;