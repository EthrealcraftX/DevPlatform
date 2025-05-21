# Debian asosidagi Node.js image ishlatiladi
FROM node:20

# Git va build tools'larni o‘rnatamiz
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    python3 \
    cmake \
 && apt-get clean

# Ishchi katalog
WORKDIR /app

# Repositoriyni klon qilamiz
RUN git clone https://github.com/EthrealcraftX/Minecraft-java-bedrock-Afk-bot-website.git

# Klon qilingan katalogga o‘tamiz
WORKDIR /app/Minecraft-java-bedrock-Afk-bot-website

# Paketlarni o‘rnatamiz (shu jumladan raknet-native ni ham)
COPY package.json ./
RUN npm install
# Ishga tushirish
CMD ["node", "server.js"]
