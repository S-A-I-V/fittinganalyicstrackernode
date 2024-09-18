const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 5004;

// Enable CORS to allow requests from your React app
app.use(cors());
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: '192.168.27.143',
  user: 'saideep',
  password: 'Lenskart@123',
  database: 'PackingDispatchDB'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the MySQL database.');
});

// API endpoint to handle data entry
app.post('/api/data-entry', (req, res) => {
  const { skuId, dateOfScan, timestamp, stationId, nexsId } = req.body;
  const query = 'INSERT INTO fitting (skuId, dateOfScan, timestamp, stationId, nexsId) VALUES (?, ?, ?, ?, ?)';

  db.query(query, [skuId, dateOfScan, timestamp, stationId, nexsId], (err) => {
    if (err) {
      console.error('Error inserting data:', err.stack);
      res.status(500).send('Error inserting data');
      return;
    }
    res.status(200).send('Data inserted successfully');
  });
});

// API endpoint to check for duplicate SKU ID across all stations
app.get('/api/check-duplicate', (req, res) => {
  const { skuId } = req.query;
  const query = 'SELECT COUNT(*) AS count FROM fitting WHERE skuId = ?';

  db.query(query, [skuId], (err, results) => {
    if (err) {
      console.error('Error checking for duplicates:', err.stack);
      res.status(500).send('Error checking for duplicates');
      return;
    }
    const isDuplicate = results[0].count > 0;
    res.json({ isDuplicate });
  });
});

// API endpoint to retrieve all data
app.get('/api/data', (req, res) => {
  const query = 'SELECT * FROM fitting';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err.stack);
      res.status(500).send('Error fetching data');
      return;
    }
    res.json(results);
  });
});

// API endpoint to fetch redundant SKUs with the most recent date and timestamp
app.get('/api/redundant-skus', (req, res) => {
  const query = `
    SELECT skuId, stationId, COUNT(*) as scanCount, MAX(dateOfScan) as mostRecentDate, MAX(timestamp) as mostRecentTimestamp
    FROM fitting
    GROUP BY skuId, stationId
    HAVING scanCount > 1;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching redundant SKUs:', err.stack);
      res.status(500).send('Error fetching redundant SKUs');
      return;
    }
    res.json(results);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});