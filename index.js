const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
//     const { contributionCollection } = await getCollections();
//     const result = await contributionCollection.insertOne({ message: "hello world", createdAt: new Date() });
//     res.send(result);
// });


// Issues Related APIS 

app.get('/issues', async (req, res) => {
  const { issuesCollection } = await getCollections();
  const cursor = issuesCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

app.get('/issues/byEmail', async (req, res) => {
  console.log(req.query.email)
  const { issuesCollection } = await getCollections();
  // console.log('headers', req.headers)
  const email = req.query.email;
  const query = {};
  if (email) {
    query.email = email
  }
  console.log(query)
  const cursor = issuesCollection.find(query);
  const result = await cursor.toArray();
  res.send(result);
})

app.get('/issues/:id', async (req, res) => {

  const { issuesCollection } = await getCollections();
  const id = req.params.id;
  console.log("Requested ID:", id);

  // Convert string to ObjectId
  const query = { _id: new ObjectId(id) };

  const result = await issuesCollection.findOne(query);
  res.send(result);

});



app.get('/issues/:category', async (req, res) => {
  const { category } = req.params;              // Get category from URL
  const { issuesCollection } = await getCollections();

  // Find all issues matching the category (case-insensitive)
  const result = await issuesCollection
    .find({ category: category })
    .toArray();
  res.send(result);
});

app.get('/latest-issues', async (req, res) => {
  const { issuesCollection } = await getCollections();
  const cursor = issuesCollection.find().sort({ date: -1 }).limit(6);
  const result = await cursor.toArray();
  res.send(result);
})

app.post('/issues', async (req, res) => {
  const { issuesCollection } = await getCollections();
  console.log(req.headers)
  const newIssue = req.body;
  const result = await issuesCollection.insertOne(newIssue);
  res.send(result)
})

app.patch('/issues/:id', async (req, res) => {
  const { issuesCollection } = await getCollections();
  const id = req.params.id;
  const newProduct = req.body;
  const query = { _id: new ObjectId(id) };
  const update = {
    $set: {
      title: newProduct.title,
      category: newProduct.category,
      amount: newProduct.amount,
      description: newProduct.description
    }
  };
  const result = await issuesCollection.updateOne(query, update);
  res.send(result);
})

app.delete('/issues/:id', async (req, res) => {
  const { issuesCollection } = await getCollections();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await issuesCollection.deleteOne(query)
  res.send(result)
})

// Contribution Related APIS 

app.get('/contributions', async (req, res) => {
  console.log(req.query.email)
  const { contributionCollection } = await getCollections();
  // console.log('headers', req.headers)
  const email = req.query.email;
  const query = {};
  if (email) {
    query.email = email
  }
  const cursor = contributionCollection.find(query);
  const result = await cursor.toArray();
  res.send(result);
})

app.post('/contributions', async (req, res) => {
  const { contributionCollection } = await getCollections();
  const newBid = req.body;
  const result = await contributionCollection.insertOne(newBid);
  res.send(result)
})

// User Related APIS 
app.post('/users', async (req, res) => {
    const { usersCollection } = await getCollections();
    const newUser = req.body;
    const email = req.body.email;
    const query = { email: email };
    const existingUser = await usersCollection.findOne(query);
    if (existingUser) {
        res.send({ message: 'user already exist' });
    }
    else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
    }
})


app.listen(port, () => {
  console.log(`eco-ngc-bd server is running on port ${port}`)
})