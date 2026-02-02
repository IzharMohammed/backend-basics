import express, { type Request, type Response } from "express";
import compression from "compression"
import { body, param } from "express-validator";
const app = express();
const port = process.env.PORT || 4000;

// Parses json request body
app.use(express.json())
// compress response 
app.use(compression())

// Set caching headers for GET requests.
app.use((req, res, next) => {
  if (req.method === "GET") {
    res.set("Cache-Control", "public , max-age=60")
  }
  next()
})
const router = express.Router()
// ----------------------------------------------------
// In-Memory Data Store for Users
// ----------------------------------------------------
type User = {
  id?: string,
  name: string,
  email: string,
}
let users: User[] = [];

router.get("/users", (req, res) => {
  res.send(users);
});

router.get("/users/:id", [
  param("id").notEmpty().withMessage("id is required")
], (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = users.find(u => u.id === id)
    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        message: "user not found",
        statusCode: 404,
      })
    }

    res.json(user)
  } catch (error) {
    return res.json({
      error: "SystemError",
      message: "internal server Error",
      statusCode: 500
    })
  }
})



router.delete("/users/:id", (req, res) => {

})




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
