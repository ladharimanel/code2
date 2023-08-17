import express, { json } from 'express';
import { MongoClient } from 'mongodb';

// Connect to MongoDB
const mongoURL = 'mongodb://winicari:winicari@41.226.178.8:2507/?retryWrites=true&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-';
const databaseName = 'TAXI';
const collectionName = 'Hitorique_recette';

const app = express();
app.use(json());

app.post('/', async (req, res) => {
  try {
    const client = new MongoClient(mongoURL);
    await client.connect();
    console.log('Connected to the MongoDB server');

    const db = client.db(databaseName);
    const collection = db.collection(collectionName);
    const data = req.body;

    // Save the ticket data to the MongoDB collection
    await collection.insertOne(data);

    res.send('Ticket data saved to MongoDB');
  } catch (error) {
    console.error('Error connecting to the database', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
