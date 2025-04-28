import express from 'express';
import fileController, { upload } from '../controllers/FileController';
import visualizationController from '../controllers/VisualizationController';

const router = express.Router();

// 文件列表
router.get('/', fileController.getFiles);

// 获取文件内容
router.get('/:id/content', fileController.getFileContent);

// 上传文件
router.post('/upload', upload.single('file'), fileController.uploadFile);

// 获取文件的可视化配置
router.get('/:id/visualizations', visualizationController.getVisualizations);

// 创建可视化配置
router.post('/:id/visualizations', visualizationController.createVisualization);

// 更新可视化配置
router.put('/:id/visualizations/:visId', visualizationController.updateVisualization);

// 删除可视化配置
router.delete('/:id/visualizations/:visId', visualizationController.deleteVisualization);

export default router;

 