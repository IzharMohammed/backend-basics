import express from "express";
const app = express();
const port = 4000;

app.use(express.json())

const router = express.Router()


router.get("/users", (req, res) => {
  res.send("Hello World!");
});

router.post("/users", (req, res) => {

})

router.put("/users/{id}", (req, res) => {

})

router.delete("/users/{id}", (req, res) => {

})




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
