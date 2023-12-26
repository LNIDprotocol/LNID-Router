const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config()
const token = process.env.TELEGRAMAPI;
const tool = require("../../utils/tools")
const menu = require("./src/menu");
const domain = require("./src/domain")
const bot = new TelegramBot(token, {polling: true});
bot.on('message', async (msg) => {
    try{
        if(msg["reply_to_message"])
        {
            console.log(msg)
        }else{
            await router(msg)
        }
    }catch(e)
    {
        console.log(e);
    }

});

bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const opts = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    };
    try{
        await callBackRouter(msg,action,opts);
    }catch(e)
    {
        console.log(e);
    }

  });


async function router(data)
{
    const uid = (data.chat.id).toString();
    const d= data.text;
    const t= data.date;
    const req = tool.pathRouter(data.text);

    switch (req.command)
    {
        case "start":
            await menu.star(bot,uid,req,data);
            break;
        case "menu":
            await menu.menu(bot,uid,req,data);
            break;
        case "dashboard":
            await domain.domainManage(bot,uid,req,data,{});
            return 0 ;
        case "register":
            await domain.reg(bot,uid,req,data,{});
            break;
        case "debug":
            break;
        default :
            break;
    }
}

async function callBackRouter(data,action,opts )
{
    const uid = (data.chat.id).toString();
    const req = tool.pathRouter(action);
    switch (req.command)
    {
        case "menu":
            await menu.menu(bot,uid,req,data);
            return 0 ;
            break;
        case "register_domain":
            await domain.reg(bot,uid,req,data,opts);
            break;
        case "register_confirm":
            await domain.regConfirm(bot,uid,req,data,opts);
            break;
        case "manage_domain":
            await domain.domainManage(bot,uid,req,data,opts);
            return 0 ;
            break;
        case "deleted_domain":
            await domain.deletedDomain(bot,uid,req,data,opts);
            return 0 ;
            break;
        case "deleted_domain_confirm":
            await domain.deletedDomainConfirm(bot,uid,req,data,opts);
            break;
        case "domain_edit_ln":
            await domain.editDomainLn(bot,uid,req,data,opts);
            break;
        case "empty":
            return null;
        case "close":
            break;
        default :
            await menu.unKnowRouter(bot,uid,req,data,opts);
            return 0 ;
            break;
    }
  bot.deleteMessage(opts.chat_id,opts.message_id);
}
async function init()
{
}

function getBot()
{
    return bot;
}

module.exports = {
    init,
    getBot
}