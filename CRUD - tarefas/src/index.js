const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find(user => user.username === username); 
  if(!user){
    return response.status(404).json({error: "Usuário não localizado"})
  }

  request.user = user;
  return next();

}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const userNameAlreadyExist = users.some(user => user.username === username)

  if(userNameAlreadyExist){
    return response.status(400).json({error: "Username já em uso, tente novamente"})
  }

  const user = { 
    name, 
    username, 
    id: uuidv4(),
    todos: []
  }

  users.push(user);

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;

  const newTodo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {deadline, title} = request.body;
  const {id} = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({error: "Tarefa não localizada"})
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({error: "Tarefa não localizada"})
  }

  todo.done = true;

  return response.json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todo = user.todos.findIndex(todo => todo.id === id);

  if(todo === -1){
    return response.status(404).json({error: "Tarefa não localizada"})
  }

  user.todos.splice(todo, 1)

  return response.status(204).send()
});

module.exports = app;