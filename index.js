const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3000;

// middlewire 
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('eco-ngc-bd server is running')
})

app.listen(port, () => {
  console.log(`eco-ngc-bd server is running on port ${port}`)
})