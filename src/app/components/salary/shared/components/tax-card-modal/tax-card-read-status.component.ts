import {Component, OnInit, Input, SimpleChanges, OnChanges, ChangeDetectionStrategy} from '@angular/core';
import {
    IUniTableConfig, UniTableColumn, UniTableColumnType, UniTableConfig
} from '@uni-framework/ui/unitable';
import {TaxCardReadStatus, EmployeeStatus} from '@uni-entities';
import {ErrorService, StatisticsService} from '@app/services/services';
import {BehaviorSubject} from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'tax-card-read-status',
    templateUrl: './tax-card-read-status.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class TaxCardReadStatusComponent implements OnInit, OnChanges {

    @Input()
    public status: TaxCardReadStatus;

    public tableConfig: IUniTableConfig;
    public tableModel$: BehaviorSubject<EmployeeStatus[]> = new BehaviorSubject([]);
    public preformattedMainStatus: string;
    public mainStatus: string;

    constructor(
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
    ) {}

    public ngOnInit() {
        const empInfoCol = new UniTableColumn('_empInfo', 'Ansatt', UniTableColumnType.Text);
        const ssnCol = new UniTableColumn('ssn', 'Fødselsnummer/Dnummer', UniTableColumnType.Text);
        const statusCol = new UniTableColumn('status', 'Status', UniTableColumnType.Text);
        this.tableConfig = new UniTableConfig('salary.employee.modals.taxcardreadstatus', false)
            .setColumns([empInfoCol, ssnCol, statusCol]);
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (!changes['status']) {
            return;
        }
        this.updateTableModel(changes['status'].currentValue);
        this.setMainStatus(changes['status'].currentValue);
    }

    private setMainStatus(status: TaxCardReadStatus) {
        this.preformattedMainStatus = '';
        this.mainStatus = '';

        if (!status.mainStatus) {
            return;
        }

        if (status.mainStatus.includes('\n')) {
            this.preformattedMainStatus = status.mainStatus;
        } else {
            this.mainStatus = status.mainStatus;
        }
    }

    private updateTableModel(status: TaxCardReadStatus) {
        if (!status.employeestatus || !status.employeestatus.length) {
            return;
        }

        this.statisticsService
            .GetAllUnwrapped(
                `select=ID as ID,EmployeeNumber as EmployeeNumber,BusinessRelationInfo.Name as Name` +
                `&model=Employee` +
                `&filter=ID ge ${Math.min(...status.employeestatus.map(employee => employee.employeeID))} ` +
                    `and ID le ${Math.max(...status.employeestatus.map(employee => employee.employeeID))}` +
                `&expand=BusinessRelationInfo`
            )
            .pipe(
                map((employees: {ID: number, EmployeeNumber: number, Name: string}[]) => {
                    status.employeestatus.forEach(empStat => {
                        const employee = employees.find(x => x.ID === empStat.employeeID);
                        if (!employee) {
                            return;
                        }

                        const empInfo = employee.Name
                            ? ['' + employee.EmployeeNumber, employee.Name]
                            : ['' + employee.EmployeeNumber];

                        empStat['_empInfo'] = empInfo.join(' - ');
                        empStat['_sortIndex'] = employee.EmployeeNumber;
                    });
                    return status.employeestatus;
                })
            )
            .subscribe(
                empStat => this.tableModel$.next(empStat.sort(this.empSort)),
                error => this.errorService.handle(error)
            );
    }

    private empSort(empA: EmployeeStatus, empB: EmployeeStatus) {
        const sortA = empA['_sortIndex'] || 999999999;
        const sortB = empB['_sortIndex'] || 999999999;
        return sortA - sortB;
    }
}
