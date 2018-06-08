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

app.listen(3000, () => {
    console.log('Servidor corriendo')
});