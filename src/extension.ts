import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

  // ----- 0) Compile 現在のファイル -----
  context.subscriptions.push(
    vscode.commands.registerCommand('mystia.compile', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor to compile.');
        return;
      }
      const filePath = editor.document.fileName;
      const term = vscode.window.createTerminal('Mystia Compile');
      term.show();
      // cargo run <filePath>
      term.sendText(`cd ./mystia`);
      term.sendText(`cargo run ${quotePath(filePath)}`);
    })
  );

  // ----- 1) Debug 現在のファイル -----
  context.subscriptions.push(
    vscode.commands.registerCommand('mystia.debug', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor to debug.');
        return;
      }
      const filePath = editor.document.fileName;
      const term = vscode.window.createTerminal('Mystia Debug');
      term.show();
      // cargo run <filePath>
      term.sendText(`cd ./mystia`);
      term.sendText(`node run.mjs ${quotePath(filePath)}`);
    })
  );

  // ----- 2) 環境構築 -----
  context.subscriptions.push(
    vscode.commands.registerCommand('mystia.setupEnv', () => {
      const term = vscode.window.createTerminal('Mystia Env Setup');
      term.show();

      // (1) リポジトリがなければ git clone、あれば git pull
      // (2) wasm ディレクトリへ移動して wasm-pack build → 出力を移動
      // ※workspaceFolder を使う場合は `${vscode.workspace.workspaceFolders![0].uri.fsPath}` を付与しても可
      term.sendText(
        `if [ ! -d mystia ]; then\n` +
        `  git clone https://github.com/KajizukaTaichi/mystia\n` +
        `else\n` +
        `  cd mystia && git pull && cd ..\n` +
        `fi`
      );
      term.sendText(`cd mystia/wasm`);
      term.sendText(`wasm-pack build --target nodejs && mv pkg/* ../docs/wasm/node/`);
      term.sendText(`wasm-pack build --target web && mv pkg/* ../docs/wasm/web/`);
    })
  );

  // ----- 3) REPL -----
  context.subscriptions.push(
    vscode.commands.registerCommand('mystia.repl', () => {
      const term = vscode.window.createTerminal('Mystia REPL');
      term.show();
      term.sendText(`node ./mystia/repl.mjs`);
    })
  );

  // ----- 4) Summary (cargo run <file> -s) -----
  context.subscriptions.push(
    vscode.commands.registerCommand('mystia.summary', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor to summarize.');
        return;
      }
      const filePath = editor.document.fileName;
      const term = vscode.window.createTerminal('Mystia Summary');
      term.show();
      term.sendText(`cd ./mystia`);
      term.sendText(`cargo run ${quotePath(filePath)} -s`);
    })
  );

}

// VSCode のターミナルでパスを正しく扱うため、必要に応じてクオートで囲む
function quotePath(path: string): string {
  if (path.includes(' ')) {
    return `"${path}"`;
  }
  return path;
}

export function deactivate() {}
