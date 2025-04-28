import express from 'express';
import filesRoutes from './files';
import configRoutes from './config';

const router = express.Router();

// 文件相关路由
router.use('/files', filesRoutes);

// 配置相关路由
router.use('/config', configRoutes);

export default router; 