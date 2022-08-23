const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const path = require("path");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false })); // post에서 보낸 데이터 req.body로 받을려면 있어야함
app.use(express.static(path.join(__dirname, "/public")));

app.set("port", process.env.PORT || 8099);
const PORT = app.get("port");

app.get("/", (req, res) => {
  res.send("hello node");
});
app.get("/insert", (req, res) => {
  res.render("insert", { title: "insert" });
});

app.listen(PORT, () => {
  console.log(`${PORT}에서 서버대기중`);
});
