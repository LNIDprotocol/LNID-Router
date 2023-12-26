const db = require("./db");
const api = require("./apis")
const tool = require("./tools")
const nt = require('nostr-tools')
async function getRecord(uanme)
{
    var ret = await db.getDomainByName(uanme);
    if(ret && ret.length > 0)
    {
        console.log(ret[0])
        ret[0].forward.ln.raw = Buffer.from(ret[0].forward.ln.raw ,"base64").toString("utf-8")
        ret[0].forward.ln.raw = JSON.parse(ret[0].forward.ln.raw )
        return ret[0].forward.ln
    }else{
        return false;
    }
}

async function newRecord(uid,uanme,ln)
{
    var domain = await db.verfiDomainOwning(uid,uanme);
    if(domain)
    {
        var forward = domain.forward;
        var data = 
        {
            uanme:uanme,
            link:ln,
            raw:Buffer.from(JSON.stringify(
                await api.anyRequest(
                    tool.linkDecode(ln)
                )
            )).toString("base64")
        }
        forward['ln'] = data
        // console.log(data)
        if(data.raw)
        {
            await db.updateDomainForward(domain._id,forward);
            return true;
        }
    }
    return false;
}

async function getNip05(uanme)
{
    var ret = await db.getDomainByName(uanme);
    if(ret && ret.length > 0)
    {
        ret[0].forward.nostr.raw = Buffer.from(ret[0].forward.nostr.raw,"base64").toString("utf-8")
        ret[0].forward.nostr.raw = JSON.parse(ret[0].forward.nostr.raw)
        return ret[0].forward.nostr
    }else{
        return false;
    }
}

async function newNip05(uid,uanme,ln)
{
    var domain = await db.verfiDomainOwning(uid,uanme);
    if(domain)
    {
        var forward = domain.forward;
        var nip05Data = {
            names:{
            }
        }
        nip05Data['names'][uanme] = nt.nip19.decode(ln).data
        var data = 
        {
            uanme:uanme,
            link:ln,
            raw:Buffer.from(JSON.stringify(
                nip05Data
            )).toString("base64")
        }
        forward['nostr'] = data
        // console.log(data)
        if(data.raw)
        {
            await db.updateDomainForward(domain._id,forward);
            return true;
        }
    }
    return false;
}
module.exports = {
    getRecord,
    newRecord,
    getNip05,
    newNip05
}