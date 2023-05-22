import * as vscode from "vscode";
import * as path from "path";

export class WebAppPanel {
  public static currentPanel: WebAppPanel | undefined;

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (WebAppPanel.currentPanel) {
      WebAppPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      "pageTemplates",
      "页面模板展示",
      column || vscode.ViewColumn.One,
      getWebviewOptions(extensionUri)
    );

    WebAppPanel.currentPanel = new WebAppPanel(panel, extensionUri);
  }

  public static kill() {
    WebAppPanel.currentPanel?.dispose();
    WebAppPanel.currentPanel = undefined;
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    WebAppPanel.currentPanel = new WebAppPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: any) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      (e) => {
        if (this._panel.visible) {
          this._update();
        }
      },
      null,
      this._disposables
    );

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "copy":
            downloadFile(panel, message);
            break;
          case "login":
            panel.webview.postMessage({
              command: "login",
              message: true, // 设置了密码
            });
            break;
          default:
            break;
        }
      },
      null,
      this._disposables
    );

    // 页面销毁时，将注册的command取消掉
    this._disposables.push(
      vscode.commands.registerCommand(
        "pageTemplates.locationPage",
        (hrefId) => {
          panel.webview.postMessage({ command: "location", pageName: hrefId });
        }
      )
    );
  }

  public dispose() {
    WebAppPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private async _update() {
    const webview = this._panel.webview;
    this._panel.webview.html = this._getHtmlForWebview(webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist-web", "assets/index.css")
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist-web", "assets/index.js")
    );

    const baseUri = webview
      .asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "dist-web"))
      .toString()
      .replace("%22", "");

    return `<!DOCTYPE html>
    <html lang="en">
      <head>
      
        <meta charset="UTF-8">
       
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vite App</title>
        <script type="module" crossorigin src="${scriptUri}"></script>
        <link rel="stylesheet" href="${styleVSCodeUri}">
      </head>
      <body>
      <input hidden data-uri="${baseUri}">
        <div id="app"></div>
      </body>
    </html>`;
  }
}
function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
  return {
    // Enable javascript in the webview
    enableScripts: true,

    localResourceRoots: [
      vscode.Uri.joinPath(extensionUri, "assets"),
      vscode.Uri.joinPath(extensionUri, "media"),
      vscode.Uri.joinPath(extensionUri, "dist-web"),
    ],
  };
}

async function downloadFile(
  panel: vscode.WebviewPanel,
  message: { [name: string]: any }
) {
  try {
    const fs = require("fs");
    const { Gitlab } = require("@gitbeaker/node");

    const { templatePath, destPath, pageName, type } = message;
    const rootPath =
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length > 0
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : undefined;

    const fullDestPath = destPath ? `${rootPath}/${destPath}` : rootPath;

    // TODO 替换为自身模板代码所在的仓库地址
    const api = new Gitlab({
      host: "https://gitlab.com/",
      token: "4qvBAeWCXTnW6XcbrXuM",
    });

    // 文件夹处理
    const iterGetTreeList = async (
      path: string,
      filePathList: Array<string> = []
    ) => {
      const res = await api.Repositories.tree(
        694920, // project id
        {
          path, // 文件路径 srcPath
          ref: "main",
          // true
        }
      );

      for (let i = 0; i < res.length; i++) {
        const { type, path } = res[i];
        if (type === "blob") {
          filePathList.push(path);
        } else if (type === "tree") {
          await iterGetTreeList(path, filePathList);
        }
      }

      return filePathList;
    };

    const genPromiseAPI = (srcPath: string) => {
      return new Promise(async (resolve, reject) => {
        try {
          const res = await api.RepositoryFiles.show(
            694920, // project id
            srcPath, // 文件路径 srcPath
            "main" // 使用分支
          );
          resolve(res);
        } catch (e: any) {
          reject(e?.message || "从gitlab拉取文件失败!");
        }
      });
    };

    const writeFile = (contentList: Array<any>) => {
      return new Promise((resolve, reject) => {
        contentList.forEach((res: { [name: string]: any }) => {
          const { file_name, file_path, content } = res;
          const pathSplit = file_path.split("/"); // ['templates', .., '.vue']
          const pathLen = pathSplit.length;

          if (pathLen === 2) {
            // 文件
            fs.writeFileSync(`${fullDestPath}/${file_name}`, content, {
              encoding: "base64",
            });
          } else if (pathLen > 2) {
            // 文件夹
            const dirPath = pathSplit.slice(1, pathLen - 1).join("/");
            const fullPath = `${fullDestPath}/${dirPath}`;

            fs.exists(fullPath, (exists: boolean) => {
              if (exists) {
                vscode.window.showErrorMessage(
                  `${fullDestPath}/${dirPath}已存在`
                );
              } else {
                fs.mkdir(fullPath, { recursive: true }, (msg: any) => {
                  fs.writeFileSync(`${fullPath}/${file_name}`, content, {
                    encoding: "base64",
                  });
                });
              }
            });
          }
        });
        resolve(true);
      });
    };

    let filePathList: Array<string> = [];
    if (type === "blob") {
      filePathList = [`public/${templatePath}`]; // TODO 替换为自身的模板路径
    } else if (type === "tree") {
      // 文件夹下载
      filePathList = await iterGetTreeList(`public/${templatePath}`);
    }

    const downPromiseList: Array<any> = [];
    filePathList.forEach((filePath) => {
      downPromiseList.push(genPromiseAPI(filePath));
    });

    const fileContentList = await Promise.all(downPromiseList);

    writeFile(fileContentList)
      .then(() => {
        panel.webview.postMessage({
          command: "download_complete",
          pageName,
        });
      })
      .catch((error: any) => {
        throw new Error(error);
      });
  } catch (e: any) {
    panel.webview.postMessage({
      command: "download_error",
      name: message?.pageName,
      message: e?.message,
    });
  }
}
