var discord = require('discord.js');
var bot = new discord.Client();

var globals = require("./globals")

var dc = require("./datacollection")


const token = globals.BOT_TOKEN;

// Test Reader
bot.on('message', msg => {
    var content = msg.content.toLowerCase();

    if(content.indexOf("<@" + globals.BOT_CLIENTID + ">") !== -1)
    {
        if(content.indexOf("data") !== -1)
            dc.collectMessageCountData(msg);
        else 
            msg.channel.send("I do not recognize this command, mortal.");
    }
})

bot.login(token);