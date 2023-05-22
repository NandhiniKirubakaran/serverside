import express, { response } from 'express';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import loginRouter from './routes/login.route.js';
import signupRouter from './routes/signup.route.js';
import Stripe from 'stripe';
import {v4 as uuidv4} from 'uuid';


const app = express();
// const PORT = 4000;                             //Auto assign PORT
const PORT = process.env.PORT; 

//env - Environment variables
console.log(process.env.MONGO_URL);

app.get('/', function ( request, response) {
    response.send("🎉🎉🎉🎉🎉");
});

//Connection Code - Mongodb
// const MONGO_URL = 'mongodb://127.0.0.1:27017';
const MONGO_URL = process.env.MONGO_URL;        //default ip of mongo 
const client = new MongoClient(MONGO_URL);      //dial
await client.connect();                         //Top level await      //call
console.log("Mongo is Connected!!!");

// xml json text
// middleware - express.json() - JSON -> JS object
// app.use -> Intercepts -> applies express.json()
app.use(express.json());
app.use(cors());

app.use("/login", loginRouter);
app.use('/signup', signupRouter);

//Products - create - API
app.post('/products', async (request, response) => {
    const data = request.body;
    const result = await client.db("b40wd").collection("foodproducts").insertMany(data);
    response.send(result);
});

//Products - get - API
app.get('/products', async (request, response) => { 
    const products = await client.db("b40wd").collection("foodproducts").find( {} ).toArray();
        response.send(products);
});


const SECRET_KEY = process.env.SECRET_KEY;

const stripe = new Stripe(SECRET_KEY);

app.get('/payment', async (req, res) => {
    const { data, token } = req.body;
    const transactionkey = uuidv4();
    return stripe.customers.create({
        email: token.email,
        source: token.id,
    }).then((customer) => {
        stripe.charges.create({
            amount: data.price,
            customer: customer.id,
            receipt_email: data.name,
        }).then((result) => {
            res.json(result);
        }).catch((err) => {
            console.log(err);
        });
    });
});


app.listen(PORT, () => console.log(`The Server Started in : ${PORT}🎊🎊`));

export { client };