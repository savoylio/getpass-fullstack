const express = require('express');
const cors = require('cors'); // 引入 cors 包
const dotenv = require('dotenv');
const path = require('path');

// 引入我们在 Phase 1 创建的路由文件
// 确保你的 backend 目录下有 routes 文件夹，并且里面有 index.js
const routes = require('./routes'); 

// 读取环境变量
dotenv.config();

const app = express();

// ==========================================
// 1. 核心修复：强力 CORS 配置 (解决 403 问题)
// ==========================================
app.use(cors({
  origin: function (origin, callback) {
    // 允许没有 origin 的请求（比如 Postman 或后端直接调用）
    if (!origin) return callback(null, true);
    
    // 允许的前端域名白名单
    const allowedOrigins = [
      'http://localhost:3000', 
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin); // 方便调试
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
}));

// 2. 解析 JSON 请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. 挂载所有 API 路由
// 所有的 /auth, /exam, /questions 逻辑都在这里面
app.use('/api', routes);

// 基础健康检查接口
app.get('/', (req, res) => {
  res.send('GetPass API Server is Running (CORS Enabled)...');
});

// ==========================================
// 4. 启动服务器 (端口 5000)
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 API running at http://localhost:${PORT}`);
  console.log(`👉 CORS enabled for: localhost:3000, localhost:3001\n`);
});