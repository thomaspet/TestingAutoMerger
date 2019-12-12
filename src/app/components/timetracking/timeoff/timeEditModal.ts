import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';

@Component({
    selector: 'uni-timedit-modal',
    template: `
    <section role="dialog" class="uni-modal uni-redesign" style="width: 50rem; padding-bottom: 0;">
        <header>Redigering av fridag</header>

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
