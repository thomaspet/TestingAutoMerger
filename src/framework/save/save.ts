import {
    Component,
    Input,
    Output,
    EventEmitter,
    SimpleChanges,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';
import * as moment from 'moment';

export interface IUniSaveAction {
    label: string;
    action: (done: (statusMessage?: string) => any) => void;
    main?: boolean;
    disabled?: boolean;
}

@Component({
    selector: 'uni-save',
    template: `
        <footer (clickOutside)="close()" class="uniSave">
            <p *ngIf="status"
                class="uniSave-status"
                role="status"
                title="Lukk melding"
                (click)="clearStatus(0)"
                (mouseenter)="abortTimeOut()"
                (mouseleave)="clearStatus(3000)">
                {{status.message}}
                <time [attr.datetime]="status.when">
                    {{fromNow()}}
                </time>
            </p>

            <div *ngIf="actions.length === 1" class="singleButton">
                <button *ngIf="actions.length === 1"
                        (click)="onSave(actions[0])"
                        [attr.aria-busy]="busy"
                        [disabled]="busy || actions[0].disabled">
                    {{actions[0].label}}
                </button>
            </div>

            <div *ngIf="actions.length > 1" role="group" class="comboButton">
                <button class="comboButton_btn"
                        type="button"
                        (click)="onSave(main)"
                        [attr.aria-busy]="busy"
                        [disabled]="main.disabled">{{main.label}}</button>
                <button class="comboButton_more"
                        (click)="open = !open"
                        aria-owns="saveActionMenu"
                        [attr.aria-expanded]="open">More options</button>

                <ul class="comboButton_moreList" [attr.aria-expanded]="open" role="menu" id="saveActionMenu">
                    <li *ngFor="let action of actions"
                        (click)="onSave(action)"
                        role="menuitem"
                        [attr.aria-disabled]="action.disabled"
                        [title]="action.label">{{action.label}}</li>
                </ul>
            </div>
        </footer>
    `,
    host: {
        '(keydown.esc)': 'close()',
        '(document:keydown)': 'checkForSaveKey($event)'
    }
})
export class UniSave {
    @Input() public actions: IUniSaveAction[];
    @Output() public save: EventEmitter<any> = new EventEmitter();

    private open: boolean = false;
    private busy: boolean = false;
    private status: {message: string, when: Date};
    private main: IUniSaveAction;
    private timeoutHolder: any;

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['actions']) {
            this.main = this.mainAction();
        }
    }

    public mainAction() {
        let _declaredMain = this.actions.filter(action => action.main);

        if (_declaredMain.length) {
            return _declaredMain[0];
        } else {
            return this.actions[0];
        }
    }

    private checkForSaveKey(event) {
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
                this.onSave(this.mainAction());

                if (activeElement && activeElement.focus) {
                    activeElement.focus();
                }
            });
        }
    }

    public manualSaveStart() {
        this.open = false;
        this.busy = true;
        this.status = undefined;
    }

    public manualSaveComplete(message: string) {
        this.status = {
            message: message,
            when: new Date()
        };
        this.busy = false;
        this.clearStatus(3000);
    }

    private onSave(action) {
        // don't call save again if its still working on saving or is disabled
        if (this.busy || action.disabled) { return; }

        this.open = false;
        this.busy = true;
        this.status = undefined;

        setTimeout(() => action.action(this.onSaveCompleted.bind(this)));
    }

    public onSaveCompleted(statusMessage?: string) {
        if (statusMessage && statusMessage.length) {
            this.status = {
                message: statusMessage,
                when: new Date()
            };
        }
        setTimeout(() => { this.busy = false; }, 500);
        this.clearStatus(3000);
    }

    private clearStatus(timeout: number) {
        let that = this;
        this.timeoutHolder = setTimeout(function() {
            that.status = undefined;
        }, timeout);
    }

    public abortTimeOut() {
        clearTimeout(this.timeoutHolder);
    }

    public fromNow() {
        return moment(this.status.when).fromNow();
    }

    public close() {
        this.open = false;
    }
}
