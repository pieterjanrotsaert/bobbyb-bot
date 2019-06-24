var discord = require('discord.js');
var bot = new discord.Client();

var globals = require("./globals")

var dc = require("./datacollection")


const token = globals.BOT_TOKEN;

var bobbyEnabled = {};

// Test Reader
bot.on('message', msg => {
    var content = msg.content.toLowerCase();

    // Misc. command stuff
    if(content.indexOf("<@" + globals.BOT_CLIENTID + ">") !== -1){

        if(bobbyEnabled[msg.guild.id] === undefined)
            bobbyEnabled[msg.guild.id] = true;

        if(content.indexOf("data") !== -1)
            dc.collectMessageCountData(msg);
        else if(content.indexOf("stfu") !== -1 || content.indexOf("shut up") !== -1 ){

            if(bobbyEnabled[msg.guild.id]){
                msg.channel.send("Ok, I'll hold my tongue.");
            }
            else {
                msg.channel.send("I'M ALREADY SHUTTING UP YOU FOOL!");
            }

            bobbyEnabled[msg.guild.id] = false;
        }
        else if(content.indexOf("speak")  !== -1 || content.indexOf("talk") !== -1 ){
            if(!bobbyEnabled[msg.guild.id])
                msg.channel.send("FREEDOM!");
            else 
                msg.channel.send("I'm already enabled you bastard.");
                
            bobbyEnabled[msg.guild.id] = true;
        }
        else 
            msg.channel.send("I do not recognize this command, mortal.");
    }
    else if(content.indexOf("bobby b") !== -1 || content.indexOf("bobbyb") !== -1 || content.indexOf("robert b") !== -1 || content.indexOf("baratheon") !== -1 ||
            content.indexOf("bobby-b") !== -1 || content.indexOf("bobby") !== -1 ){
        if(bobbyEnabled){
            var idx = Math.floor(Math.random() * globals.BOBBY_QUOTES.length);
            msg.channel.send(globals.BOBBY_QUOTES[idx]);
        }
    }
})

bot.login(token);