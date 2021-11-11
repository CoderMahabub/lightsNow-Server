const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const mongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;


// DB Connection  Start
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rwtvo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Middleware
const app = express();
app.use(cors());
app.use(express.json());

// DB MAIN PART STARTS HERE
client.connect(err => {
    const database = client.db("lightsNow");
    const productCollection = database.collection("products");
    const ordersCollection = database.collection("orders");
    const usersCollection = database.collection("users");

    // Get All The products
    app.get('/products', async (req, res) => {
        const result = await productCollection.find({}).toArray();
        res.send(result);
    })

    // Post Orders
    app.post('/addOrders', (req, res) => {
        ordersCollection.insertOne(req.body).then((result) => {
            res.send(result.insertedId);
        })
    })

    // Get All Orders
    app.get('/allOrders', async (req, res) => {
        const result = await ordersCollection.find({}).toArray();
        res.send(result);
    })

    // Delete Single Order
    app.delete('/deleteOrder/:id', async (req, res) => {
        const id = req.params.id;
        const result = await ordersCollection.deleteOne({ _id: ObjectId(id) });
        res.send(result)
    })

    app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        console.log(result);
        res.json(result)
    })






    // client.close();
});


//Root Get
app.get('/', (req, res) => {
    res.send('Lights Now Server!')
})

// App Listen
app.listen(port, () => {
    console.log(`Running server at http://localhost:${port}`)
})