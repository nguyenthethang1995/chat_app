FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install && npm install -g vite
COPY . .
# RUN RUN ln -s /usr/local/lib/node_modules/ ../node_modules

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
