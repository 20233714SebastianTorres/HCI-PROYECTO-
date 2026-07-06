import { io } from "socket.io-client";

const socket = io("https://hci-proyecto.onrender.com");

export default socket;