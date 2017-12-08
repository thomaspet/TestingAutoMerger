import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from '../../../../framework/ui/unitable/index';
import {Observable} from 'rxjs/Observable';
import {Employee} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {EmployeeService, ErrorService} from '../../../services/services';

@Component({
    selector: 'employee-list',
    templateUrl: './employeeList.html'
})

export class EmployeeList {
    private employeeTableConfig: UniTableConfig;
    private employees$: Observable<Employee>;
    private busy: boolean;

    constructor(
        private router: Router,
        private tabService: TabService,
        private _employeeService: EmployeeService,
        private errorService: ErrorService
    ) {
        this.busy = true;
        this.employees$ =
            _employeeService
                .GetAll(
                    'orderby=EmployeeNumber ASC',
                    ['BusinessRelationInfo.DefaultEmail',
                    'SubEntity.BusinessRelationInfo']
                )
                .finally(() => this.busy = false)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));

        const idCol = new UniTableColumn('EmployeeNumber', 'Nr', UniTableColumnType.Number).setWidth('5rem');

        const nameCol = new UniTableColumn('BusinessRelationInfo.Name', 'Navn', UniTableColumnType.Text);

        const emailCol = new UniTableColumn('BusinessRelationInfo.DefaultEmail.EmailAddress', 'Epost', UniTableColumnType.Link)
            .setLinkResolver(employee => {
                if (!employee.BusinessRelationInfo
                    || !employee.BusinessRelationInfo.DefaultEmail
                    || !employee.BusinessRelationInfo.DefaultEmail.EmailAddress
                ) {
                    return '';
                }

                return `mailto:${employee.BusinessRelationInfo.DefaultEmail.EmailAddress}`;
            });

        const birthDateCol = new UniTableColumn('BirthDate', 'Fødselsdato', UniTableColumnType.LocalDate);

        const subEntityCol = new UniTableColumn(
            'SubEntity.BusinessRelationInfo.Name', 'Virksomhet', UniTableColumnType.Text
        );

        this.employeeTableConfig = new UniTableConfig('salary.employee.employeeList', false)
            .setColumns([idCol, nameCol, emailCol, birthDateCol, subEntityCol])
            .setSearchable(true);

        this.tabService.addTab(
            { name: 'Ansatte', url: '/salary/employees', moduleID: UniModules.Employees, active: true }
        );
    }

    public rowSelected(event) {
        this.router.navigate(['/salary/employees/', event.rowModel.ID]);
    }

    public newEmployee() {
        this.router.navigateByUrl('/salary/employees/' + 0);
    }

}
