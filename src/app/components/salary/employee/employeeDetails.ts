import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute} from '@angular/router';
import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {WidgetPoster} from '../../../../framework/widgetPoster/widgetPoster';
import {EmployeeCategoryButtons} from './employeeCategoryButtons';
import {EmployeeService, EmploymentService, UniCacheService} from '../../../services/services';
import {Employee} from '../../../unientities';
import {EmployeeDS} from '../../../data/employee';
import {STYRKCodesDS} from '../../../data/styrkCodes';
import {RootRouteParamsService} from '../../../services/rootRouteParams';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {ContextMenu} from '../../common/contextMenu/contextMenu';

import {UniView} from '../../../../framework/core/uniView';

@Component({
    selector: 'uni-employee-details',
    templateUrl: 'app/components/salary/employee/employeeDetails.html',
    providers: [
        EmployeeDS,
        STYRKCodesDS,
        EmployeeService,
        RootRouteParamsService,
        EmploymentService
    ],
    directives: [
        ROUTER_DIRECTIVES,
        WidgetPoster,
        UniTabs,
        EmployeeCategoryButtons,
        ContextMenu
    ]
})
export class EmployeeDetails extends UniView {
    public busy: boolean;
    private employee: Employee;
    private url: string = '/salary/employees/';
    private childRoutes: any[];

    constructor(
        private route: ActivatedRoute,
        private rootRouteParams: RootRouteParamsService,
        private employeeService: EmployeeService,
        private router: Router,
        private tabService: TabService,
        cacheService: UniCacheService) {

        super(router.url, cacheService);

        this.childRoutes = [
            { name: 'Detaljer', path: 'personal-details' },
            { name: 'Arbeidsforhold', path: 'employments' },
            { name: 'Faste poster', path: 'recurring-post' },
            { name: 'Permisjon', path: 'employee-leave' }
        ];


        // this.employee = super.getStateVar('employee');

        this.route.params.subscribe((params) => {
            const employeeID = +params['id'];

            // Check cache for employee
            let employeeSubject = super.getStateSubject('employee');

            // If we're the first one to subscribe to the subject
            // we will have to GET data from backend and update the subject ourselves
            if (!employeeSubject.observers.length) {
                this.employeeService.get(employeeID).subscribe((employee: Employee) => {
                    this.employee = employee;
                    super.updateState('employee', employee, false);
                });
            }

            employeeSubject.subscribe(employee => this.employee = employee);

            // Add module to navbar tabs
            if (employeeID) {
                this.tabService.addTab({
                    name: 'Ansattnr. ' + employeeID,
                    url: this.url + employeeID,
                    moduleID: 12,
                    active: true
                });
            } else {
                this.tabService.addTab({
                    name: 'Ny ansatt',
                    url: this.url + employeeID,
                    moduleID: 12,
                    active: true
                });
            }

            // REVISIT: Do we need rootRouteParams?
            // Can't we just get the params with angular's route api?
            this.rootRouteParams.params = params;
        });

    }

    public nextEmployee() {
        if (!super.canDeactivate()) {
            return;
        }

        this.employeeService.getNext(this.employee.ID).subscribe((next: Employee) => {
            if (next) {
                // super.setStateVar('employee', next, false);
                super.updateState('employee', next, false);
                let childRoute = this.router.url.split('/').pop();
                this.router.navigateByUrl(this.url + next.ID + '/' + childRoute);
            }
        });
    }

    public previousEmployee() {
        if (!super.canDeactivate()) {
            return;
        }

        this.employeeService.getPrevious(this.employee.ID).subscribe((prev: Employee) => {
            if (prev) {
                super.updateState('employee', prev, false);
                let childRoute = this.router.url.split('/').pop();
                this.router.navigateByUrl(this.url + prev.ID + '/' + childRoute);
            }
        });
    }

}
