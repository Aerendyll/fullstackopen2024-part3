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

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return v.length >= 3;
      },
      message: props => `El nombre '${props.value}' debe tener al menos 3 caracteres.`
    }
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /\b\d{2,3}-\d{7,}\b/.test(v);
      },
      message: props => `${props.value} no es un número de teléfono válido. El formato debe ser XX-XXXXXXXX.`
    }
  },
});


// Middleware para manejar las solicitudes de personas
app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error)); // Pasar errores a middleware de manejo de errores
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })

    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
      console.log("Person deleted");
    })
    .catch((error) => next(error));
});
app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

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

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
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



const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
