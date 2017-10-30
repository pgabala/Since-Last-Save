'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    let diffChecker = new DiffChecker();
    let controller = new DiffCheckerController(diffChecker);

    context.subscriptions.push(diffChecker);
}

class DiffChecker {
    private _statusBarItem: vscode.StatusBarItem;

    public checkForDifference(currentFileText: string) {
        if (!this._statusBarItem) {
            this._statusBarItem = vscode.window.createStatusBarItem();
        }

        let changedText = this.setFileText();

        if (currentFileText !== changedText) {
            this.updateDiffMessage();
            this._statusBarItem.show();
        } else {
            this._statusBarItem.hide();
        }
    }

    public updateDiffMessage() {
        this._statusBarItem.text = '$(diff)';
        this._statusBarItem.color = 'red';
        this._statusBarItem.tooltip = 'file has changed since last save';
    }

    public setFileText() {
        let fileText = undefined;

        if (vscode.window.activeTextEditor) {
            fileText = vscode.window.activeTextEditor.document.getText();
        }

        return fileText;
    }

    dispose() {
        this._statusBarItem.dispose();
    }
}

class DiffCheckerController {
    private _diffChecker: DiffChecker;
    private _disposable: vscode.Disposable;
    private _currentFileContent: string;

    constructor(diffChecker: DiffChecker) {
        this._diffChecker = diffChecker;

        let subscriptions: vscode.Disposable[] = [];
        vscode.workspace.onDidChangeTextDocument(this._onChange, this, subscriptions)
        vscode.workspace.onDidSaveTextDocument(this._onSave, this, subscriptions);

        this._currentFileContent = this._diffChecker.setFileText();

        this._disposable = vscode.Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    private _onSave() {
        this._currentFileContent = this._diffChecker.setFileText();
    }

    private _onChange() {
        this._diffChecker.checkForDifference(this._currentFileContent);
    }
}

export function deactivate() {
}