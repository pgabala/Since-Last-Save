'use strict';

import {ExtensionContext, StatusBarItem, window, workspace, Disposable} from 'vscode';

export function activate(context: ExtensionContext) {

    let diffChecker = new DiffChecker();
    let controller = new DiffCheckerController(diffChecker);

    context.subscriptions.push(diffChecker);
}

class DiffChecker {
    private _statusBarItem: StatusBarItem;

    public checkForDifference(currentFileText: string) {
        if (!this._statusBarItem) {
            this._statusBarItem = window.createStatusBarItem();
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
        this._statusBarItem.text = '$(diff) File Changed';
        this._statusBarItem.color = 'red';
        this._statusBarItem.tooltip = 'file has changed since last save';
    }

    public setFileText() {
        let fileText = undefined;

        if (window.activeTextEditor) {
            fileText = window.activeTextEditor.document.getText();
        }

        return fileText;
    }

    public hideStatusBarItem() {
        this._statusBarItem.hide();
    }

    dispose() {
        this._statusBarItem.dispose();
    }
}

class DiffCheckerController {
    private _diffChecker: DiffChecker;
    private _disposable: Disposable;
    private _currentFileContent: string;

    constructor(diffChecker: DiffChecker) {
        this._diffChecker = diffChecker;

        let subscriptions: Disposable[] = [];
        workspace.onDidChangeTextDocument(this._onChange, this, subscriptions)
        workspace.onDidSaveTextDocument(this._onSave, this, subscriptions);

        this._currentFileContent = this._diffChecker.setFileText();

        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    private _onSave() {
        this._currentFileContent = this._diffChecker.setFileText();
        this._diffChecker.hideStatusBarItem();
    }

    private _onChange() {
        this._diffChecker.checkForDifference(this._currentFileContent);
    }
}

export function deactivate() {
}