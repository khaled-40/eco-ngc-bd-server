const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000;

// middlewire 
app.use(cors());
app.use(express.json());

// kSpVG5lA7g2rvsTq
// ecoCleanDB
// mongoDB connection 
const uri = "mongodb+srv://ecoCleanDB:kSpVG5lA7g2rvsTq@cluster0.uk3n3pp.mongodb.net/?appName=Cluster0";


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// These will be set on first request
let issuesCollection, contributionCollection, usersCollection;

async function getCollections() {
    if (issuesCollection) return { issuesCollection, contributionCollection, usersCollection };

    await client.connect();

    // 🔥 Ping the admin DB to make sure connection is successful
    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB Ping Success — Connected to cluster!");

    const db = client.db('ecoCleanDB');
    issuesCollection = db.collection('issues');
    contributionCollection = db.collection('contribution');
    usersCollection = db.collection('users');
    console.log('MongoDB connected (reused on next calls)');
    return { issuesCollection, contributionCollection, usersCollection };
}

getCollections().catch(console.error);

app.get('/', (req, res) => {
  res.send('eco-ngc-bd server is running')
})

// app.get("/test-insert", async (req, res) => {
//     const { issuesCollection } = await getCollections();
//     const result = await issuesCollection.insertOne({ message: "hello world", createdAt: new Date() });
//     res.send(result);
// });

app.get('/issues', async(req,res) => {
  const {issuesCollection} =await getCollections();
  const cursor = issuesCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

app.get('/issues/:category', async (req, res) => {
  try {
    const { category } = req.params;              // Get category from URL
    const { issuesCollection } = await getCollections();

    // Find all issues matching the category (case-insensitive)
    const result = await issuesCollection
      .find({ category:category })
      .toArray();

    if (result.length === 0) {
      return res.status(404).send({ message: `No issues found for category: ${category}` });
    }

    res.send(result);

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
});

app.get('/latest-issues', async (req, res) => {
    const { issuesCollection } = await getCollections();
    const cursor = issuesCollection.find().sort({ date: -1 }).limit(6);
    const result = await cursor.toArray();
    res.send(result);
})


app.listen(port, () => {
  console.log(`eco-ngc-bd server is running on port ${port}`)
})