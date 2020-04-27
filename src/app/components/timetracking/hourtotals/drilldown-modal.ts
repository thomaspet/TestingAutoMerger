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
                            <th class="small">Overført</th>
                            <th class="large left">Medarbeider</th>
                            <th class="medium">Dato</th>
                            <th class="small">Start</th>
                            <th class="small">Slutt</th>
                            <th class="small">Timer</th>
                            <th class="left">Tekst</th>
                            <th class="large left">Kunde</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let item of options.data.details">
                            <td [class.open]="!item.TransferedToOrder"><input style="font-size: 15pt" [ngModel]="item.TransferedToOrder" type="checkbox" disabled/></td>
                            <td class="large left">{{item.Name}}</td>
                            <td>{{item.Date | date:'dd.MM.yyyy'}}</td>
                            <td>{{item.StartTime | date:'HH:mm'}}</td>
                            <td>{{item.EndTime | date:'HH:mm'}}</td>
                            <td>{{item.Minutes | min2hours:'decimal00'}}</td>
                            <td class="left">{{item.Description}}</td>
                            <td class="large left">{{item.CustomerName}}</td>
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
