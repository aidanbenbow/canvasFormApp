// socketClient.js
import { io } from "https://cdn.jsdelivr.net/npm/socket.io-client@4.7.2/+esm";


//const socket = io("http://localhost:4500"); // Replace with your server URL
const socket = io(); // ✅ Include port if backend is on 4500
socket.on('connect', () => {
  console.log('Connected to WebSocket server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});

export default socket;