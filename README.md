# 表格文件预览与数据可视化中间件

一个轻量级但功能强大的解决方案，可以帮助用户高效地预览、分析和可视化表格数据。

## 核心功能

1. **多格式表格文件预览**
   - 支持CSV、Excel、JSON等多种文件格式
   - 高效处理大型数据集
   - 提供虚拟滚动、排序、过滤等高级表格功能

2. **数据可视化**
   - 支持柱状图、折线图、饼图、散点图等多种图表类型
   - 提供灵活的数据字段映射机制
   - 支持自定义图表配置

3. **实时文件监控**
   - 自动监控指定目录的文件变化
   - 针对新增、更新和删除文件提供实时通知

4. **系统配置管理**
   - 提供系统配置的UI界面
   - 支持修改监控目录、文件类型、刷新间隔等

## 技术栈

- **前端**: Vue 3、TypeScript、Element Plus、TailwindCSS、ECharts
- **后端**: Node.js、Express、TypeScript、Socket.io

## 快速启动

本项目提供了一个自动化启动脚本`start.py`，可以一键启动前端和后端服务。

### 启动脚本功能

- 自动检测操作系统
- **自动下载和安装Node.js**（如果未安装）
- 安装必要的Node.js依赖
- 启动前端和后端服务
- 在不同操作系统下使用适当的终端

### 使用方法

1. 确保已安装Python 3.6或更高版本
2. 运行启动脚本：

```bash
python start.py
```

或在Windows系统下双击`start.py`文件运行。

> **注意**: 脚本会自动检测Node.js是否已安装，如果未安装，将自动下载并安装最新的LTS版本。此操作可能需要管理员权限。

### 服务访问

启动成功后，可以通过以下地址访问服务：

- 前端界面: [http://localhost:3000](http://localhost:3000)
- 后端API: [http://localhost:3001](http://localhost:3001)

## 手动启动

如果您不想使用自动启动脚本，也可以按以下步骤手动启动服务：

### 启动前端服务

```bash
cd frontend
npm install
npm run dev
```

### 启动后端服务

```bash
cd backend
npm install
npm run dev
```

## 环境要求

- Node.js v14或更高版本
- npm v6或更高版本
- 现代浏览器（Chrome、Firefox、Edge等）

## 项目结构

- `frontend/`: 前端项目代码
- `backend/`: 后端项目代码
- `start.py`: 自动启动脚本

## 许可证

本项目遵循MIT许可证。 