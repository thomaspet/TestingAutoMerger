import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal';

@Component({
    selector: 'hourtotals-drilldown-modal',
    template: `
    <section role="dialog" class="uni-modal">
        <header>
        {{options.data.groupBy.labelSingle}}: {{options.data.row.title}}
        </header>

        <article>

            <hourtotals *ngIf="!options.data.showDetails" [input]="options.data"></hourtotals>

            <div *ngIf="options.data.showDetails">
                <table class="report">
                    <thead>
                        <tr>
                            <th>Medarbeider</th>
                            <th>Dato</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let item of options.data.details">
                            <td>{{item.Name}}</td>
                            <td>{{item.Date}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </article>

        <footer>
            <button class="secondary" (click)="onClose.emit()">Lukk</button>
        </footer>
    </section>`,
    styleUrls: ['hourtotals.sass']
})
export class HourTotalsDrilldownModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

}
