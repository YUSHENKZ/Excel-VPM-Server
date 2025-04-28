import { Request, Response } from 'express';
import multer from 'multer';
export declare const upload: multer.Multer;
/**
 * 文件控制器，处理文件相关的API请求
 */
declare class FileController {
    /**
     * 获取文件列表
     * @param req Express请求对象
     * @param res Express响应对象
     */
    getFiles(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * 获取文件内容
     * @param req Express请求对象
     * @param res Express响应对象
     */
    getFileContent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * 上传文件
     * @param req Express请求对象
     * @param res Express响应对象
     */
    uploadFile(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
declare const _default: FileController;
export default _default;
