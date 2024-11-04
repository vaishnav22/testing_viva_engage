const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const PORT = 5000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // Respond with HTTP 200 to preflight requests
  }
  
  next();
});

// Endpoint to fetch Yammer groups
app.get('/yammer/groups', (req, res) => {
  const accessToken = req.query.accessToken;

  axios.get('https://www.yammer.com/api/v1/groups.json', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  .then(response => {
    res.json(response.data);
  })
  .catch(error => {
    console.error(error);
    res.status(500).send('Error fetching groups');
  });
});

// Endpoint to post a message to a Yammer group
app.post('/yammer/post', (req, res) => {
  const { accessToken, group_id, body, is_rich_text, message_type, title } = req.body;

  axios.post('https://www.yammer.com/api/v1/messages.json', {
    body: body,
    group_id: group_id,
    is_rich_text: is_rich_text || true,   // Default to false if not provided
    message_type: message_type || 'announcement', // Default to 'update' if not provided
    title: title || '' 
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    res.json(response.data);
  })
  .catch(error => {
    console.error(error);
    res.status(500).send('Error posting message');
  });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
