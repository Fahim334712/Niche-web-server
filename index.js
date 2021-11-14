const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const cors = require('cors');
const { query } = require('express');
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.otlpr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('Calculator');
        const orderCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        const reviewCollection = database.collection('reviews');
        const productsCollection = database.collection('products');
        const allCollection = database.collection('allproducts');



        app.get('/allproducts', async (req, res) => {
            const cursor = allCollection.find({});
            const allproducts = await cursor.toArray();
            res.send(allproducts);
        })
        app.post('/allproducts', async (req, res) => {
            const product = req.body;
            const result = await allCollection.insertOne(product);
            res.json(result);
        })


        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        })
        //ok
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            console.log(result);
            res.json(result)
        })


        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        // Post for User
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result)
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.updateOne(user);
            res.json(result);
        })


        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })


        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })

        // app.get('/users', async (req, res) => {
        //     const cursor = myCollection.find({});
        //     const users = await cursor.toArray();
        //     res.send(users);
        // })


        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            console.log('Hitting the Post', req.body);
            console.log('added User', result);
            res.json(result);
        })

        // app.post('/users', async (req, res) => {
        //     const newUser = req.body;
        //     const result = await myCollection.insertOne(newUser);
        //     console.log('Hitting the Post', req.body);
        //     console.log('added User', result);
        //     res.json(result);
        // });
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        });



    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello this');
})

app.listen(port, () => {
    console.log('My connection Port is ', port);
})