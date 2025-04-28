import express from 'express';
import configController from '../controllers/ConfigController';

const router = express.Router();

// 获取配置
router.get('/', configController.getConfig);

// 更新配置
router.put('/', configController.updateConfig);

export default router; 