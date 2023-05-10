const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// const uri = "mongodb://0.0.0.0:27017";
const uri = `mongodb+srv://${process.env.S3_BUCKET}:${process.env.SECRET_KEY}@cluster0.q0gulip.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const userCollectionOfData = client
      .db("usersManagementDB")
      .collection("usersDataSection");

    app.get("/users", async (req, res) => {
      const cursor = userCollectionOfData.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const filter = await userCollectionOfData.findOne(query);
      res.send(filter);
    });

    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name: updatedData.name,
          email: updatedData.email,
          photo: updatedData.photo,
          genderData: updatedData.genderData,
          activeData: updatedData.activeData,
        },
      };
      const result = await userCollectionOfData.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollectionOfData.deleteOne(query);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const addedUsers = req.body;
      console.log(addedUsers);
      const result = await userCollectionOfData.insertOne(addedUsers);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Management Server Is Running");
});

app.listen(port, () => {
  console.log(`Server is HITTING on PORT : ${port}`);
});
