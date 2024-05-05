require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const Person = require("./models/person");

const app = express();
const PORT = process.env.PORT;

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());

// Middleware para manejar las solicitudes de personas
app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error)); // Pasar errores a middleware de manejo de errores
});

app.get("/api/persons/:id", (request, response, next) =>{
  Person.findByIdAndDelete(request.params.id)
  .then(result=>{
    response.status(204).end()
  })
  .catch(error => next(error))
})

app.post("/api/persons", (request,response)=>{
  const body = request.body

  if(body.name === undefined || body.number === undefined){
    return response.status(400).json({error: 'name or number missing'})
  }

  const person = new Person ({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

// Middleware para manejar puntos finales desconocidos
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "Unknown endpoint" });
};

app.use(unknownEndpoint);

// Middleware para manejar errores
app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).send({ error: "Internal server error" });
});

const url = process.env.MONGODB_URI;
console.log(url);
mongoose
  .connect(url)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
