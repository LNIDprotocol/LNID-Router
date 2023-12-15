var MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
//DB name
const mainDB = "main"

//Sheet name
const sUser = "users";
const sDomain = "domain";
const sDns = "nameserver";

//DB struct
const accountStruct = {
    id: 0,
    is_bot: false,
    first_name: '',
    last_name: '',
    username: '',
    language_code: '',
    createTime:0,
}

const domainStruct = {
    uid:0,
    name:"",
    tld:"",
    visit:"",
    forward:{
        ln:{},
        nostr:{},
        http:""
    },
    createTime:0,
}

function unique(arr) {
    var obj = {};
    return arr.filter(function(item, index, arr){
        return obj.hasOwnProperty(typeof item + item) ? false : (obj[typeof item + item] = true)
    })
}

//working logic
async function newAccount(data)
{
    if((await getAccountById(data.id)).length > 0 )
    {
        return false;
    }
    const pool =  await MongoClient.connect(process.env.SQL_HOST)
    var db =pool.db(mainDB);
    var ret = await db.collection(sUser).insertOne(data);
    await pool.close();
    return ret;
}
async function getAccountById(uid)
{
    const pool =  await MongoClient.connect(process.env.SQL_HOST)
    var db =pool.db(mainDB);
    var ret = await db.collection(sUser).find({
        id:uid
    }).project({}).toArray();
    await pool.close();
    return ret;
}
async function newDomain(data)
{
    if((await getDomainByName(data.name)).length > 0 )
    {
        return false;
    }
    const pool =  await MongoClient.connect(process.env.SQL_HOST)
    var db =pool.db(mainDB);
    var ret = await db.collection(sDomain).insertOne(data);
    await pool.close();
    return ret;
}
async function getDomainByName(name)
{
    const pool =  await MongoClient.connect(process.env.SQL_HOST)
    var db =pool.db(mainDB);
    var ret = await db.collection(sDomain).find({
        name:name
    }).project({}).toArray();
    await pool.close();
    return ret;
}

async function getDomainByUid(uid)
{
    const pool =  await MongoClient.connect(process.env.SQL_HOST)
    var db =pool.db(mainDB);
    var ret = await db.collection(sDomain).find({
        uid:uid
    }).project({}).toArray();
    await pool.close();
    return ret;
}


module.exports = {
    newAccount,
    getAccountById,
    newDomain,
    getDomainByName,
    getDomainByUid,
    unique
}

