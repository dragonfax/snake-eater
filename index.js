const Discord = require('discord.js');
const {
  prefix,
  token,
  channel_id,
  guild_id,
  filename
} = require('./config.json');
const ytdl = require('ytdl-core');


const client = new Discord.Client();
client.login(token);

var guild;

client.once('ready', () => {
  console.log('Ready!');

  startSong();


});
client.once('reconnecting', () => {
  console.log('Reconnecting!');
});
client.once('disconnect', () => {
  console.log('Disconnect!');
});

async function startSong() {

  var connection = await (client.channels.cache.get(channel_id).join());

  playSong(connection, filename)

}

async function playSong(connection, filename) {

  const dispatcher = connection
    .play(filename)
    .on("finish", () => {
      playSong(connection, filename);
    })
    .on("error", error => console.error(error));
  // dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  // serverQueue.textChannel.send(`Start playing: **${song.title}**`);

}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    // serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);

}

const queue = new Map();

async function execute(message, serverQueue) {
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }

  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };

  if (!serverQueue) {

  // Creating the contract for our queue
  const queueContruct = {
    textChannel: message.channel,
    voiceChannel: voiceChannel,
    connection: null,
    songs: [],
    volume: 5,
    playing: true,
  };
  // Setting the queue using our contract
  queue.set(message.guild.id, queueContruct);
  // Pushing the song to our songs array
  queueContruct.songs.push(song);

  try {
    // Here we try to join the voicechat and save our connection into our object.
    var connection = await voiceChannel.join();
    queueContruct.connection = connection;
    // Calling the play function to start a song
    play(message.guild, queueContruct.songs[0]);
  } catch (err) {
    // Printing the error message if the bot fails to join the voicechat
    console.log(err);
    queue.delete(message.guild.id);
    return message.channel.send(err);
  }

  } else {
      serverQueue.songs.push(song);
    console.log(serverQueue.songs);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }


}

client.on('message', async message => {

  if (message.author.bot) return;

  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}play`)) {
    execute(message, serverQueue);
    return;
  } else {
    message.channel.send("You need to enter a valid command!");
  }

})