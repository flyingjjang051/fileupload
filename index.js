const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary");

const MongoClient = require("mongodb").MongoClient;
let db = null;
MongoClient.connect(process.env.MONGO_URL, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log(err);
  }
  db = client.db("crudapp");
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false })); // post에서 보낸 데이터 req.body로 받을려면 있어야함
app.use(express.static(path.join(__dirname, "/public")));
app.use("/upload", express.static(path.join(__dirname, "/upload")));
app.set("port", process.env.PORT || 8099);
const PORT = app.get("port");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_COUND_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({
  destination: (req, file, done) => {
    done(null, path.join(__dirname, "/upload"));
  },
  filename: (req, file, done) => {
    done(null, file.originalname);
  },
});

const fileUpload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.render("index", { title: "main" });
});
app.get("/insert", (req, res) => {
  res.render("insert", { title: "insert" });
});
// 미들웨어
app.post("/register", fileUpload.single("poster"), (req, res) => {
  const movieTitle = req.body.movieTitle;
  const date = req.body.date;
  const genre = req.body.genre.join("/");
  const desc = req.body.desc;
  const point = req.body.point;

  // console.log(movieTitle);
  // console.log(date);
  console.log(genre);
  // console.log(desc);
  // console.log(point);
  // console.log(req.file);
  // db에 파일을 저장하는 두가지 방법....  text로 바꿔서 저장
  // db에다가 경로만 저장 (upload/01.jpg)
  cloudinary.uploader.upload(req.file.path, (result) => {
    console.log(result);
    db.collection("movie").insertOne({
      movieTitle: movieTitle,
      date: date,
      genre: genre,
      desc: desc,
      point: point,
      poster: result.url,
    });
    res.redirect("/list");
  });
});

app.get("/list", (req, res) => {
  //db읽어서
  //list만든 다음에
  db.collection("movie")
    .find()
    .toArray((err, result) => {
      res.render("list", { list: result, title: "list" }); //   페이지 내가 만들어서 보내주기
    });
});
app.get("/movie/:title", (req, res) => {
  //console.log(req.query.id);
  console.log(req.params.title);
  const movieTitle = req.params.title;
  db.collection("movie").findOne({ movieTitle: movieTitle }, (err, result) => {
    if (result) {
      res.render("movie", { title: "detail", result: result });
    }
  });
});
app.listen(PORT, () => {
  console.log(`${PORT}에서 서버대기중`);
});
