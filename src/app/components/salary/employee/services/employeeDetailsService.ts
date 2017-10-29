import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {IToolbarSearchConfig} from '../../../common/toolbar/toolbarSearch';
import {Employee} from '../../../../unientities';
import {EmployeeService, ErrorService} from '../../../../services/services';

@Injectable()
export class EmployeeDetailsService {

    constructor(
        private employeeService: EmployeeService,
        private errorService: ErrorService,
        private router: Router
    ) {}

    public setupToolbarSearchConfig(emp: Employee): IToolbarSearchConfig {
        let info = emp.BusinessRelationInfo;
        return {
            lookupFunction: (query) => this.employeeService.GetAll(
                `filter=ID ne ${emp.ID} and (startswith(EmployeeNumber, '${query}') `
                    + `or (BusinessRelationID gt 0 and contains(BusinessRelationInfo.Name, '${query}')))`
                    + `&top=50&hateoas=false`,
                ['BusinessrelationInfo']
            ).catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            itemTemplate: (item) => `${item.EmployeeNumber} - `
                + `${item.BusinessRelationInfo && item.BusinessRelationInfo.Name}`,
            initValue: emp && emp.EmployeeNumber
                ? `${emp.EmployeeNumber} - ${(info && info.Name) || 'Ansatt'}`
                : 'Ny ansatt',
            onSelect: selected => this.router.navigate(['salary/employees/' + selected.ID])
        };
    }
}
