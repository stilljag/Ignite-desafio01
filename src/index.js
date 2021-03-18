const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) return response.status(404).json({ error: "User not found!" });

  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAllreadyExists = users.find((user) => user.username === username);

  if (userAllreadyExists)
    return response.status(400).json({ error: "User allready exists!" });

  const createUser = { id: uuidv4(), name, username, todos: [] };

  users.push(createUser);

  return response.status(201).send(createUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const createTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(createTodo);
  return response.status(201).json(createTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { id } = request.params;

  const { user } = request;

  const verifyExistsId = user.todos.find((todo) => todo.id == id);

  if (!verifyExistsId)
    return response.status(404).json({ error: "ID not found!" });

  verifyExistsId.title = title;
  verifyExistsId.deadline = new Date(deadline);

  return response.json(verifyExistsId);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { user } = request;

  const verifyExistsId = user.todos.find((todo) => todo.id == id);

  if (!verifyExistsId)
    return response.status(404).json({ error: "ID not found!" });

  verifyExistsId.done = true;

  return response.json(verifyExistsId);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const verifyExistsId = user.todos.findIndex((todo) => todo.id == id);

  if (verifyExistsId === -1)
    return response.status(404).json({ error: "ID not found!" });

  user.todos.splice(verifyExistsId, 1);

  return response.status(204).send();
});

module.exports = app;
