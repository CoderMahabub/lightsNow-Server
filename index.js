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

    // Add User To DB
    app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        console.log(result);
        res.json(result)
    })

    // Add users if not in db
    app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result)
    })

    // Make Admin if email available
    app.put('/users/admin', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const updateDoc = { $set: { role: 'admin' } };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
    })

    // Get Admin email to limit access
    app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
    })

    // Update Order Status to Approved
    app.put('/changeStatus/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const updateDoc = {
            $set: {
                status: 'Shipped'
            }
        };
        const result = await ordersCollection.updateOne(query, updateDoc);
        res.json(result)
    })

    // Get All Orders
    app.get('/allOrders', async (req, res) => {
        const result = await ordersCollection.find({}).toArray();
        res.send(result);
    })

    // Cancel Single Order
    app.delete('/deleteOrder/:id', async (req, res) => {
        const id = req.params.id;
        const result = await ordersCollection.deleteOne({ _id: ObjectId(id) });
        res.send(result)
    })

    // Post Single Product
    app.post('/addProduct', async (req, res) => {
        const product = req.body;
        const result = await productCollection.insertOne(product);
        // console.log(result);
        res.json(result)
    })
    // Delete Single Product
    app.delete('/deleteProduct/:id', async (req, res) => {
        const id = req.params.id;
        const result = await productCollection.deleteOne({ _id: ObjectId(id) });
        res.send(result)
    })

    // Get Single Product
    app.get('/singleProduct/:id', async (req, res) => {
        productCollection.findOne({ _id: ObjectId(req.params.id) }).then(result => {
            // console.log(result);
            res.send(result)
        });
    })

    // Update Booking Status
    app.put('/updateProduct/:id', (req, res) => {
        const id = req.params.id;
        const updatedInfo = req.body;
        productCollection.updateOne({ _id: ObjectId(id) }, {
            $set: {
                lightTitle: updatedInfo.lightTitle,
                lightDescription: updatedInfo.lightDescription,
                lightPrice: updatedInfo.lightPrice,
                lightThumbnail: updatedInfo.lightThumbnail,
            }
        })
            .then(result => res.send(result))
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