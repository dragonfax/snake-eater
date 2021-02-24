const Discord = require('discord.js');
const {
  prefix,
  token,
  channel_id,
  guild_id,
  filename
} = require('./config.json');
const ytdl = require('ytdl-core');
const { config } = require('process');
const moment = require('moment');

const songLengthSeconds = 60 + 49; // 1:49

var now = moment();
var listenersCount = 0;
var playingSong = false;

const client = new Discord.Client();
client.login(token);

var connection;
var dispatcher;

client.once('ready', async () => {
  console.log('Ready!');

  channel = client.channels.cache.get(channel_id)
  connection = await (channel.join());
  
  channel.members.each((member) => {
    if ( ! member.user.bot ) {
      listenersCount++;
    }
  });
  if ( listenersCount > 0 ) {
    console.log(`already ${listenersCount} member in channel.`)
    playSong();
  }

  console.log('voice connected');
});
client.once('reconnecting', () => {
  console.log('Reconnecting!');
});
client.once('disconnect', () => {
  console.log('Disconnect!');
});


client.on('voiceStateUpdate', (oldMemberState, newMemberState) => {

  // skip bots
  if ( newMemberState.member.user.bot ) {
    return;
  }

  if ( newMemberState.channelID == channel_id && oldMemberState.channelID != channel_id ) {
    // this user just joined the channel
    listenersCount++;
  }

  if ( newMemberState.channelID != channel_id && oldMemberState.channelID == channel_id ) {
    // this user just left the channel
    listenersCount--;
    if (listenersCount < 0 ) {
      listenersCount = 0;
    }
  }

  if ( listenersCount > 0 && ! playingSong ) {
    playSong();
  } else if ( listenersCount == 0 && playingSong && dispatcher ) {
    dispatcher.pause();
    dispatcher.destroy();
    playingSong = false;
  }

})

async function playSong() {

  playingSong = true;

  // when to start the playback at?
  var seconds = moment().diff(now, 'seconds');
  var skip = seconds % songLengthSeconds;

  dispatcher = connection
    .play(filename, { seek: skip })
    .on("finish", () => {
      if ( listenersCount > 0 ) {
        playSong();
      } else {
        playingSong = false;
      }
    })
    .on("error", error => { 
      console.error(error); 
      playingSong = false;
    });
}
