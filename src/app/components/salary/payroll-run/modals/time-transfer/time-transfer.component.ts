import {Component, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChanges, AfterViewInit} from '@angular/core';
import {IUniModal, IModalOptions, ConfirmActions, UniModalService} from '@uni-framework/uni-modal';
import {UniTable, IRowChangeEvent, UniTableColumn, UniTableColumnType, UniTableConfig} from '@uni-framework/ui/unitable';
import {BehaviorSubject} from 'rxjs';
import {LocalDate, WorkItemToSalary, WorkItem} from '@uni-entities';
import {IUniSaveAction} from '@uni-framework/save/save';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform';
import {ErrorService, PayrollrunService} from '@app/services/services';

@Component({
    selector: 'uni-time-transfer',
    templateUrl: './time-transfer.component.html',
    styleUrls: ['./time-transfer.component.sass']
})
export class TimeTransferComponent implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    @ViewChild(UniTable, { static: true }) private table: UniTable;

    uniformConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    uniformFields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    mainAction: IUniSaveAction;
    uniTableConfig: UniTableConfig;
    data: WorkItemToSalary[] = [];
    createTransesIsActive: boolean;
    busy: boolean;

    constructor(
        private errorService: ErrorService,
        private payrollrunService: PayrollrunService,
        private modalService: UniModalService
    ) {}

    ngOnInit() {
        this.getData(this.options.data.ToDate);
        this.createFormConfig();
        this.createTableConfig();
    }

    ngOnDestroy() {
        this.uniformConfig$.complete();
        this.uniformFields$.complete();
    }

    private getData(todate?: LocalDate) {
        this.busy = true;
        this.data = [];
        this.payrollrunService
            .getTimeToTransfer(this.options.data.ID, todate)
            .finally(() => this.busy = false)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .map(model => {
                model.forEach(workToSalary => {
                    workToSalary['_minutes'] = this.getSumMinutes(workToSalary.WorkItems);
                    workToSalary['_fromdate'] = this.getFromDate(workToSalary.WorkItems);
                    workToSalary['_todate'] = this.getToDate(workToSalary.WorkItems);
                });
                return model;
            })
            .subscribe((model: WorkItemToSalary[]) => this.data = model);
    }

    private getSumMinutes(workItems: WorkItem[]): number {
        let sum: number = 0;
        for (let i = 0; i < workItems.length; i++) {
            sum += workItems[i].Minutes;
        }
        return sum;
    }

    private getFromDate(workItems: WorkItem[]): LocalDate {
        let firstDate = new LocalDate(workItems[0].Date);
        for (let i = 0; i < workItems.length; i++) {
            const currDate = new LocalDate(workItems[i].Date);
            if (currDate < firstDate) {
                firstDate = currDate;
            }
        }
        return firstDate;
    }

    private getToDate(workItems: WorkItem[]): LocalDate {
        let lastDate = new LocalDate(workItems[0].Date);
        for (let i = 0; i < workItems.length; i++) {
            const currDate = new LocalDate(workItems[i].Date);
            if (currDate > lastDate) {
                lastDate = currDate;
            }
        }
        return lastDate;
    }

    public closeModal(update: boolean = false) {
        this.onClose.next(this.options.cancelValue || update);
    }

    private createFormConfig() {
        const toDateField = new UniFieldLayout();
        toDateField.FieldSet = 0;
        toDateField.Section = 0;
        toDateField.Combo = 0;
        toDateField.FieldType = FieldType.LOCAL_DATE_PICKER;
        toDateField.Property = 'ToDate';
        toDateField.Label = 'Godkjente timer t.o.m.';
        toDateField.Options = null;
        toDateField.ReadOnly = false;

        this.uniformFields$.next([toDateField]);
    }

    private createTableConfig() {
        const employeeCol = new UniTableColumn('WorkRelation.Worker.Employee.BusinessRelationInfo', 'Ansatt',
            UniTableColumnType.Text, false)
            .setTemplate(dataItem =>
                dataItem.WorkItems[0].WorkRelation.Worker.Employee.EmployeeNumber + ' - ' +
                dataItem.WorkItems[0].WorkRelation.Worker.Employee.BusinessRelationInfo.Name);
        const employmentCol = new UniTableColumn('Employment', 'Arbeidsforhold', UniTableColumnType.Text, false)
            .setTemplate(dataItem => !!dataItem.Employment &&
                dataItem.Employment.ID + ' - ' + dataItem.Employment.JobName);
        const wagetypeCol = new UniTableColumn('WageType', 'Lønnsart', UniTableColumnType.Text, false)
            .setTemplate(dataItem => !!dataItem.WageType &&
                dataItem.WageType.WageTypeNumber + ' - ' + dataItem.WageType.WageTypeName);
        const fromdateCol = new UniTableColumn('_fromdate', 'Fra dato', UniTableColumnType.LocalDate, false);
        const todateCol = new UniTableColumn('_todate', 'Til dato', UniTableColumnType.LocalDate, false);
        const amountCol = new UniTableColumn('_minutes', 'Antall', UniTableColumnType.Money, false)
            .setTemplate(item => (parseFloat(item._minutes) / 60).toFixed(1));
        const rateCol = new UniTableColumn('Rate', 'Timesats', UniTableColumnType.Money, false)
            .setTemplate(item => item.Rate ? item.Rate : '0');
        const sumCol = new UniTableColumn('_sum', 'Sum', UniTableColumnType.Money, false)
            .setTemplate(item => (parseFloat(item._minutes) / 60 * (parseFloat(item.Rate))).toFixed(1));
        const projectCol = new UniTableColumn('Dimensions.Project', 'Prosjekt', UniTableColumnType.Text, false)
            .setTemplate(item => !!item.WorkItems[0].Dimensions &&
                item.WorkItems[0].Dimensions.Project &&
                item.WorkItems[0].Dimensions.Project.Name);
        const departmentCol = new UniTableColumn('Dimensions.Department', 'Avdeling', UniTableColumnType.Text, false)
            .setTemplate(item => !!item.WorkItems[0].Dimensions &&
                item.WorkItems[0].Dimensions.Department &&
                item.WorkItems[0].Dimensions.Department.Name);

        this.uniTableConfig = new UniTableConfig('salary.payrollrun.timetransferModalContent', false)
            .setColumns([
                employeeCol, employmentCol, wagetypeCol, fromdateCol, todateCol,
                amountCol, rateCol, sumCol, projectCol, departmentCol
            ])
            .setPageable(false)
            .setMultiRowSelect(true)
            .setAutoAddNewRow(false)
            .setIsRowReadOnly((row: WorkItemToSalary) => {
                return !row.PayrollRunID;
            });
    }

    createTimeTransactions() {
        this.modalService
            .confirm({
                header: 'Overfør timer',
                message: 'Bekreft overføring av timer',
                buttonLabels: {
                    accept: 'Overfør',
                    cancel: 'Avbryt'
                }
            })
            .onClose
            .filter(response => response === ConfirmActions.ACCEPT)
            .switchMap(response => {
                this.busy = true;
                return this.payrollrunService
                    .createTimeTransactions(
                        this.options.data.ID,
                        this.getSelectedWorkItemIDs())
                    .do(() => this.closeModal(true));
            })
            .finally(() => this.busy = false)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe();
    }

    private getSelectedWorkItemIDs(): number[] {
        const selectedIDs: number[] = [];
        const workitemtosalary: WorkItemToSalary[] = this.table.getSelectedRows();
        workitemtosalary.forEach(wToSal => {
            if (!!wToSal.WorkItems) {
                for (let i = 0; i < wToSal.WorkItems.length; i++) {
                    selectedIDs.push(wToSal.WorkItems[i].ID);
                }
            }
        });
        return selectedIDs;
    }

    private resetRowSelection() {
        this.table
            .getSelectedRows()
            .forEach(row => {
                if (row.PayrollRunID === 0) {
                    row['_rowSelected'] = false;
                    this.table.updateRow(row['_originalIndex'], row);
                }
            });
    }

    //#region uniform
    public uniformChange(value: SimpleChanges) {
        if (value['ToDate']) {
            this.getData(value['ToDate'].currentValue);
        }
    }

    //#region unitable
    public rowChanged(event: IRowChangeEvent) {

    }

    public onRowSelectionChange(event) {
        this.resetRowSelection();
        this.createTransesIsActive = this.table.getSelectedRows().length;
    }
}
