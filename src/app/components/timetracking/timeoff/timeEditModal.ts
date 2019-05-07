import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';

@Component({
    selector: 'uni-timedit-modal',
    template: `
    <section role="dialog" class="uni-modal uni-redesign" style="width: 60vw; font-size: .9rem">
        <header>
            <h1>Redigering av fridag</h1>
        </header>

        <article class="budget-entry-modal-container">
            <uni-timeoff-edit [currentDay]="options?.data?.currentDay" (dataChanged)="close()"> </uni-timeoff-edit>
        </article>
    </section>
    `
})

export class UniTimeEditModal implements IUniModal {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    constructor() {}

    public close() {
        this.onClose.emit();
    }
}
