import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { WebSocketServer } from "ws";
import { start as startCronJobs } from "./cronjobs/index.js";
import applicationRoute from "./routes/ApplicationRoute.js";
import authRoute from "./routes/AuthRoute.js";
import bookingRoute from "./routes/BookingRoute.js";
import chatRoute from "./routes/ChatRoute.js";
import listingRoute from "./routes/ListingRoute.js";
import userRoute from "./routes/UserRoute.js";
import advertisementRoute from "./routes/testAdvertisements.js";

dotenv.config();

const { MONGODB_URL, PORT, DB_NAME, DB_NAME_QA } = process.env;
const app = express();

// middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

//mount controllers
app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/listings", listingRoute);
app.use("/applications", applicationRoute);
app.use("/bookings", bookingRoute);
app.use("/chat", chatRoute);
app.use("/api/advertisements", advertisementRoute);

startCronJobs();

mongoose
  .connect(MONGODB_URL, {
    dbName: DB_NAME,
  })
  .then(() => console.log("MongoDB is connected successfully"))
  .catch((err) => console.error(err));

const server = app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

const wss = new WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  connection.isAlive = true;
  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      connection.terminate();
    }, 1000);
  }, 5000);
  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });
  const cookies = req.headers.cookie.split(";");
  cookies.forEach((c, index, cookies) => {
    cookies[index] = c.trim();
  });
  const chatCookie = cookies.find((c) => c.startsWith("leasyChat"));
  const identifier = chatCookie?.split("=");
  if (identifier) {
    const senderId = identifier[identifier.indexOf("leasyChat") + 1].split(":")[1];
    const recipientId = identifier[identifier.indexOf("leasyChat") + 2].split(":")[1];
    const origin = identifier[identifier.indexOf("leasyChat") + 3].split(":")[1];
    connection.senderId = senderId;
    connection.recipientId = recipientId;
    connection.origin = origin;
    console.log([...wss.clients].map((c) => `${c.senderId} ${c.recipientId} ${c.origin}`));
  }
  connection.on("message", (message) => {
    const messageData = JSON.parse(message.toString());
    const { sender, recipient } = messageData;
    let lastOrigin = "";
    let clients = [];
    [...wss.clients].filter(
      (c) => c.senderId === recipient && c.recipientId === sender
    ).forEach((c) => {
      if (c.origin !== lastOrigin) {
        lastOrigin = c.origin;
        clients.push(c);
      }
    });
    if (clients) {
      // online, send the message over wss
      clients.forEach((c)=>{c.send(JSON.stringify(messageData))});
    }
  });
});
