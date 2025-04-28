import { h } from 'vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

// 为了兼容旧代码，创建桥接函数
const createIconBridge = (IconComponent: any) => {
  return () => h(IconComponent);
};

// 基础图标 - 保持API兼容以支持旧代码
export const IconHome = createIconBridge(ElementPlusIconsVue.HomeFilled);
export const IconFolder = createIconBridge(ElementPlusIconsVue.Folder);
export const IconFolderOpened = createIconBridge(ElementPlusIconsVue.FolderOpened);
export const IconDocument = createIconBridge(ElementPlusIconsVue.Document);
export const IconSetting = createIconBridge(ElementPlusIconsVue.Setting);
export const IconArrowLeft = createIconBridge(ElementPlusIconsVue.ArrowLeft);
export const IconArrowRight = createIconBridge(ElementPlusIconsVue.ArrowRight);
export const IconMoon = createIconBridge(ElementPlusIconsVue.Moon);
export const IconSunny = createIconBridge(ElementPlusIconsVue.Sunny);
export const IconTime = createIconBridge(ElementPlusIconsVue.Clock);
export const IconBack = createIconBridge(ElementPlusIconsVue.Back);
export const IconSave = createIconBridge(ElementPlusIconsVue.Download);
export const IconRefresh = createIconBridge(ElementPlusIconsVue.Refresh);
export const IconFullScreen = createIconBridge(ElementPlusIconsVue.FullScreen);
export const IconDownload = createIconBridge(ElementPlusIconsVue.Download);
export const IconEdit = createIconBridge(ElementPlusIconsVue.Edit);
export const IconView = createIconBridge(ElementPlusIconsVue.View);
export const IconUpload = createIconBridge(ElementPlusIconsVue.Upload);

// 可视化相关图标
export const IconPieChart = createIconBridge(ElementPlusIconsVue.PieChart);
export const IconDataLine = createIconBridge(ElementPlusIconsVue.DataLine);
export const IconDataAnalysis = createIconBridge(ElementPlusIconsVue.DataAnalysis);
export const IconDataBoard = createIconBridge(ElementPlusIconsVue.DataBoard);

// 导出默认对象
export default {
  IconHome,
  IconFolder,
  IconFolderOpened,
  IconDocument,
  IconSetting,
  IconArrowLeft,
  IconArrowRight,
  IconMoon,
  IconSunny,
  IconTime,
  IconBack,
  IconSave,
  IconRefresh,
  IconFullScreen,
  IconDownload,
  IconEdit,
  IconView,
  IconUpload,
  IconPieChart,
  IconDataLine,
  IconDataAnalysis,
  IconDataBoard
}; 