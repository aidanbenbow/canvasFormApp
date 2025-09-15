import  express from "express";
const app = express();

import http from "http";
import { Server } from "socket.io";

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://18.199.154.27", // ✅ Match frontend origin
    methods: ["GET", "POST"]
  }
});

import indexRoutes from './routes/index.js';

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use((req, res, next) => {
//   console.log(`[${req.method}] ${req.url}`);
//   next();
// });

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('log', async ({ message, data }) => {
    console.log(`[LOG] ${message}`);
    console.log('Received data:', data);

    // Simulate saving the message (replace with actual DB logic)
    try {
      const result = { saved: true, timestamp: Date.now(), data };
      socket.emit('messageResponse', { success: true, result });
    } catch (error) {
      socket.emit('messageResponse', { success: false, error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use('/', indexRoutes);
app.use(express.static('public'));
server.listen(4500, () => {
  console.log("Server is running on port 4500");
});