import {Component, Input, Output, EventEmitter} from '@angular/core';

export interface IUniSaveAction {
    verb: string;
    callback: any;
    main?: boolean;
    busy?: boolean;
    available?: boolean;
}

@Component({
    selector: 'uni-save',
    template: `
        <footer class="uniSave">
            <p class="uniSave-status">{{status}}</p>
            
            <button class="comboButton" type="button" (click)="onSave(mainAction)" [attr.aria-busy]="mainAction.busy">{{mainAction.verb}}</button>
            <button class="comboButton_more" (click)="open = !open">More options</button>
            <ul class="comboButton_moreList" [attr.aria-expanded]="open">
                <li *ngFor="let action of actions" (click)="onSave(action)">{{action.verb}}</li>
            </ul>
            
        </footer>
    `
})


export class UniSave {

    @Input() public actions: IUniSaveAction[];
    @Input() public status: string;
    @Output() public save: EventEmitter<any> = new EventEmitter();

    private mainAction: IUniSaveAction;

    public ngOnInit() {
        if (!this.mainAction) {
            this.mainAction = this.actions[0];
            this.actions.splice(0, 1);
        }

        this.actions.forEach(action => {
            if (action.main) {
                this.mainAction = action;
            }
        });
    }

    public onSave(action) {
        this.save.emit(action);
    }


}
