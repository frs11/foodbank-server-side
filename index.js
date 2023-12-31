const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
// const corsConfig = {
//   origin: "",
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE"],
// };
// app.use(cors(corsConfig));
// app.options("", cors(corsConfig));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jmuxmrg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productCollection = client.db("productsDB").collection("products");
    const cartProductCollection = client
      .db("productsDB")
      .collection("cartProducts");

    // Get product from the database
    app.get("/brands/products", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get Cart Product from the database
    app.get("/cart/products", async (req, res) => {
      const cursor = cartProductCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Store Product to the database
    app.post("/brands/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      console.log(result);
      res.send(result);
    });

    // Store Product to the the Cart
    app.post("/cart/products", async (req, res) => {
      const newSelectedProduct = req.body;
      const result = await cartProductCollection.insertOne(newSelectedProduct);
      console.log(result);
      res.send(result);
    });

    // Update Product
    app.put(`/products/update/:id`, async (req, res) => {
      const id = req.params.id;

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedProduct = req.body;

      const product = {
        $set: {
          name: updatedProduct.name,
          brand: updatedProduct.brand,
          image: updatedProduct.image,
          type: updatedProduct.type,
          price: updatedProduct.price,
          ratting: updatedProduct.ratting,
          description: updatedProduct.description,
        },
      };

      const result = await productCollection.updateOne(
        filter,
        product,
        options
      );
      res.send(result);
    });

    // Delete product
    app.delete(`/cart/products/:id`, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartProductCollection.deleteOne(query);
      res.send(result);
    });

    // // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// app.get("/", (req, res) => {
//   res.send("server is running");
// });
// app.get("/test", (req, res) => {
//   res.send("server testing");
// });

app.listen(port, () => console.log(`server is running on port: ${port}`));
