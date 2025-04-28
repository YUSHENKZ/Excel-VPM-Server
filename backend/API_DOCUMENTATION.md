# 表格文件预览与数据可视化中间件 API 文档

本文档详细描述了后端服务提供的所有 API 端点，包括请求格式、参数说明和响应结构。

## 目录

- [基础信息](#基础信息)
- [通用响应格式](#通用响应格式)
- [健康检查](#健康检查)
- [文件操作](#文件操作)
  - [获取文件列表](#获取文件列表)
  - [获取文件内容](#获取文件内容)
  - [上传文件](#上传文件)
- [可视化配置](#可视化配置)
  - [获取可视化配置](#获取可视化配置)
  - [创建可视化配置](#创建可视化配置)
  - [更新可视化配置](#更新可视化配置)
  - [删除可视化配置](#删除可视化配置)
- [系统配置](#系统配置)
  - [获取系统配置](#获取系统配置)
  - [更新系统配置](#更新系统配置)
- [WebSocket 实时通信](#websocket-实时通信)
  - [连接建立](#连接建立)
  - [事件类型](#事件类型)
- [API 实现状态](#api-实现状态)
  - [当前支持的功能](#当前支持的功能)
  - [已知限制](#已知限制)
  - [计划功能](#计划功能)

## 基础信息

- **基础URL**: `http://localhost:3001`
- **API前缀**: `/api`
- **认证方式**: 当前版本无需认证

## 通用响应格式

所有 API 响应均使用以下统一格式：

```json
{
  "code": 200,        // 状态码：200成功，4xx客户端错误，5xx服务器错误
  "message": "操作成功", // 状态描述
  "data": {}           // 响应数据（可能是对象、数组或null）
}
```

## 健康检查

### 获取服务健康状态

检查服务是否正常运行。

- **URL**: `/api/health`
- **方法**: `GET`
- **URL参数**: 无
- **请求体**: 无

**成功响应示例**:

```json
{
  "status": "UP",
  "timestamp": "2025-04-25T15:39:27.892Z"
}
```

## 文件操作

### 获取文件列表

获取指定目录下的所有文件和子目录。

- **URL**: `/api/files`
- **方法**: `GET`
- **URL参数**:
  - `path=[string]` (可选): 要列出内容的目录路径，默认为配置的数据目录
  - `includeSubdirectories=[boolean]` (可选): 是否包含子目录，默认为true

**成功响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": "L3VwbG9hZHMvc2FtcGxlLmNzdg==",  // Base64编码的文件路径
      "name": "sample.csv",
      "path": "/uploads/sample.csv",
      "type": "csv",
      "size": 1024,
      "lastModified": "2025-04-25T15:39:27.892Z",
      "isDirectory": false
    },
    {
      "id": "L3VwbG9hZHMvZGF0YQ==",
      "name": "data",
      "path": "/uploads/data",
      "type": "directory",
      "size": 0,
      "lastModified": "2025-04-25T15:30:00.000Z",
      "isDirectory": true
    }
  ]
}
```

### 获取文件内容

获取指定文件的解析后数据。

- **URL**: `/api/files/:id/content`
- **方法**: `GET`
- **URL参数**:
  - `id=[string]`: 文件ID (Base64编码的文件路径)
- **请求体**: 无

**成功响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "headers": [
      {
        "key": "name",
        "label": "name",
        "type": "string",
        "sortable": true,
        "filterable": true
      },
      {
        "key": "age",
        "label": "age",
        "type": "number",
        "sortable": true,
        "filterable": true
      }
    ],
    "rows": [
      { "name": "张三", "age": 30 },
      { "name": "李四", "age": 25 }
    ],
    "metadata": {
      "fileName": "sample.csv",
      "fileType": "csv",
      "lastModified": "2025-04-25T15:39:27.892Z",
      "rowCount": 2,
      "filePath": "/uploads/sample.csv",
      "fileSize": 1024
    }
  }
}
```

### 上传文件

上传一个新文件到服务器。

- **URL**: `/api/files/upload`
- **方法**: `POST`
- **Content-Type**: `multipart/form-data`
- **请求参数**:
  - `file`: 要上传的文件

**成功响应示例**:

```json
{
  "code": 201,
  "message": "文件上传成功",
  "data": {
    "id": "L3VwbG9hZHMvc2FtcGxlLWFiYzEyMy5jc3Y=",
    "name": "sample-abc123.csv",
    "path": "/uploads/sample-abc123.csv",
    "type": "csv",
    "size": 1024,
    "lastModified": "2025-04-25T15:45:00.000Z",
    "isDirectory": false
  }
}
```

**错误响应示例**:

```json
{
  "code": 400,
  "message": "未提供文件",
  "data": null
}
```

## 可视化配置

### 获取可视化配置

获取指定文件的所有可视化配置。

- **URL**: `/api/files/:id/visualizations`
- **方法**: `GET`
- **URL参数**:
  - `id=[string]`: 文件ID (Base64编码的文件路径)
- **请求体**: 无

**成功响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": "vis-123456",
      "name": "年龄分布图",
      "type": "bar",
      "dataMapping": {
        "x": "name",
        "y": "age"
      },
      "options": {
        "title": "用户年龄分布",
        "xAxisLabel": "姓名",
        "yAxisLabel": "年龄"
      }
    }
  ]
}
```

### 创建可视化配置

为指定文件创建新的可视化配置。

- **URL**: `/api/files/:id/visualizations`
- **方法**: `POST`
- **URL参数**:
  - `id=[string]`: 文件ID (Base64编码的文件路径)
- **请求体**:

```json
{
  "name": "收入分布图",
  "type": "pie",
  "dataMapping": {
    "x": "category",
    "y": "value"
  },
  "options": {
    "title": "收入分类统计",
    "legend": true
  }
}
```

**成功响应示例**:

```json
{
  "code": 201,
  "message": "可视化配置已创建",
  "data": {
    "id": "vis-789012",
    "name": "收入分布图",
    "type": "pie",
    "dataMapping": {
      "x": "category",
      "y": "value"
    },
    "options": {
      "title": "收入分类统计",
      "legend": true
    }
  }
}
```

### 更新可视化配置

更新指定文件的特定可视化配置。

- **URL**: `/api/files/:id/visualizations/:visId`
- **方法**: `PUT`
- **URL参数**:
  - `id=[string]`: 文件ID (Base64编码的文件路径)
  - `visId=[string]`: 可视化配置ID
- **请求体**:

```json
{
  "name": "收入分布图（更新版）",
  "type": "pie",
  "dataMapping": {
    "x": "category",
    "y": "value"
  },
  "options": {
    "title": "收入分类统计",
    "legend": true,
    "theme": "dark"
  }
}
```

**成功响应示例**:

```json
{
  "code": 200,
  "message": "可视化配置已更新",
  "data": {
    "id": "vis-789012",
    "name": "收入分布图（更新版）",
    "type": "pie",
    "dataMapping": {
      "x": "category",
      "y": "value"
    },
    "options": {
      "title": "收入分类统计",
      "legend": true,
      "theme": "dark"
    }
  }
}
```

### 删除可视化配置

删除指定文件的特定可视化配置。

- **URL**: `/api/files/:id/visualizations/:visId`
- **方法**: `DELETE`
- **URL参数**:
  - `id=[string]`: 文件ID (Base64编码的文件路径)
  - `visId=[string]`: 可视化配置ID
- **请求体**: 无

**成功响应示例**:

```json
{
  "code": 200,
  "message": "可视化配置已删除",
  "data": null
}
```

## 系统配置

### 获取系统配置

获取当前系统配置。

- **URL**: `/api/config`
- **方法**: `GET`
- **URL参数**: 无
- **请求体**: 无

**成功响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "fileWatching": {
      "directories": ["./data", "./uploads"],
      "fileTypes": [".csv", ".xlsx", ".json"],
      "watchInterval": 5000
    },
    "visualization": {
      "defaultChartType": "bar",
      "colorScheme": "default",
      "autoRefresh": true,
      "refreshInterval": 30000
    },
    "ui": {
      "theme": "light",
      "language": "zh-CN",
      "tableSettings": {
        "pageSize": 50,
        "enableSearch": true
      }
    }
  }
}
```

### 更新系统配置

更新系统配置。

- **URL**: `/api/config`
- **方法**: `PUT`
- **URL参数**: 无
- **请求体**:

```json
{
  "fileWatching": {
    "directories": ["./data", "./uploads", "./custom"],
    "fileTypes": [".csv", ".xlsx", ".json"],
    "watchInterval": 10000
  },
  "visualization": {
    "defaultChartType": "line",
    "colorScheme": "dark",
    "autoRefresh": true,
    "refreshInterval": 60000
  },
  "ui": {
    "theme": "dark",
    "language": "zh-CN",
    "tableSettings": {
      "pageSize": 100,
      "enableSearch": true
    }
  }
}
```

**成功响应示例**:

```json
{
  "code": 200,
  "message": "配置已更新",
  "data": {
    "fileWatching": {
      "directories": ["./data", "./uploads", "./custom"],
      "fileTypes": [".csv", ".xlsx", ".json"],
      "watchInterval": 10000
    },
    "visualization": {
      "defaultChartType": "line",
      "colorScheme": "dark",
      "autoRefresh": true,
      "refreshInterval": 60000
    },
    "ui": {
      "theme": "dark",
      "language": "zh-CN",
      "tableSettings": {
        "pageSize": 100,
        "enableSearch": true
      }
    }
  }
}
```

## WebSocket 实时通信

### 连接建立

WebSocket服务通过Socket.io提供，客户端可以使用以下配置连接：

```javascript
const socket = io({
  path: '/socket.io',
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 3000
});
```

### 事件类型

系统提供以下实时事件：

#### 1. 文件变化事件：`file-change`

当监控目录中的文件发生变化时，服务器会推送此事件。

**事件数据格式**:

```json
{
  "type": "add|change|unlink",  // 变化类型：新增、修改、删除
  "path": "/uploads/sample.csv", // 文件路径
  "timestamp": "2025-04-25T15:50:00.000Z" // 变化时间
}
```

#### 2. 配置变化事件：`config-change`

当系统配置被更新时，服务器会推送此事件。

**事件数据格式**:

```json
{
  "timestamp": "2025-04-25T15:55:00.000Z",
  "config": {
    // 完整的系统配置对象
  }
}
```

#### 3. 可视化配置变化事件：`visualization-change`

当文件的可视化配置发生变化时，服务器会推送此事件。

**事件数据格式**:

```json
{
  "type": "create|update|delete",  // 变化类型：创建、更新、删除
  "fileId": "L3VwbG9hZHMvc2FtcGxlLmNzdg==", // 文件ID
  "visualizationId": "vis-123456",  // 可视化配置ID（仅用于更新和删除）
  "timestamp": "2025-04-25T16:00:00.000Z", // 变化时间
  "config": {
    // 仅用于创建和更新事件
    // 完整的可视化配置对象
  }
}
```

## API 实现状态

### 当前支持的功能

以下 API 功能已完全实现并可以使用：

1. **文件操作**
   - 获取文件列表 (`GET /api/files`)
   - 获取文件内容 (`GET /api/files/:id/content`)
   - 上传文件 (`POST /api/files/upload`)

2. **系统配置**
   - 获取系统配置 (`GET /api/config`)
   - 更新系统配置 (`PUT /api/config`)

3. **WebSocket 实时通信**
   - 文件变化事件 (`file-change`)
   - 文件列表更新事件 (`file-list-updated`)

### 已知限制

当前 API 实现有以下已知限制：

1. **文件操作**
   - 下载文件功能需要通过前端使用浏览器原生下载机制实现，目前没有专门的下载 API
   - 文件重命名、移动和复制功能尚未完全实现
   - 大文件（>50MB）上传可能会遇到性能问题

2. **可视化配置**
   - 可视化配置的 API 端点存在，但后端数据持久化尚未完全实现
   - 复杂的可视化配置可能需要前端进行额外处理

3. **安全性**
   - 当前版本不包含用户认证和授权功能
   - 没有针对路径遍历攻击的全面防护

### 计划功能

在未来的版本中计划添加以下功能：

1. **文件操作增强**
   - 文件夹创建 API
   - 文件/文件夹删除 API
   - 文件/文件夹重命名 API
   - 专用文件下载 API

2. **安全增强**
   - 用户认证和授权
   - 文件访问权限控制
   - API 请求限流

3. **高级功能**
   - 文件内容搜索
   - 批量文件操作
   - 文件格式自动检测和转换

请注意，当前 API 文档描述了系统的理想状态，部分功能可能仍在开发中。使用前请通过健康检查 API 确认服务状态。

## 数据模型参考

### TableData

表格数据模型，包含表头、数据行和元数据。

```typescript
interface TableData {
  headers: Array<TableHeader>; // 表头信息
  rows: Array<Record<string, any>>; // 数据行
  metadata: TableMetadata; // 元数据
}

interface TableHeader {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
}

interface TableMetadata {
  fileName: string;
  fileType: string;
  lastModified: Date;
  rowCount: number;
  filePath?: string;
  fileSize?: number;
}
```

### VisualizationConfig

可视化配置模型，定义图表类型和数据映射关系。

```typescript
interface VisualizationConfig {
  id?: string;
  name: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'custom';
  dataMapping: {
    x?: string;
    y?: string | string[];
    series?: string;
    size?: string;
    color?: string;
  };
  options: Record<string, any>; // 特定图表类型的配置选项
}
```

### SystemConfig

系统配置模型，包含文件监控、可视化和UI相关设置。

```typescript
interface SystemConfig {
  fileWatching: {
    directories: string[];
    fileTypes: string[];
    watchInterval: number;
  };
  visualization: {
    defaultChartType: string;
    colorScheme: string;
    autoRefresh: boolean;
    refreshInterval: number;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    tableSettings: {
      pageSize: number;
      enableSearch: boolean;
    };
  };
}
```

### FileInfo

文件信息模型，描述文件或目录的基本属性。

```typescript
interface FileInfo {
  id: string; // Base64编码的文件路径
  name: string;
  path: string;
  type: string;
  size: number;
  lastModified: Date;
  isDirectory: boolean;
}
``` 