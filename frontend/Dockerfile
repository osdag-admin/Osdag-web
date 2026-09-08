FROM mirror.gcr.io/library/node:20.11.1-alpine3.19

WORKDIR /app

COPY package*.json /app/

RUN npm install && npm cache clean --force

COPY . /app

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]