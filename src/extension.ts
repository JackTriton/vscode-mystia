import * as vscode from 'vscode';

// Semantic Token Types and Modifiers
const tokenTypes = new Map<string, number>();
const tokenModifiers = new Map<string, number>();
const legend = (() => {
  const tokenTypesLegend = ['variable', 'variable.definition', 'variable.undefined'];
  const tokenModifiersLegend: string[] = [];
  tokenTypesLegend.forEach((t, i) => tokenTypes.set(t, i));
  tokenModifiersLegend.forEach((m, i) => tokenModifiers.set(m, i));
  return new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();

export function activate(context: vscode.ExtensionContext) {
  // Register Semantic Tokens Provider for Mystia
  context.subscriptions.push(
    vscode.languages.registerDocumentSemanticTokensProvider(
      { language: 'mystia' },
      new MystiaSemanticTokensProvider(),
      legend
    )
  );

  // Command: Setup Environment
  context.subscriptions.push(
    vscode.commands.registerCommand('mystia.setupEnv', () => {
      const term = vscode.window.createTerminal('Mystia Setup');
      term.show();
      term.sendText('npm install -g mystia-compiler');
    })
  );

  // Command: Build current file
  context.subscriptions.push(
    vscode.commands.registerCommand('mystia.build', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const file = editor.document.fileName;
      const term = vscode.window.createTerminal('Mystia Build');
      term.show();
      term.sendText(`mystia build ${file}`);
    })
  );

  // Command: Run current file
  context.subscriptions.push(
    vscode.commands.registerCommand('mystia.runFile', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const file = editor.document.fileName;
      const term = vscode.window.createTerminal('Mystia Run');
      term.show();
      term.sendText(`mystia run ${file}`);
    })
  );

  // Task Provider for Mystia Build
  context.subscriptions.push(
    vscode.tasks.registerTaskProvider('mystia', {
      provideTasks: () => {
        const buildTask = new vscode.Task(
          { type: 'mystia', task: 'build' },
          vscode.TaskScope.Workspace,
          'Mystia: build current file',
          'mystia',
          new vscode.ShellExecution('mystia build ${file}')
        );
        return [buildTask];
      },
      resolveTask(_task: vscode.Task): vscode.Task | undefined {
        return _task;
      }
    })
  );

  // Status Bar Button for Build
  const buildBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  buildBar.text = '$(tools) Mystia Build';
  buildBar.command = 'mystia.build';
  buildBar.show();
  context.subscriptions.push(buildBar);
}

class MystiaSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
  async provideDocumentSemanticTokens(
    doc: vscode.TextDocument
  ): Promise<vscode.SemanticTokens> {
    const builder = new vscode.SemanticTokensBuilder(legend);
    const text = doc.getText();
    const definedVars = new Set<string>();

    // Capture variable definitions: let <name>
    const defRegex = /\blet\s+([A-Za-z_]\w*)/g;
    let match: RegExpExecArray | null;
    while ((match = defRegex.exec(text))) {
      const varName = match[1];
      definedVars.add(varName);
      const index = match.index + match[0].indexOf(varName);
      const pos = doc.positionAt(index);
      builder.push(pos.line, pos.character, varName.length, tokenTypes.get('variable.definition')!, 0);
    }

    // Capture all identifiers
    const idRegex = /\b([A-Za-z_]\w*)\b/g;
    while ((match = idRegex.exec(text))) {
      const name = match[1];
      if (/\b(?:let|pub|load|type|if|else|while|loop)\b/.test(name)) continue;
      const index = match.index;
      const pos = doc.positionAt(index);
      if (definedVars.has(name)) {
        builder.push(pos.line, pos.character, name.length, tokenTypes.get('variable')!, 0);
      } else {
        builder.push(pos.line, pos.character, name.length, tokenTypes.get('variable.undefined')!, 0);
      }
    }

    return builder.build();
  }

  releaseDocumentSemanticTokens?(): void {}
}
