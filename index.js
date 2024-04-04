const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");
const app = express();
app.use(express.static("dist"));
app.use(cors());
app.use(express.json());

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("<h1>FullStackOpen part-3 </h1>");
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/info", (request, response) => {
  const currentTime = new Date();
  const totalEntries = persons.length;
  const infoString = `<p>Phonebook has info for ${totalEntries} people <br/> ${currentTime} </p>`;
  response.send(infoString);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const generateId = () => {
  return Math.floor(Math.random() * 1000000) + 1;
};

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response
      .status(400)
      .json({ error: "Name already exists or Name/Number missing" });
  }

  const existingPerson = persons.find((person) => person.name === body.name);
  if (existingPerson) {
    return response.status(400).json({ error: "Name must be unique" });
  }
  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons = persons.concat(person);

  response.json(person);
});

morgan.token("postData", (request, response) => {
  if (request.method === "POST") {
    return JSON.stringify(request.body);
  }
});

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :postData"
  )
);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: " Unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
const server = http.createServer(app);
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
//trying to solve error flyio/render
