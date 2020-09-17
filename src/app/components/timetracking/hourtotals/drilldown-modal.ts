import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal';
import * as utils from '../../common/utils/utils';
import * as moment from 'moment';

@Component({
    selector: 'hourtotals-drilldown-modal',
    template: `
    <section role="dialog" class="uni-modal">
        <header>
        {{options.data.groupBy.labelSingle}}: {{options.data.row.title}}
        </header>

        <article>
            <hourtotals *ngIf="!options.data.showDetails" [input]="options.data" [triggerChangeInput]="clicked"></hourtotals>

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
            <button class="secondary good" (click)="exportFromModal()">Exporter til excel</button>
            <button class="secondary" (click)="onClose.emit()">Lukk</button>
        </footer>
    </section>`,
    styleUrls: ['hourtotals.sass']
})
export class HourTotalsDrilldownModal implements IUniModal {

    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    clicked = 0;

    exportFromModal() {
        if (this.options.data.showDetails) {
            this.exportToFile();
        } else {
            this.clicked++;
        }
    }

    exportToFile() {
        const csv = [];

            if (!this.options.data.details || !this.options.data.details[0]) {
                return;
            }

            const colCount = 7;

            csv.push(utils.createRow(colCount, '', this.options.data.groupBy.labelSingle + ': ' + this.options.data.row.title));
            csv.push(utils.createRow(colCount, ''));
            csv.push(['Medarbeider', 'Dato', 'Start', 'Slutt', 'Timer', 'Tekst', 'Kunde']);

            this.options.data.details.forEach( item => {
                const itemRow = [];
                itemRow.push(item.Name);
                itemRow.push(moment(item.Date).format('DD.MM.YYYY'));
                itemRow.push(moment(item.StartTime).format('HH:mm'));
                itemRow.push(moment(item.EndTime).format('HH:mm'));
                itemRow.push((item.Minutes / 60).toFixed(2));
                itemRow.push(item.Description);
                itemRow.push(item.CustomerName);

                csv.push(itemRow);
            });

            // Empty-row
            csv.push(utils.createRow(colCount, ''));

            utils.exportToFile(utils.arrayToCsv(csv, undefined, undefined, undefined, false),
                `Timerapport_${this.options.data.row.title}.csv`);
    }

}
