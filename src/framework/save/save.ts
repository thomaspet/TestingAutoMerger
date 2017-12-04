import {
    Component,
    Input,
    SimpleChanges
} from '@angular/core';

export interface IUniSaveAction {
    label: string;
    action: (done: (statusMessage?: string) => any, file?: any) => void;
    main?: boolean;
    disabled?: boolean;
    isUpload?: boolean;
}

@Component({
    selector: 'uni-save',
    templateUrl: './save.html',
    host: {
        '(keydown.esc)': 'close()',
        '(document:keydown)': 'checkForSaveKey($event)'
    }
})
export class UniSave {
    @Input() public actions: IUniSaveAction[];

    private open: boolean = false;
    private busy: boolean = false;
    private statusMessage: string;
    private main: IUniSaveAction;

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['actions']) {
            this.main = this.getMainAction();
        }
    }

    public getMainAction(): IUniSaveAction {
        if (this.actions && this.actions.length) {
            let mainAction = this.actions.find(action => action.main);
            return mainAction || this.actions[0];
        }
    }

    public checkForSaveKey(event) {
        const key = event.which || event.keyCode;

        if (key === 83 && (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey)) {
            event.preventDefault();
            const activeElement: any = document.activeElement;

            if (activeElement && activeElement.blur) {
                activeElement.blur();
            }

            // Give components a chance to update disabled state
            // because there might be changes triggered by ctrl+s (table blur etc)
            setTimeout(() => {
                this.onSave(this.getMainAction());

                if (activeElement && activeElement.focus) {
                    activeElement.focus();
                }
            });
        }
    }

    private onSave(action) {
        // don't call save again if its still working on saving or is disabled
        if (this.busy || action.disabled || action.isUpload) { return; }

        this.open = false;
        this.busy = true;
        this.statusMessage = undefined;

        setTimeout(() => action.action(this.onSaveCompleted.bind(this)));
    }

    public onFileUpload(file, action) {
        this.open = false;
        this.busy = true;
        this.statusMessage = undefined;
        action.action(this.onSaveCompleted.bind(this), file);
    }

    public onSaveCompleted(statusMessage?: string) {
        this.statusMessage = statusMessage || '';
        setTimeout(() => this.statusMessage = undefined, 5000);

        // Add a small timeout to allow views to refresh before we make the
        // save button available again (avoid duplicate posts on double click)
        setTimeout(() => { this.busy = false; }, 500);
    }

    public close() {
        this.open = false;
    }
}
