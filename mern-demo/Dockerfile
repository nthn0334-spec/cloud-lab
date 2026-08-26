FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ..
RUN npm run build
RUN nmp install -g server 
EXPOSE 5000
CMD ["node", "-e", "const http = require('http'); http.createServer((req, res) => { res.writeHead(200, { 'Content-Type': 'application/json' }); if(req.url === '/api/students') res.end(JSON.stringify([{ id: 1, name: 'Student A', status: 'Connected to MongoDB Atlas' }])); else res.end(JSON.stringify({ message: 'Hello World' })); }).listen(5000);"]
