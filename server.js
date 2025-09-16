import  express from "express";
const app = express();

import crypto from 'crypto';
import http from "http";
import { Server } from "socket.io";

import path from 'path';
import { fileURLToPath } from 'url';
import db from './config/dynamoDB.js';

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
 
    try {
      // Save to DB
      const result = await db.saveMessage(
        message, data
      );
  
      socket.emit('messageResponse', { success: true, result });

      // Fetch updated student count
    const count = await db.fetchStudentCount();

    // Emit updated count to this client
    socket.emit('studentCount', { count });

    } catch (error) {
      console.error('Error saving log:', error);
      socket.emit('messageResponse', { success: false, error: error.message });
    }
  });
  
  socket.on('saveFormStructure', async (payload) => {
    const { id, formStructure, label } = payload;
  
    try {
      const result = await db.updateFormData(id, formStructure, label);
      socket.emit('formSavedResponse', { success: true, result });
    } catch (error) {
      socket.emit('formSavedResponse', {
        success: false,
        error: error.message || 'Unknown error'
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

//app.use('/', indexRoutes);

app.get('/', async (req, res) => {
const data = await db.getFormData();
  res.render('index', { data });
});

app.use(express.static('public'));
server.listen(4500, () => {
  console.log("Server is running on port 4500");
});