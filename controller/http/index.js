/**
 * This is the core server of .well-known transfer
 */
require('dotenv').config();
var querystring = require('querystring');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const core = require("../../utils/core")
const cors = require('cors');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors());
app.listen(9997, async function() {
  console.log('https-server start')
})
app.get('/ping', async function(req, res) {
    res.send({
        "code":200,
        "data":"pong"
    })
})

app.get('/.well-known/lnurlp/:uname', async function(req, res) {
    try{
        var s = await core.getRecord(req.params.uname)
        res.send(s.rawData);
    }catch(e)
    {
        console.log(e);
            res.send({
            "code":500,
            "data":"internal error"
        });
    }
})

app.get('/.well-known/nostr.json', async function(req, res) {
    try{
        var s = await core.getNip05(req.query.name)
        res.send(s.rawData);
    }catch(e)
    {
        console.log(e);
            res.send({
            "code":500,
            "data":"internal error"
        });
    }
})

// app.post('/newRecord/:uname', async function(req, res) {
//     try{
//         var s = await core.newRecord(req.params.uname,req.body.ln)
//         res.send({
//             "code":200,
//             "data":s
//         });
//     }catch(e)
//     {
//         console.log(e);
//             res.send({
//             "code":500,
//             "data":"internal error"
//         });
//     }
// })

// app.post('/newNip05/:uname', async function(req, res) {
//     try{
//         var s = await core.newNip05(req.params.uname,req.body.ln)
//         res.send({
//             "code":200,
//             "data":s
//         });
//     }catch(e)
//     {
//         console.log(e);
//             res.send({
//             "code":500,
//             "data":"internal error"
//         });
//     }
// })

async function init()
{

}

module.exports = {
    init
}