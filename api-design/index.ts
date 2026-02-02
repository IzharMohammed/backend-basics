import express, { type Request, type Response } from "express";
import compression from "compression"
import { body, param } from "express-validator";
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';
import { randomUUID } from "node:crypto";

const app = express();
const port = process.env.PORT || 4000;


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

router.post("/users",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("valid email is required")
  ]
  , (req: Request, res: Response) => {
    const { name, email } = req.body;
    try {
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return res.status(409).json({
          error: "conflict",
          message: "User with this email already exists",
          statusCode: 409,
        })
      }
      const newUser: User = {
        id: randomUUID(),
        email,
        name
      }
      
      users.push(newUser);
      res.status(201).json(newUser)
    } catch (error) {
      return res.json({
        error: "SystemError",
        message: "Internal Server Error",
        statusCode: 500
      })
    }
  })

router.put("/users/:id",
  [
    param("id").notEmpty().withMessage("id is required"),
    body("name").notEmpty().withMessage("Name cannot be empty"),
    body("email").optional().isEmail().withMessage("valid email is required")
  ]
  , (req: Request, res: Response) => {
    try {
      const { name, email } = req.body;
      const { id } = req.params;
      const userIndex = users.findIndex(u => u.id === id)
      if (userIndex === -1) {
        return res.status(404).json({
          error: "NotFound",
          message: "User not found",
          statusCode: 404
        })
      }
      const updatedUser = { ...users[userIndex], name, email };
      users[userIndex] = updatedUser;
      res.status(200).json(updatedUser)
    } catch (error) {
      return res.json({
        error: "SystemError",
        message: "Internal Server Error",
        statusCode: 500
      })
    }
  })

router.delete("/users/:id",
  [
    param("id").notEmpty().withMessage("id is required")
  ]
  , (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex === -1) {
        return res.status(404).json({
          error: "NotFound",
          message: "User not found",
          statusCode: 404
        })
      }
      const updatedUser = users.filter(user => user.id !== id)
      res.status(200).json(updatedUser)
    } catch (error) {
      return res.json({
        error: "SystemError",
        message: "Internal Server Error",
        statusCode: 500
      })
    }
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
