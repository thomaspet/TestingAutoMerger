﻿import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { ITimeTrackingTemplate, ITemplate } from '../sidemenu/sidemenu';
import { UniFieldLayout } from '../../../../framework/ui/uniform/index';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FieldType } from '../../../../framework/ui/uniform/index';
import { WorkEditor } from './workeditor';
import {
    UniTable,
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '../../../../framework/ui/unitable/index';
import * as moment from 'moment';

@Component({
    selector: 'uni-template-modal',
    template: `
        <dialog class="uniModal" [attr.open]="isOpen">
            <article class="uniModal_bounds">
                <button (click)="close('cancel')" class="closeBtn"></button>
                <article class="modal-content uni_template_modal_content" [attr.aria-busy]="busy" >
                    <h3>Opprett ny modal</h3>
                    <label>Navn: </label><input type="text" [(ngModel)]="template.Name"><br>
                    <label>Beskrivelse: </label><input type="text" [(ngModel)]="template.Description">
                    <uni-table
                        [resource]="template?.Items"
                        [config]="tableConfig"
                        (rowSelected)="onRowSelected($event)">
                    </uni-table>
                    <footer>
                        <button (click)="close('ok')" class="good">Lagre</button>
                        <button (click)="close('cancel')" class="bad">Avbryt</button>
                    </footer>
                </article>
            </article>
        </dialog>
    `,
    providers: [WorkEditor]
})

export class UniTemplateModal {

    private isOpen: boolean = false;
    private busy: boolean = false;
    private template: ITemplate = this.getCleanTemplate();
    private tableConfig: UniTableConfig;

    @Output() private onSaveAndClose: EventEmitter<any> = new EventEmitter();

    @ViewChild(UniTable)
    private table: UniTable;

    constructor(private worker: WorkEditor) { }

    private setUpTable() {
        this.tableConfig = new UniTableConfig(true, false)
            .setSearchable(false)
            .setColumns([
                new UniTableColumn('StartTime', 'Start'),
                new UniTableColumn('EndTime', 'Slutt'),
                new UniTableColumn('LunchInMinutes', 'Lunsj'),
                new UniTableColumn('Minutes', 'Timer')
                    .setTemplate(rowModel => rowModel.Minutes && (rowModel.Minutes / 60).toFixed(1)),
                new UniTableColumn('Description', 'Beskrivelse')
                    .setWidth('30%'),
                this.worker.createLookupColumn('Worktype', 'Timeart', 'Worktype', x => this.worker.lookupType(x))
                    .setWidth('6rem'),
                new UniTableColumn('DimensionsID', 'Prosjekt'),
                new UniTableColumn('CustomerOrderID', 'Ordre')
            ])
            .setChangeCallback(event => this.onEditChange(event));
    }

    public open(template?: ITemplate) {
        this.template = template || this.getCleanTemplate();
        this.isOpen = true;
        this.setUpTable();

        return new Promise((resolve, reject) => {
            this.onClose = ok => resolve(ok);
        });
    }

    public close(src: 'ok' | 'cancel') {
        this.onSaveAndClose.emit(this.template);
        this.isOpen = false;
        this.onClose(src === 'ok');
    }

    private onClose: (ok: boolean) => void = () => {
        console.log(this.template);

    };

    private getCleanTemplate() {
        return {
            Name: '',
            StartTime: '',
            EndTime: '',
            LunchInMinutes: 0,
            Hours: 0,
            Description: '',
            Items: [{
                StartTime: '',
                EndTime: '',
                Minutes: 0,
                WorkType: null,
                LunchInMinutes: 0,
                Description: '',
                DimensionsID: null,
                CustomerOrderID: null
            }]
        };
    }

    private onRowSelected(event) {
        console.log(event);
    }

    private onEditChange(event) {
        if (event.field === 'StartTime' || event.field === 'EndTime' ) {
            event.rowModel[event.field] = this.formatHours(event.rowModel[event.field]);
            event.rowModel.Minutes = this.calcMinutesOnLine(event.rowModel);
            return event.rowModel;
        }
    }

    private calcMinutesOnLine(item: ITimeTrackingTemplate): number {
        var minutes = 0;
        if (item.StartTime && item.EndTime) {
            var lunch = item.LunchInMinutes || 0;
            let st = item.StartTime.replace(':', '');
            let et = item.EndTime.replace(':', '');
            let startHours = +st.slice(0, 2);
            let startMinutes = +st.slice(2);
            let endHours = +et.slice(0, 2);
            let endMinutes = +et.slice(2);

            minutes = ((endHours - startHours) * 60) + (endMinutes - startMinutes) - lunch;
        }
        return minutes || 0;
    }

    private calcMinutesTotal(item: ITemplate): number {
        let totalMinutes = 0;
        item.Items.forEach((temp) => {
            totalMinutes += temp.Minutes;
        })
        return totalMinutes;
    }

    private formatHours(value: string): string {
        let returnValue = '';
        if (value) {
            let parsedValue: number = parseInt(value);
            if (typeof parsedValue === 'number' && !isNaN(parsedValue)) {
                if (parsedValue > 0 && parsedValue < 10) {
                    returnValue = '0' + parsedValue + ':00';
                } else if (parsedValue > 9 && parsedValue < 24) {
                    returnValue = parsedValue + ':00';
                } else if (parsedValue > 24 && parsedValue < 236) {
                    returnValue = (parsedValue < 100) ? '0' : '';
                    returnValue += Math.floor((parsedValue / 10)) + ':';
                    returnValue += (parsedValue % 10 < 6) ? parsedValue % 10 + '0' : '00';
                }else if (parsedValue > 236 && parsedValue < 960 && (parsedValue % 100 < 60)) {
                    returnValue = '0' + Math.floor(parsedValue / 100) + ':';
                    returnValue += (parsedValue % 100 > 10) ? parsedValue % 100 : '0' + parsedValue % 100;
                } else if (parsedValue > 999 && parsedValue < 2360 && (parsedValue % 100 < 60)) {
                    returnValue = Math.floor(parsedValue / 100) + ':';
                    returnValue += (parsedValue % 100 >= 10) ? parsedValue % 100 + '' : '0' + (parsedValue % 100);
                } else {
                    returnValue = '00:00';
                }
            } else {
                returnValue = '00:00';
            }
        }
        return returnValue;
    }
}