import {Component, OnInit, Input, SimpleChanges, OnChanges, ChangeDetectionStrategy} from '@angular/core';
import {
    IUniTableConfig, UniTableColumn, UniTableColumnType, UniTableConfig
} from '../../../../../framework/ui/unitable';
import {TaxCardReadStatus, Employee, EmployeeStatus} from '../../../../unientities';
import {EmployeeService, ErrorService} from '../../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'tax-card-read-status',
    templateUrl: './taxCardReadStatus.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class TaxCardReadStatusComponent implements OnInit, OnChanges {

    @Input() public status: TaxCardReadStatus;
    public tableConfig: IUniTableConfig;
    public tableModel$: BehaviorSubject<EmployeeStatus[]> = new BehaviorSubject([]);
    public preformattedMainStatus: string;
    public mainStatus: string;

    constructor(
        private employeeService: EmployeeService,
        private errorService: ErrorService
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

        const filter = status.employeestatus.map(emp => `ID eq ${emp.employeeID}`).join(' or ');
        this.employeeService
            .GetAll(`filter=${filter}`, ['BusinessRelationInfo'])
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .map((emps: Employee[]) => {
                status.employeestatus.forEach(empStat => {
                    const emp = emps.find(x => x.ID === empStat.employeeID);
                    if (!emp) {
                        return;
                    }

                    const empInfo = (emp.BusinessRelationInfo && emp.BusinessRelationInfo.Name)
                        ? ['' + emp.EmployeeNumber, emp.BusinessRelationInfo.Name]
                        : ['' + emp.EmployeeNumber];

                    empStat['_empInfo'] = empInfo.join(' - ');
                    empStat['_sortIndex'] = emp.EmployeeNumber;
                });
                return status.employeestatus;
            })
            .subscribe(empStat => this.tableModel$.next(empStat.sort(this.empSort)));
    }

    private empSort(empA: EmployeeStatus, empB: EmployeeStatus) {
        const sortA = empA['_sortIndex'] || 999999999;
        const sortB = empB['_sortIndex'] || 999999999;
        return sortA - sortB;
    }
}
