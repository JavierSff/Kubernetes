const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.get('/api', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:8080/api');
        res.send('<h1>Frontend</h1><p>Response from API: ${JSON.stringify(response.data)}</p>');
    } catch (error) {
        res.send('<h1>Frontend</h1><p>API is not available</p>');
    }   
} );
app.listen(port, () => {
    console.log('Frontend is running on port ${port}');
});