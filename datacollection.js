import { Message } from "discord.js";

var fs = require("fs")


function fetchAllMessages(list, channel, before, onComplete){
    channel.fetchMessages({ limit: 100, before: before }).then(messages => {
        var next = null;
        messages.forEach((message) => { 
            list.push(message)
            next = message;
        });
        if(next)
            fetchAllMessages(list, channel, next.id, onComplete);
        else 
            onComplete();
    });
}

function getDayDate(msg){
    return new Date(msg.createdAt.getFullYear(), msg.createdAt.getMonth(), msg.createdAt.getDate());
}

function collectMessageCountData(commandMsg){

    commandMsg.channel.send("I will begin collecting data from all channels in this server. \nYou will be notified when my work is complete.");

    var messages = [];
    var channelsDone = {};

    commandMsg.guild.channels.forEach((channel) => { 
        if(channel.type == "text"){ 
            channelsDone[channel.id] = false; 
        }
    })

    commandMsg.guild.channels.forEach((channel) => {
        if(channel.type == "text"){

            channel.fetchMessages({ limit: 1 }).then((lastMsgs) => {
                var lastMsg = null;
                lastMsgs.forEach((v) => { lastMsg = v; });

                if(lastMsg){
                    console.log("Fetching messages from '" + channel.name + "'..")
    
                    var channelMessages = [];
                    channelMessages.push(lastMsg);
    
                    fetchAllMessages(channelMessages, channel, lastMsg.id, () => {
                        console.log("Collected " + (channelMessages.length) + " messages from channel '" + channel.name + "'.");
                        commandMsg.channel.send("Data collection in progress: collected " + channelMessages.length + " messages from channel '" + channel.name + "'.");
    
                        for(var i in channelMessages)
                            messages.push(channelMessages[i]);
    
                        channelsDone[channel.id] = true;
                        
                        let allDone = true;
                        for(var k in channelsDone){
                            if(!channelsDone[k]){
                                allDone = false;
                                break;
                            }
                        }
    
                        if(allDone){
                            console.log("==== ALL DONE (" + messages.length + " messages collected) ===");
                            commandMsg.channel.send("Done. Total messages collected: " + messages.length + ".");
                            processMessages(messages, commandMsg);
                        }
    
                    })
                }
                else {
                    channelsDone[channel.id] = true;
                    console.log("Channel '" + channel.name + "' is empty!");
                }
            })
        }
    });
}

function processMessages(messages, commandMsg){
    
    var data = {};
    var users = {};

    for(var i in messages){
        var day = new Date(messages[i].createdAt.getFullYear(), messages[i].createdAt.getMonth(), messages[i].createdAt.getDate());
        var mon = new Date(messages[i].createdAt.getFullYear(), messages[i].createdAt.getMonth())
        var week = day;
        var dayOfWeek = day.getDay() == 0 ? 6 : day.getDay() - 1; // Day of week, starting at monday instead of sunday
        week.setDate(day.getDate() - dayOfWeek);

        var date = mon; // Change this to 'day' or 'week' if you want the data grouped per day or week.
        var dateId = date.valueOf(); 

        if(!users[messages[i].author.id])
            users[messages[i].author.id] = messages[i].author.username;

        if(!data[dateId])
            data[dateId] = { users: {}, date: date }

        if(!data[dateId].users[messages[i].author.id])
            data[dateId].users[messages[i].author.id] = { count: 0, charcount: 0 }

        data[dateId].users[messages[i].author.id].count++;
        data[dateId].users[messages[i].author.id].charcount += messages[i].content ? messages[i].content.length : 1;
    }

    var sorted = [];
    for(var i in data)
        sorted.push(data[i]);

    sorted.sort((a, b) => a.date.valueOf() - b.date.valueOf());

    var csv = "month";

    for(var k in users){
        csv += "," + users[k];
    }
    csv += "\r\n";

    for(var i in sorted){
        csv += "" + sorted[i].date.getDate() + "-" + (sorted[i].date.getMonth() + 1) + "-" + sorted[i].date.getFullYear();
        for(var k in users){
            if(!sorted[i].users[k])
                csv += ",0";
            else 
                csv += "," + sorted[i].users[k].charcount;
        }
        csv += "\r\n";
    }

    commandMsg.channel.send("My lord <@" + commandMsg.author.id + ">, may I present the outcome of your inquiry:", {
        files: [{
            attachment: new Buffer(csv),
            name: "data_" + commandMsg.guild.name + ".csv"
        }]
    })
}

module.exports = {
    collectMessageCountData
}
