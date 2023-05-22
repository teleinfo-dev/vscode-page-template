import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class PageTemplateProvider
  implements vscode.TreeDataProvider<Dependency>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    Dependency | undefined | void
  > = new vscode.EventEmitter<Dependency | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> =
    this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string | undefined) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Dependency): Thenable<Dependency[]> {
    return Promise.resolve([
      new Dependency("查询表格列表页", vscode.TreeItemCollapsibleState.None, {
        command: "pageTemplates.locationPage",
        title: "查询表格列表页",
        arguments: ["table-page"],
      }),
      new Dependency("卡片式详情页", vscode.TreeItemCollapsibleState.None, {
        command: "pageTemplates.locationPage",
        title: "左查询树右表格页面",
        arguments: ["tree-table"],
      }),
      new Dependency("首页图表", vscode.TreeItemCollapsibleState.None, {
        command: "pageTemplates.locationPage",
        title: "首页图表页面",
        arguments: ["home-echarts"],
      }),
      new Dependency("查询弹窗", vscode.TreeItemCollapsibleState.None, {
        command: "pageTemplates.locationPage",
        title: "查询弹窗",
        arguments: ["search-modal"],
      }),
    ]);
  }
}

export class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    // private readonly version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
  }

  iconPath = {
    light: path.join(__filename, "..", "..", "media", "document.svg"),
    dark: path.join(__filename, "..", "..", "media", "document.svg"),
  };
}
