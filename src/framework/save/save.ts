import {Component, Input, Output, EventEmitter, ElementRef} from '@angular/core';

export interface IUniSaveAction {
    verb: string;
    callback: any;
    main?: boolean;
    busy?: boolean;
    disabled?: boolean;
}

declare var jQuery;

@Component({
    selector: 'uni-save',
    template: `
        <footer class="uniSave">
            <p class="uniSave-status">{{status}}</p>

            <div role="group" class="comboButton">
                <button class="comboButton_btn"
                        type="button"
                        (click)="onSave(mainAction())"
                        [attr.aria-busy]="mainAction().busy"
                        [disabled]="mainAction().disabled">{{mainAction().verb}}</button>
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
                        [title]="action.verb"
                        [attr.aria-hidden]="action.main">{{action.verb}}</li>
                </ul>
            </div>


        </footer>
    `
})


export class UniSave {

    @Input() public actions: IUniSaveAction[];
    @Input() public status: string;
    @Output() public save: EventEmitter<any> = new EventEmitter();

    private open: boolean;

    constructor(public el: ElementRef) {
        // Add event listeners for dismissing the dropdown (-up?)
        document.addEventListener('click', (event) => {
            let $el = jQuery('uni-save .comboButton');
            if (!jQuery(event.target).closest($el).length) {
                event.stopPropagation();
                this.open = false;
            }
        });
        document.addEventListener('keyup', (event) => {
            if (event.keyCode === 27) {
                this.open = false;
            }
        });
    }

    private mainAction() {
        let _declaredMain = this.actions.filter(action => action.main);

        if (_declaredMain.length) {
            return _declaredMain[0]
        } else {
            return this.actions[0];
        }
    }

    public onSave(action) {
        this.open = false;
        this.save.emit(action);
    }


}
