const db = require("./utils/db")
const nt = require('nostr-tools')

async function dbTest()
{
    const dm = await db.getDomain();
    console.log(dm)
}
async function test()
{
    await dbTest()
}

test()