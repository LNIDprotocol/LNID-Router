const db = require("../../../utils/db");
const tg = require("../../../utils/tg");
const lan = require("../../../utils/lan")

async function star(bot,uid,req,raw)
{
    await db.newAccount(raw.from);
    return menu(bot,uid,req,raw)
}

async function menu(bot,uid,req,raw)
{
    var text = lan.getText()
    var finalText = text['mainMenu'][0];
    finalText += text['mainMenu'][1]
    var domain = await db.getDomainByUid(uid);
    if(domain.length>0)
    {
        domain.forEach(d => {
            finalText+=`
\`${d.name}${d.tld}\` - \`${d.name}${d.visit}\``
        });
    }else
    {
        finalText+=text['mainMenu'][2]
    }

    return await tg.tryBotSendMessage(bot,uid,finalText,{
        parse_mode:'MarkDown',
        disable_web_page_preview:"true",
        reply_markup: JSON.stringify({
          inline_keyboard:  lan.mainMenuButton()
        })
    });

}

async function unKnowRouter(bot,uid,req,data,opts)
{
    var text = lan.getText()
    var finalText = `*${text['building'][0]}* \`${req.command}\` *${text['building'][1]}*
${text['building'][2]}`
    return await tg.tryBotSendMessage(bot,uid,finalText,{
        parse_mode:'MarkDown',
        disable_web_page_preview:"true",
        reply_markup: JSON.stringify({
        inline_keyboard:[lan.backAndClose()]
        })
    });
}

module.exports = {
    star,
    menu,
    unKnowRouter
}