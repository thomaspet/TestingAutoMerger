import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {ITimeTrackingTemplate, ITemplate} from '../sidemenu/sidemenu';
import {getDeepValue} from '../../common/utils/utils';
import {WorkEditor} from '@app/components/common/timetrackingCommon';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {IUniModal, IModalOptions} from '../../../../framework/uni-modal';
import {
    UniTable,
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '../../../../framework/ui/unitable/index';

export interface ITemplateReturnObject {
    closeOption: TemplateCloseOptions;
    template: any;
    index: number;
}

export enum TemplateCloseOptions {
    save = 0,
    delete = 1,
    cancel = 2
}

@Component({
    selector: 'uni-template-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign" style="width: 80vw;">
            <header>Opprett ny timeføringsmal</header>

            <article>
                <label>Navn </label><input type="text" class="template-modal-input-field" [(ngModel)]="template.Name"><br>
                <label>Beskrivelse </label><input type="text" class="template-modal-input-field" [(ngModel)]="template.Description">
                
                <ag-grid-wrapper
                    class="transquery-grid-font-size"
                    [(resource)]="template.Items"
                    [config]="tableConfig" style="margin: 1.2rem 0;">
                </ag-grid-wrapper>
            </article>

            <footer>
                <button class="secondary" (click)="close('cancel')">Avbryt</button>
                <button class="bad" (click)="close('delete')" *ngIf="onEdit.isEdit">Slett</button>
                <button class="good" (click)="close('save')">Lagre</button>
            </footer>
        </section>
`,
    providers: [WorkEditor]
})

export class UniTemplateModal implements IUniModal {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<ITemplateReturnObject> = new EventEmitter();

    public template: ITemplate = this.getCleanTemplate();
    public tableConfig: UniTableConfig;
    public onEdit: any = {
        isEdit: false,
        index: null
    };

    constructor(private worker: WorkEditor, private toast: ToastService) { }

    public ngOnInit() {
        this.template = this.options.data.template || this.getCleanTemplate();

        if (this.options.data.index >= 0) {
            this.onEdit.isEdit = true;
            this.onEdit.index = this.options.data.index;
        }

        this.setUpTable();
    }

    private setUpTable() {

        const columns = [
            new UniTableColumn('StartTime', 'Start', UniTableColumnType.Text),
            new UniTableColumn('EndTime', 'Slutt', UniTableColumnType.Text),
            new UniTableColumn('LunchInMinutes', 'Lunsj', UniTableColumnType.Text),
            new UniTableColumn('Minutes', 'Timer', UniTableColumnType.Text)
                .setTemplate(rowModel => rowModel.Minutes && (rowModel.Minutes / 60).toFixed(1)),
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text)
                .setWidth('30%'),
            this.worker.createLookupColumn('Worktype', 'Timeart', 'Worktype', x => this.worker.lookupType(x)),
            this.createLookupColumn('Project', 'Prosjekt',
                'Project', x => this.worker.lookupAny(x, 'projects', 'projectnumber'), 'ProjectNumber'),
        ];

        this.tableConfig = new UniTableConfig('timetracking.newtemplate', true, false)
            .setSearchable(false)
            .setColumns(columns)
            .setChangeCallback(event => this.onEditChange(event));
        this.tableConfig.deleteButton = true;
    }

    public close(src: 'save' | 'cancel' | 'delete') {

        if (src === 'save') {
            this.template.Items = this.template.Items.filter((row: any) => !row._isEmpty);

            if ((!this.template.Description || !this.template.Name)) {
                this.toast.addToast(
                    'Ikke lagret',
                    ToastType.warn,
                    5,
                    'Ukomplett mal! Alle maler må ha navn og beskrivelse');
                return;
            }

            for (let i = 0; i < this.template.Items.length; i++) {
                if (!this.template.Items[i].StartTime
                    || !this.template.Items[i].EndTime
                    || !this.template.Items[i].Worktype) {
                    this.toast.addToast(
                        'Ikke lagret',
                        ToastType.warn,
                        5,
                        'Ukomplett mal! Alle linjene må ha start, slutt og timeart!');
                    return;
                }
            }

            this.template.Minutes = this.calcMinutesTotal(this.template.Items);
            this.template.StartTime = this.calcStartTime(this.template.Items);
            this.template.EndTime = this.calcEndTime(this.template.Items);
        }

        this.onClose.emit({
                closeOption: TemplateCloseOptions[src],
                template: this.template,
                index: this.onEdit.index
            });

        this.onEdit.isEdit = false;
        this.onEdit.index = null;
    }

    private getCleanTemplate() {
        return {
            Name: '',
            StartTime: '',
            EndTime: '',
            LunchInMinutes: 0,
            Minutes: 0,
            Description: '',
            Items: [{
                StartTime: '',
                EndTime: '',
                Minutes: 0,
                Worktype: null,
                LunchInMinutes: 0,
                Description: '',
                DimensionsID: 0,
                CustomerOrderID: null,
                Project: null
            }]
        };
    }

    public onEditChange(event) {
        if (event.field === 'StartTime' || event.field === 'EndTime') {
            event.rowModel[event.field] = this.formatHours(event.rowModel[event.field]);
            event.rowModel.Minutes = this.calcMinutesOnLine(event.rowModel);
            return event.rowModel;
        } else if (event.field === 'LunchInMinutes') {
            event.rowModel.Minutes = this.calcMinutesOnLine(event.rowModel);
            return event.rowModel;
        }
    }

    private calcMinutesOnLine(item: ITimeTrackingTemplate): number {
        let minutes = 0;
        if (item.StartTime && item.EndTime) {
            const lunch = item.LunchInMinutes || 0;
            const st = item.StartTime.replace(':', '');
            const et = item.EndTime.replace(':', '');
            const startHours = +st.slice(0, 2);
            const startMinutes = +st.slice(2);
            const endHours = +et.slice(0, 2);
            const endMinutes = +et.slice(2);

            minutes = ((endHours - startHours) * 60) + (endMinutes - startMinutes) - lunch;
        }
        return minutes || 0;
    }

    private calcMinutesTotal(items: ITimeTrackingTemplate[]): number {
        let totalMinutes = 0;
        items.forEach((temp) => {
            totalMinutes += temp.Minutes;
        });
        return totalMinutes;
    }

    private calcStartTime(items: ITimeTrackingTemplate[]): string {
        let earliestHour = '23:59';

        items.forEach((item) => {
            if (parseInt(item.StartTime.replace(':', ''), 10) < parseInt(earliestHour.replace(':', ''), 10)) {
                earliestHour = item.StartTime;
            }
        });
        return earliestHour;
    }

    private calcEndTime(items: ITimeTrackingTemplate[]): string {
        let latestHour = '00:00';

        items.forEach((item) => {
            if (parseInt(item.EndTime.replace(':', ''), 10) > parseInt(latestHour.replace(':', ''), 10)) {
                latestHour = item.EndTime;
            }
        });
        return latestHour;
    }

    private formatHours(value: string): string {
        let returnValue = '';
        if (value) {
            const parsedValue: number = parseInt(value.replace(':', ''), 10);
            if (typeof parsedValue === 'number' && !isNaN(parsedValue)) {
                if (parsedValue > 0 && parsedValue < 10) {
                    returnValue = '0' + parsedValue + ':00';
                } else if (parsedValue > 9 && parsedValue < 24) {
                    returnValue = parsedValue + ':00';
                } else if (parsedValue > 24 && parsedValue < 236) {
                    returnValue = (parsedValue < 100) ? '0' : '';
                    returnValue += Math.floor((parsedValue / 10)) + ':';
                    returnValue += (parsedValue % 10 < 6) ? parsedValue % 10 + '0' : '00';
                } else if (parsedValue > 236 && parsedValue < 960 && (parsedValue % 100 < 60)) {
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

    public createLookupColumn(
        name: string,
        label: string,
        expandCol: string,
        lookupFn?: any,
        expandKey = 'ID',
        expandLabel = 'Name'
    ): UniTableColumn {
        return new UniTableColumn(name, label, UniTableColumnType.Lookup)
            .setDisplayField(`${expandCol}.${expandLabel}`)
            .setOptions({
                itemTemplate: (item) => {
                    return item[expandKey] + ' - ' + getDeepValue(item, expandLabel);
                },
                lookupFunction: lookupFn
            });
    }
}
