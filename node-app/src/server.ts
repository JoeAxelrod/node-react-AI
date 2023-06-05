import express from 'express';
import authRoutes from './routes/auth';
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import routes from './routes/index';  // import the routes
import { initSockets } from './socket';
import dotenv from 'dotenv';
import mongoose from "mongoose";


dotenv.config();
const app = express();

export const httpServer = createServer(app);

export const io = new Server(httpServer, {
    cors: {
        origin: process.env.ACCESS_CONTROL_ALLOW_ORIGIN
    }
});

initSockets(io);

app.use('/', routes);
app.use('/auth', authRoutes);


const PORT = process.env.PORT;

httpServer.listen(PORT, async () => {
    console.log(`Server running at http://localhost:${PORT}`);

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost/test');
});
