const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const Credential = require("./models/Credential");
const Post = require('./models/Post');
const bcrypt = require("bcrypt");
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');

const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());
//since pass contains special characters, used js encodeURIComponent to URL-encode the password. In MongoDB connection strings, if your password contains special characters like /, you should URL-encode it to ensure it is properly parsed.
app.use('/uploads', express.static(__dirname + '/uploads'));
const encodedPassword = encodeURIComponent("Kartik22/11");
const connectionString = `mongodb+srv://manasipathak01:${encodedPassword}@cluster0.m4zkkqy.mongodb.net/?retryWrites=true&w=majority`;


mongoose.connect(connectionString);

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const credentialDoc = await Credential.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(credentialDoc);
  } catch (e) {
    res.status(400).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const credentialDoc = await Credential.findOne({ username });
    if (!credentialDoc) {
      return res.status(400).json("User not found");
    }
    const passOk = bcrypt.compareSync(password, credentialDoc.password);
    if (passOk) {
      const token = jwt.sign({ username, id: credentialDoc._id }, secret);
      res.cookie("token", token, { httpOnly: true }).json({
        id: credentialDoc._id,
        username,
      });
    } else {
      res.status(400).json("Wrong credentials");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error");
  }
});

app.get('/profile', (req,res) => {
  const {token} = req.cookies;
  jwt.verify(token, secret, {}, (err,info) => {
    if (err) throw err;
    res.json(info);
  });
});

app.post('/logout', (req,res) => {
  res.cookie('token', '').json('ok');
});

app.post('/post', uploadMiddleware.single('file'), async (req,res) => {
  const {originalname,path} = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path+'.'+ext;
  fs.renameSync(path, newPath);

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {title,summary,content} = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover:newPath,
      author:info.id,
    });
    res.json(postDoc);
  });

});

app.put('/post',uploadMiddleware.single('file'), async (req,res) => {
  let newPath = null;
  if (req.file) {
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
  }

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {id,title,summary,content} = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json('you are not the author');
    }
    await postDoc.update({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
    });

    res.json(postDoc);
  });

});

app.get('/post', async (req,res) => {
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({createdAt: -1})
      .limit(20)
  );
});

app.get('/post/:id', async (req, res) => {
  const {id} = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
})

app.listen(4000);
//