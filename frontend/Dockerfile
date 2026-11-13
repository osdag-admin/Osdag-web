FROM mirror.gcr.io/library/node:22-alpine

WORKDIR /app

COPY package*.json /app/

RUN npm install && npm cache clean --force

COPY . /app

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]