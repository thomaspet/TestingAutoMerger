import {Component, Input, Output, EventEmitter} from '@angular/core';

export interface IUniSaveAction {
    label: string;
    action: (done: (statusMessage?: string) => any) => void;
    main?: boolean;
    disabled?: boolean;
}

@Component({
    selector: 'uni-save',
    template: `
        <footer class="uniSave">
            <p *ngIf="status" class="uniSave-status">
                {{status.message}}
                <time [attr.datetime]="status.when">
                    {{fromNow()}}
                </time>
            </p>

            <div role="group" class="comboButton">
                <button class="comboButton_btn"
                        type="button"
                        (click)="onSave(mainAction())"
                        [attr.aria-busy]="busy"
                        [disabled]="mainAction().disabled">{{mainAction().label}}</button>
                <button class="comboButton_more"
                        (click)="open = !open"
                        aria-owns="saveActionMenu"
                        [attr.aria-expanded]="open"
                        [disabled]="mainAction.disabled">More options</button>

                <ul class="comboButton_moreList" [attr.aria-expanded]="open" role="menu" id="saveActionMenu">
                    <li *ngFor="let action of actions"
                        (click)="onSave(action)"
                        role="menuitem"
                        [attr.aria-disabled]="action.disabled"
                        [title]="action.label"
                        [attr.aria-hidden]="action.main">{{action.label}}</li>
                </ul>
            </div>
        </footer>
    `,
    host: {
        '(click)': 'onClick($event)',
        '(document:click)': 'offClick()'
    }
})


export class UniSave {
    @Input() public actions: IUniSaveAction[];
    @Output() public save: EventEmitter<any> = new EventEmitter();

    private open: boolean = false;
    private busy: boolean = false;
    private status: {message: string, when: Date};

    constructor() {
        document.addEventListener('keyup', (event) => {
            if (event.keyCode === 27) {
                this.open = false;
            }
        });
    }
    
    private onClick(event) {
        event.stopPropagation();
    }
    
    private offClick() {
        this.open = false;    
    }

    private mainAction() {
        let _declaredMain = this.actions.filter(action => action.main);

        if (_declaredMain.length) {
            return _declaredMain[0];
        } else {
            return this.actions[0];
        }
    }

    public onSave(action) {
        this.open = false;
        this.busy = true;
        this.status = undefined;
        action.action(this.onSaveCompleted.bind(this));
    }
    
    public onSaveCompleted(statusMessage?: string) {
        if (statusMessage.length) {
            this.status = {
                message: statusMessage,
                when: new Date()
            };
        }
        this.busy = false;
    }
    
    private fromNow() {
        return moment(this.status.when).fromNow();
    }
}
