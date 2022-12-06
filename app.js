const express = require("express");
var csrf = require("tiny-csrf");
//csrf isnt there so used tiny-csrf
const app = express();
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const path = require("path");

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("This is a secret string!!!"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
//it can be any 32 character

// eslint-disable-next-line no-unused-vars
// const {todo} = require("./models");

const { Todo } = require("./models");


app.set("view engine", "ejs");

app.get("/", async (request, response) => {
  const fetching_all_todos = await Todo.getAllTodos();  
  const Todos_which_are_completed = await Todo.completedItemsAre();
  const Todos_urgently_tobe_done = await Todo.overdue();
  const To_be_done_later = await Todo.dueLater();
  const To_be_done_today = await Todo.dueToday();
  if (request.accepts("html")) {
    response.render("index", {
      title: "Todo's Manager",
      fetching_all_todos,
      Todos_urgently_tobe_done,
      To_be_done_later,
      To_be_done_today,
      Todos_which_are_completed,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({Todos_urgently_tobe_done, To_be_done_later, To_be_done_today, Todos_which_are_completed});
  }
});

app.get("/todos", async (request, response) => {
  // defining route to displaying message
  console.log("Todo list");
  try {
    const todoslist = await Todo.findAll();
    return response.json(todoslist);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async (request, response) => {
  try {
    // eslint-disable-next-line no-unused-vars
      await Todo.addaTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      completed: false,
    });
    //redirect to Main URL
    return response.redirect("/");
  } catch (err1) {
    console.log(err1);
    return response.status(422).json(err1);
  }
});

app.put("/todos/:id", async (request, response) => {
  console.log("Todo is completed : ", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedtodoIs = await todo.setCompletionStatusAs(request.body.completed);
    return response.json(updatedtodoIs);
  } catch (err2) {
    console.log(err2);
    return response.status(422).json(err2);
  }
});
app.delete("/todos/:id", async (request, response) => {
  console.log("Todo being deleted with a particular id..", request.params.id);
  try {
    await Todo.remove(request.params.id);
    return response.json({ success: true });
  } catch (err3) {
    return response.status(422).json(err3);
  }
});
module.exports = app;
