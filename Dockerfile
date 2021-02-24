FROM node

WORKDIR /app

RUN apt-get update
RUN apt-get install -y ffmpeg

# dependnecies
COPY package-lock.json /app
# RUN npm install discord.js ffmpeg fluent-ffmpeg @discordjs/opus ytdl-core --save
RUN npm install

COPY snake_eater.mp4 /app

COPY index.js /app
COPY config.json /app

CMD node index.js