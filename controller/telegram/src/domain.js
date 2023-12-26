const db = require("../../../utils/db");
const tg = require("../../../utils/tg");
const lan = require("../../../utils/lan")
const core = require("../../../utils/core");
const config = require("../../../config.json")

async function reg(bot,uid,req,data,opts)
{
    var text = lan.getText()
    let contentMessage = await bot.sendMessage(uid, text['placeHolder'][0], {
        parse_mode:'MarkDown',
        "reply_markup": {
            "force_reply": true
        }
    });
    listenerReply = (async (replyHandler) => {
            bot.removeReplyListener(listenerReply);
            await bot.deleteMessage(contentMessage.chat.id,contentMessage.message_id);
            await bot.deleteMessage(replyHandler.chat.id,replyHandler.message_id);
            var name = (replyHandler.text).toLowerCase();
            if((await db.getDomainByName(name)).length > 0)
            {
                //domain exsit
                return await tg.tryBotSendMessage(bot,uid,text['placeHolder'][1],{
                    parse_mode:'MarkDown',
                    disable_web_page_preview:"true",
                    reply_markup: JSON.stringify({
                      inline_keyboard:  [lan.backAndClose()]
                    })
                });
            }else{
                //new domain
                var finalText = ` *${name}${config.domain.defaultTLD}* & *${name}${config.domain.defaultLN}* ${text['register'][0]} ` 

                return await tg.tryBotSendMessage(bot,uid,finalText,{
                    parse_mode:'MarkDown',
                    disable_web_page_preview:"true",
                    reply_markup: JSON.stringify({
                    inline_keyboard:  lan.registerConfirm(name)
                    })
                });
            }
            
        });
      bot.onReplyToMessage(contentMessage.chat.id, contentMessage.message_id, listenerReply);
    return true ;

}

async function regConfirm(bot,uid,req,data,opts)
{
    if(req.params.length>0)
    {
        await db.newDomain(
            {
                uid:uid.toString(),
                name:req.params[0],
                tld:config.domain.defaultTLD,
                visit:config.domain.defaultLN,
                forward:{
                    ln:{},
                    nostr:{},
                    http:""
                },
                createTime:Date.now(),
            }
        )
        return domainManage(bot,uid,req,data,opts)
    }
}

async function domainManage(bot,uid,req,data,opts)
{
    var text = lan.getText()
    if(req.params.length>0)
    {
        var name = (req.params[0]).toLowerCase();
        const domain = await db.getDomainByName(name);
        if(domain.length>0 && domain[0]['uid'] == uid.toString())
        {
            var d= domain[0];
            var ln = d.forward.ln?.link || "NA"
            var nst = d.forward.nostr?.link || "NA"
            var http = d.forward.http || "NA"
            var finalText = `
*${text['domain'][0]} :*

\`${name}${config.domain.defaultLN}\`  &  \`${name}${config.domain.defaultTLD}\`

${text['domain'][1]} : \`${name}\`
${text['domain'][2]} : \`${ln}\`
${text['domain'][3]} : \`${nst}\`
${text['domain'][4]} : \`${http}\`
${text['domain'][5]} : \`${new Date(d.createTime).toLocaleString()}\`
            `
            return await tg.tryBotSendMessage(bot,uid,finalText,{
                parse_mode:'MarkDown',
                disable_web_page_preview:"true",
                reply_markup: JSON.stringify({
                inline_keyboard:lan.domainManage(name)
                })
            });
        }
    }else{
        const domains = await db.getDomainByUid(uid.toString());
        var finalText = text['domainList'][0];
        domains.forEach(d => {
            finalText +=`
${d.name}${config.domain.defaultLN}  &  ${d.name}${config.domain.defaultTLD}
`
        });
        return await tg.tryBotSendMessage(bot,uid,finalText,{
            parse_mode:'MarkDown',
            disable_web_page_preview:"true",
            reply_markup: JSON.stringify({
            inline_keyboard:lan.domainSelect(domains)
            })
        });
    }
}

async function deletedDomain(bot,uid,req,data,opts)
{
    if(req.params.length > 0)
    {
        const name = req.params[0]
        const domain = await db.getDomainByName(name);
        if(domain.length>0 && domain[0]['uid'] == uid.toString())
        {

        }else{
            return false; //It do not own the domain
        }
        //return the confirm menu
        var text = lan.getText()
        var finalText = `*${text['domainList'][1]}*
${text['domainList'][2]} \`${name}.${config.domain.defaultTLD}\` ${text['domainList'][3]}
${text['domainList'][4]}`
        var btn = lan.domainDeleted(name);
        return await tg.tryBotSendMessage(bot,uid,finalText,{
            parse_mode:'MarkDown',
            disable_web_page_preview:"true",
            reply_markup: JSON.stringify({
            inline_keyboard:btn
            })
        });
    }else
    {
        //require to input 

        var text = lan.getText()
        let contentMessage = await bot.sendMessage(uid, text['placeHolder'][5], {
            parse_mode:'MarkDown',
            "reply_markup": {
                "force_reply": true
            }
        });
        listenerReply = (async (replyHandler) => {
                bot.removeReplyListener(listenerReply);
                await bot.deleteMessage(contentMessage.chat.id,contentMessage.message_id);
                await bot.deleteMessage(replyHandler.chat.id,replyHandler.message_id);
                var name = (replyHandler.text).toLowerCase();
                var domain = await db.getDomainByName(name);
                if(domain.length>0 && domain[0]['uid'] == uid.toString())
                {
                    //new domain
                    var finalText = `*${text['domainList'][1]}*
${text['domainList'][2]} \`${name}${config.domain.defaultTLD}\` ${text['domainList'][3]}
${text['domainList'][4]}`
                    return await tg.tryBotSendMessage(bot,uid,finalText,{
                        parse_mode:'MarkDown',
                        disable_web_page_preview:"true",
                        reply_markup: JSON.stringify({
                        inline_keyboard:  lan.domainDeleted(name)
                        })
                    });
                }
            });
          bot.onReplyToMessage(contentMessage.chat.id, contentMessage.message_id, listenerReply);
        return true ;
    }
}

async function deletedDomainConfirm(bot,uid,req,data,opts)
{
    if(req.params.length > 0)
    {
        var text = lan.getText()
        var name = (req.params[0]).toLowerCase();
        var domain = await db.getDomainByName(name);
        if(domain.length>0 && domain[0]['uid'] == uid.toString())
        {
            await db.delDomain(name,uid);
            var finalText = `⚠️ \`${name}${config.domain.defaultTLD}\` *${text['domainList'][5]}*`
            return await tg.tryBotSendMessage(bot,uid,finalText,{
                parse_mode:'MarkDown',
                disable_web_page_preview:"true",
                reply_markup: JSON.stringify({
                inline_keyboard:[lan.backAndClose()]
                })
            });
        }else{
            return false; //It do not own the domain
        }
    }
}

async function editDomainLn(bot,uid,req,data,opts)
{
    if(req.params.length>0)
    {
        const name = req.params[0]
        if(!(await db.verfiDomainOwning(uid,name)))
        {
            return false;
        }
        var text = lan.getText()
        let contentMessage = await bot.sendMessage(uid, text['placeHolder'][2], {
            parse_mode:'MarkDown',
            "reply_markup": {
                "force_reply": true
            }
        });
        listenerReply = (async (replyHandler) => {
                bot.removeReplyListener(listenerReply);
                await bot.deleteMessage(contentMessage.chat.id,contentMessage.message_id);
                await bot.deleteMessage(replyHandler.chat.id,replyHandler.message_id);
                
                var data = (replyHandler.text).toLowerCase();
                var update = await core.newRecord(uid,name,data)
                console.log(update)
                if(update)
                {
                    var finalText = `*${text['domain'][6]}*`
                    return await tg.tryBotSendMessage(bot,uid,finalText,{
                        parse_mode:'MarkDown',
                        disable_web_page_preview:"true",
                        reply_markup: JSON.stringify({
                        inline_keyboard:  [lan.backAndClose()]
                        })
                    });
                }
            });
          bot.onReplyToMessage(contentMessage.chat.id, contentMessage.message_id, listenerReply);
        return true ;
    }
}

async function editDomainNostr(bot,uid,req,data,opts)
{
    if(req.params.length>0)
    {
        const name = req.params[0]
        if(!(await db.verfiDomainOwning(uid,name)))
        {
            return false;
        }
        var text = lan.getText()
        let contentMessage = await bot.sendMessage(uid, text['placeHolder'][2], {
            parse_mode:'MarkDown',
            "reply_markup": {
                "force_reply": true
            }
        });
        listenerReply = (async (replyHandler) => {
                bot.removeReplyListener(listenerReply);
                await bot.deleteMessage(contentMessage.chat.id,contentMessage.message_id);
                await bot.deleteMessage(replyHandler.chat.id,replyHandler.message_id);
                
                var data = (replyHandler.text).toLowerCase();
                var update = await core.newNip05(uid,name,data)
                console.log(update)
                if(update)
                {
                    var finalText = `*${text['domain'][6]}*`
                    return await tg.tryBotSendMessage(bot,uid,finalText,{
                        parse_mode:'MarkDown',
                        disable_web_page_preview:"true",
                        reply_markup: JSON.stringify({
                        inline_keyboard:  [lan.backAndClose()]
                        })
                    });
                }
            });
          bot.onReplyToMessage(contentMessage.chat.id, contentMessage.message_id, listenerReply);
        return true ;
    }
}
module.exports = {
    reg,
    regConfirm,
    domainManage,
    deletedDomain,
    deletedDomainConfirm,
    editDomainLn,
    editDomainNostr
}