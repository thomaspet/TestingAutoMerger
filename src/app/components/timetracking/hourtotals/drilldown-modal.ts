import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal';

@Component({
    selector: 'hourtotals-drilldown-modal',
    template: `
    <section role="dialog" class="uni-modal">
        <header>
        {{options.data.groupBy.label}} {{options.data.row.title}}
        </header>
        <article>
            filter: {{options.data.odata.filter}}
            <hourtotals [input]="options.data"></hourtotals>

        </article>

        <footer>
            <button class="secondary" (click)="onClose.emit()">Lukk</button>
        </footer>
    </section>`,
    styleUrls: ['drilldown-modal.sass']
})
export class HourTotalsDrilldownModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

}
