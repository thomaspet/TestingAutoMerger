import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';

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

    constructor(
        private router: Router,
        private tabService: TabService
    ) {
        this.tabService.addTab(
            {
                name: 'Ansatte',
                url: '/salary/employees',
                moduleID: UniModules.Employees,
                active: true
            }
        );
    }

    public newEmployee() {
        this.router.navigateByUrl('/salary/employees/' + 0);
    }

}
