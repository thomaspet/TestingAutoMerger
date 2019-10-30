import {Component, Input, ChangeDetectorRef} from '@angular/core';

export interface IUniSaveAction {
    label: string;
    action: (done: (statusMessage?: string) => any, file?: any) => void;
    main?: boolean;
    disabled?: boolean;
}

@Component({
    selector: 'uni-save',
    templateUrl: './save.html',
    host: {
        '(document:keydown)': 'checkForSaveKey($event)'
    }
})
export class UniSave {
    @Input() actions: IUniSaveAction[];
    @Input() hideDisabled: boolean;

    filteredActions: IUniSaveAction[];
    busy: boolean = false;
    statusMessage: string;
    main: IUniSaveAction;

    constructor(private cdr: ChangeDetectorRef) {}

    ngOnChanges() {
        if (this.actions && this.actions.length) {
            this.filteredActions = this.hideDisabled && this.actions.length > 1
                ? this.actions.filter(action => action.main || !action.disabled)
                : this.actions;

            this.main = this.getMainAction();
        } else {
            this.filteredActions = [];
            this.main = undefined;
        }
    }

    getMainAction(): IUniSaveAction {
        if (this.filteredActions && this.filteredActions.length) {
            const mainAction = this.filteredActions.find(action => action.main);
            return mainAction || this.actions[0];
        }
    }

    checkForSaveKey(event) {
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

    onSave(action) {
        // don't call save again if its still working on saving or is disabled
        if (this.busy || action.disabled) { return; }

        this.busy = true;
        this.statusMessage = undefined;

        setTimeout(() => action.action(this.onSaveCompleted.bind(this)));
    }

    onSaveCompleted(statusMessage?: string) {
        this.statusMessage = statusMessage || '';
        setTimeout(() => this.statusMessage = undefined, 5000);

        // Add a small timeout to allow views to refresh before we make the
        // save button available again (avoid duplicate posts on double click)
        setTimeout(() => {
            this.busy = false;
            this.cdr.markForCheck();
        }, 500);
    }
}
