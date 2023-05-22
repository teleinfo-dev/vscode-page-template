import * as vscode from "vscode";
import { WebAppPanel } from "./webAppPanel";

import { PageTemplateProvider } from "./pageTemplateProvider";

// active只会在插件初始化时执行一次
export function activate(context: vscode.ExtensionContext) {
  // 注册package.json中的contributes/commands命令
  const rootPath =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : undefined;

  const pageViewer = vscode.window.createTreeView("pageTemplates", {
    treeDataProvider: new PageTemplateProvider(rootPath),
  });

  pageViewer.onDidChangeVisibility((obj) => {
    if (obj.visible) {
      // treeview激活态时，总是打开预览webview
      vscode.commands.executeCommand("openWebview.template");
    }
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("openWebview.template", () => {
      WebAppPanel.createOrShow(context.extensionUri);
    })
  );
}

export function deactivate() {}
