const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mysql = require("mysql");
const dotenv = require("dotenv");
const _ = require("lodash");

const app = express();
const Connection = require("mysql/lib/Connection");
const { CLIENT_MULTI_RESULTS } = require("mysql/lib/protocol/constants/client");

dotenv.config({ path: __dirname + "/.env" });

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ "extended": "true" }));
app.use(express.static("public"));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB
});

db.connect(async(err) => {
  if (err) throw err;
  console.log("Database Connected...");
  db.query("CREATE DATABASE IF NOT EXISTS todolist", (err, result) => {
    if (err) throw err;
  });
  const item = "CREATE TABLE IF NOT EXISTS items (id INT AUTO_INCREMENT PRIMARY KEY ,item_name VARCHAR(255) NOT NULL )";
  db.query(item, (err, result) => {
    if (!err){
      console.log("items generated")
    }
  });
  });

app.get("/", async (req, res, next) => {

  let dates = date.getDate();

  db.query("SELECT * FROM items", (err, result) => {
    if (err) throw err;
    // console.log(result)
    res.render('list', { listTitle: dates, newListItems: result });
  });
})

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);


  const customItem = "CREATE TABLE IF NOT EXISTS " + customListName + " (id INT AUTO_INCREMENT PRIMARY KEY ,item_name VARCHAR(255) NOT NULL )";
  db.query(customItem, (err, result) => {
    if (!err) {
      db.query("SELECT * FROM " + customListName, (err, result) => {
        if (!err) {
          res.render('list', { listTitle: customListName, newListItems: result });
        }
      })

    }
  })
})


app.post("/", async (req, res) => {

  const userItem = req.body.newItem;
  const listName = req.body.list;
  let dates = date.getDate();
  // console.log(req.body.list);

  if (listName === dates) {
    var items = ("INSERT INTO items (item_name) VALUES ('" + userItem + "')")
    db.query(items, (err, result) => {
      if (err) throw err;
      // console.log("Items Inserted Into Table");
    })
    res.redirect("/");
  } else {
    var customItems = ("INSERT INTO " + listName + "(item_name) VALUES ('" + userItem + "')")
    db.query(customItems, (err, result) => {
      if (err) throw err;
      // console.log("Items Inserted Into Table")
    })
    res.redirect("/" + listName);
  }

})


app.post("/delete", async (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  let dates = date.getDate();
  if (listName === dates) {
    var deleteItem = ("DELETE FROM items WHERE id = " + checkedItemId);
    db.query(deleteItem, (err, result) => {
      if (err) throw err;
      // console.log("checked Item Deleted")
    })
    res.redirect("/");
  } else {
    var deleteItem = ("DELETE FROM " + listName + " WHERE id = " + checkedItemId);
    db.query(deleteItem, (err, result) => {
      if (err) throw err;
      // console.log("checked Item Deleted")
    })
    res.redirect("/" + listName);
    // console.log(checkedItemId)
  }
})

var listener = app.listen(process.env.PORT, function () {
  console.log("Server started on port " + listener.address().port); //listening on port
});

