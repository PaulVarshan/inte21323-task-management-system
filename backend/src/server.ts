import app from "./app";
import { initSocket } from "./utils/socket";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.IO with the running server
initSocket(server);

server.on('error', (err) => {
    console.error("SERVER ERROR:", err);
});

