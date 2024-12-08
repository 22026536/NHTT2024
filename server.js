import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import express, { json } from "express";
import session from 'express-session';
import path from "path";
import { fileURLToPath } from 'url';
import api from "./api/user/index.js";
import corMw from "./middlewares/cors.js";
const app = express();
app.use(corMw);

import { adminApi } from "./api/admin/index.js";

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Bỏ secure nếu không dùng HTTPS
}));

config();

const PORT = 7777;

// Tạo __dirname và __filename trong môi trường ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../backend');


//set up
app.use(express.urlencoded({ extended: true }))
app.use(json());
app.use(cookieParser());
app.set('trust proxy', 1)
// app.options('*', corMw);

app.use(cors())

app.use(express.static(path.join(distPath, 'dist'))); // Hoặc 'build'

// tạo api
app.use('/api', api);

adminApi(app);

// Route for the main app
app.get('/', (req, res) => {
  res.sendFile(path.resolve(distPath, 'dist', 'index.html')); // Serve main index.html
});

// Route for the admin app
app.get('/admin', (req, res) => {
  res.sendFile(path.resolve(distPath, 'dist', 'admin.html')); // Serve admin admin.html
});

// Các route khác sẽ trả về index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'dist', 'index.html')); // Chuyển đổi thành đường dẫn tuyệt đối
});

app.listen(PORT, () => {
  console.log("Server is listening port " + PORT);
})