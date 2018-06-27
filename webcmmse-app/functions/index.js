const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const register = require('./register');
const password = require('./password');
const changePaperState = require('./changePaperState');
const newPaper = require('./newPaper');
const proofPayment = require('./proofPayment');
const changeDataPaper = require('./changeDataPaper');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/register', (req, res) => {
    register(req.body);
    res.status(200).send();
});

app.post('/password', (req, res) => {
    password(req.body);
    res.status(200).send();
});

app.post('/changePaperState', (req, res) => {
    changePaperState(req.body);
    res.status(200).send();
});

app.post('/newPaper', (req, res) => {
    newPaper(req.body);
    res.status(200).send();
});

app.post('/proofPayment', (req, res) => {
    proofPayment(req.body);
    res.status(200).send();
});

app.post('/changeDataPaper', (req, res) => {
    changeDataPaper(req.body);
    res.status(200).send();
});

exports.mail = functions.https.onRequest(app);