import TablePage from "@/assets/table-page.png";
import TreeTable from "@/assets/tree-table.png";
import HomeEcharts from "@/assets/home-echarts.png";
import SearchModal from "@/assets/search-modal.png";

export const PNG_LIST = [
  {
    pageName: "table-page",
    title: "查询表格列表页",
    desc: "表单查询，表格展示",
    imgSrc: TablePage,
    templatePath: "table-page",
    destPath: "",
    btnLoading: false,
    type: "tree", // 单文件使用blob，文件夹使用tree
  },
  {
    pageName: "tree-table",
    title: "左侧查询树右表格",
    desc: "树选中与左侧表格联动",
    imgSrc: TreeTable,
    templatePath: "tree-table",
    destPath: "",
    btnLoading: false,
    type: "tree",
  },
  {
    pageName: "home-echarts",
    title: "首页图表",
    desc: "首页各类图表配置及交互",
    imgSrc: HomeEcharts,
    templatePath: "home-echarts",
    destPath: "",
    btnLoading: false,
    type: "tree",
  },
  {
    pageName: "search-modal",
    title: "搜索弹窗",
    desc: "带搜索功能的弹窗表格",
    imgSrc: SearchModal,
    templatePath: "search-modal",
    destPath: "",
    btnLoading: false,
    type: "tree",
  },
];
