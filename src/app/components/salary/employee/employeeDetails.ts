import {Component, provide, OnInit} from '@angular/core';
import {
    RouteConfig, 
    RouteDefinition, 
    RouteParams, 
    ROUTER_DIRECTIVES, 
    AsyncRoute, 
    Router} from '@angular/router-deprecated';
import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {WidgetPoster} from '../../../../framework/widgetPoster/widgetPoster';
import {EmployeeCategoryButtons} from './employeeCategoryButtons';
import {EmployeeService} from '../../../services/services';
import {Employee, BusinessRelation} from '../../../unientities';
import {EmployeeDS} from '../../../data/employee';
import {STYRKCodesDS} from '../../../data/styrkCodes';
import {ComponentProxy} from '../../../../framework/core/componentProxy';
import {RootRouteParamsService} from '../../../services/rootRouteParams';
import {TaxRequestModal} from './modals/taxRequestModal';

import 'rxjs/add/operator/map';

const CHILD_ROUTES = [
    new AsyncRoute({
        useAsDefault: true,
        path: '/personal-details',
        name: 'Detaljer',
        loader: () => ComponentProxy.LoadComponentAsync('PersonalDetails', 'src/app/components/salary/employee/personalDetails/personalDetails')
    }),
    new AsyncRoute({
        path: '/employmentList',
        name: 'Arbeidsforhold',
        loader: () => ComponentProxy.LoadComponentAsync('EmploymentList', 'src/app/components/salary/employee/employments/employmentList')
    }),
    new AsyncRoute({
        path: '/salarytrans',
        name: 'Faste poster',
        loader: () => ComponentProxy.LoadComponentAsync('RecurringPost', 'src/app/components/salary/employee/recurringPost/recurringPost')
    }),
    new AsyncRoute({
        path: '/employeeleave',
        name: 'Fravær',
        loader: () => ComponentProxy.LoadComponentAsync('EmployeeLeave', 'src/app/components/salary/employee/employeeLeave/employeeLeave')
    })
];

@Component({
    selector: 'uni-employee-details',
    templateUrl: 'app/components/salary/employee/employeeDetails.html',
    providers: [
            provide(EmployeeDS, {useClass: EmployeeDS}), 
            provide(STYRKCodesDS, {useClass: STYRKCodesDS}),
            EmployeeService,
            provide(RootRouteParamsService, {useClass: RootRouteParamsService})
        ],
    directives: [ROUTER_DIRECTIVES, WidgetPoster, UniTabs, EmployeeCategoryButtons]
})

@RouteConfig(CHILD_ROUTES)
export class EmployeeDetails implements OnInit {
    private employee: Employee;
    private url: string;
    private employeeID: number;
    private isNextOrPrevious: boolean;
    private businessRelation: BusinessRelation;
    private childRoutes: RouteDefinition[];

    constructor(private routeParams: RouteParams,
                private rootRouteParams: RootRouteParamsService,
                private _employeeService: EmployeeService, 
                private _router: Router) {
                    
        this.childRoutes = CHILD_ROUTES;
        this.employee = new Employee();
        this.businessRelation = new BusinessRelation();
        this.employee.BusinessRelationInfo = this.businessRelation;
        this.url = '/salary/employees/';
        this.employeeID = +this.routeParams.get('id');
        this.rootRouteParams.params = this.routeParams;
    }

    public ngOnInit() {
        if (this.employeeID) {
            if (!this.isNextOrPrevious) {
                this._employeeService.get(this.employeeID).subscribe((response: any) => {
                this.employee = response;
                }, error => console.log(error));
            }
            this.isNextOrPrevious = false;
        }else {
            this.businessRelation.Name = 'Ny Ansatt';
            this.employee.BusinessRelationInfo = this.businessRelation;
            this.employee.EmployeeNumber = 0;
        }
    }
    
    public nextEmployee() {
        this._employeeService.getNext(this.employeeID).subscribe((response) => {
            if (response) {
                this.employee = response;
                this.isNextOrPrevious = true;
                this._router.navigateByUrl(this.url + this.employee.ID);
            }
        });
    }
    
    public previousEmployee() {
        this._employeeService.getPrevious(this.employeeID).subscribe((response) => {
            if (response) {
                this.employee = response;
                this.isNextOrPrevious = true;
                this._router.navigateByUrl(this.url + this.employee.ID);
            }
        });
    }

}
