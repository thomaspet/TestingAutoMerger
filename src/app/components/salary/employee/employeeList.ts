import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {HttpParams} from '@angular/common/http';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from '../../../../framework/ui/unitable/index';
import {Employee} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ErrorService, StatisticsService} from '../../../services/services';


@Component({
    selector: 'employee-list',
    templateUrl: './employeeList.html'
})

export class EmployeeList {
    public toolbarActions = [{
        label: 'Ny ansatt',
        action: this.newEmployee.bind(this),
        main: true,
        disabled: false
    }];

    employeeTableConfig: UniTableConfig;
    lookupFunction: (urlParams: HttpParams) => any;

    constructor(
        private router: Router,
        private tabService: TabService,
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
    ) {
        this.tabService.addTab(
            {
                name: 'Ansatte',
                url: '/salary/employees',
                moduleID: UniModules.Employees,
                active: true
            }
        );
        this.createTableConfig();
    }

    public createTableConfig() {
        this.lookupFunction = (urlParams: HttpParams) => {
            const params = (urlParams || new HttpParams())
                .set('model', 'Employee')
                .set('select', 'ID as ID,EmployeeNumber as EmployeeNumber,BirthDate as BirthDate,BusinessRelationInfo.Name as BRName' +
                    ',InvoiceAddress.AddressLine1 as Address,DefaultEmail.EmailAddress as email,sb.Name as SubEntityName')
                .set('join', 'SubEntity.BusinessRelationID eq BusinessRelation.ID as sb')
                .set('expand', 'BusinessRelationInfo.DefaultEmail,SubEntity,BusinessRelationInfo.InvoiceAddress');

            return this.statisticsService
                .GetAllByHttpParams(params, true)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        const idCol = new UniTableColumn('EmployeeNumber', 'Nr')
            .setWidth(90)
            .setAlignment('center');

        const nameCol = new UniTableColumn('BusinessRelationInfo.Name', 'Navn', UniTableColumnType.Text)
            .setAlias('BRName')
            .setWidth(300);

        const emailCol = new UniTableColumn('DefaultEmail.EmailAddress', 'E-post', UniTableColumnType.Link)
            .setAlias('email')
            .setLinkResolver(employee => {
                return (!employee || !employee.email) ? '' : `mailto:${employee.email}`;
            });

        const addressCol = new UniTableColumn('InvoiceAddress.AddressLine1', 'Addresse', UniTableColumnType.Text)
            .setAlias('Address');

        const birthDateCol = new UniTableColumn('BirthDate', 'Fødselsdato', UniTableColumnType.LocalDate);

        const subEntityCol = new UniTableColumn(
            'sb.Name', 'Virksomhet', UniTableColumnType.Text
        )
        .setAlias('SubEntityName')
        .setWidth(350)
        .setFilterable(false);

        this.employeeTableConfig = new UniTableConfig('salary.employee.employeeList', false)
            .setColumns([idCol, nameCol, emailCol, addressCol, birthDateCol, subEntityCol])
            .setSearchable(true);

        this.tabService.addTab(
            { name: 'Ansatte', url: '/salary/employees', moduleID: UniModules.Employees, active: true }
        );
    }

    public employeeSelected(employee: Employee) {
        this.router.navigate(['/salary/employees/', employee.ID]);
    }

    public newEmployee(done) {
        this.router.navigate(['salary', 'employees', 0, 'personal-details']).then((x: boolean) => {
            if (!x) {
                done('Avbrutt');
            }
        });
    }
}
