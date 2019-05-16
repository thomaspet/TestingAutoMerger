import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {URLSearchParams} from '@angular/http';
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
    lookupFunction: (urlParams: URLSearchParams) => any;

    constructor(
        private router: Router,
        private tabService: TabService,
        private statisticsService: StatisticsService,
        private errorService: ErrorService
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
        this.lookupFunction = (urlParams: URLSearchParams) => {
            const params = urlParams || new URLSearchParams();

            // Use split to get filter value and the custom create filter string with Number and Name fields
            const filterValue = urlParams.get('filter');
            const filterSplit = filterValue ? filterValue.split(`'`) : filterValue;
            let filterString = '';
            if (filterSplit && filterSplit.length) {
                filterString = `contains(EmployeeNumber,'${filterSplit[1]}') or contains(BusinessRelationInfo.Name,'${filterSplit[1]}')`;
            }

            params.set('model', 'Employee');
            params.set('select', 'ID as ID,EmployeeNumber as EmployeeNumber,BirthDate as BirthDate,BusinessRelationInfo.Name as BRName' +
            ',InvoiceAddress.AddressLine1 as Address,DefaultEmail.EmailAddress as email,sb.Name as SubEntityName');
            params.set('filter', filterString);
            params.set('join', 'SubEntity.BusinessRelationID eq BusinessRelation.ID as sb');
            params.set('expand', 'BusinessRelationInfo.DefaultEmail,SubEntity,BusinessRelationInfo.InvoiceAddress');

            return this.statisticsService
                .GetAllByUrlSearchParams(params, true).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        const idCol = new UniTableColumn('EmployeeNumber', 'Nr')
            .setWidth(90)
            .setAlignment('center');

        const nameCol = new UniTableColumn('BRName', 'Navn', UniTableColumnType.Text)
            .setWidth(300)
            .setFilterable(false);

        const emailCol = new UniTableColumn('email', 'E-post', UniTableColumnType.Link)
            .setLinkResolver(employee => {
                return (!employee || !employee.email) ? '' : `mailto:${employee.email}`;
            })
            .setFilterable(false);

        const addressCol = new UniTableColumn('Address', 'Addresse', UniTableColumnType.Text)
            .setFilterable(false);

        const birthDateCol = new UniTableColumn('BirthDate', 'Fødselsdato', UniTableColumnType.LocalDate)
            .setFilterable(false);

        const subEntityCol = new UniTableColumn(
            'SubEntityName', 'Virksomhet', UniTableColumnType.Text
        ).setWidth(350)
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

    public newEmployee() {
        this.router.navigateByUrl('/salary/employees/' + 0);
    }

}
