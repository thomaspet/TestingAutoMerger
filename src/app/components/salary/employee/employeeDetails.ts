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
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {ContextMenu} from '../../common/contextMenu/contextMenu';
import {IContextMenuItem} from 'unitable-ng2/main';

import 'rxjs/add/operator/map';

const CHILD_ROUTES = [
    new AsyncRoute({
        useAsDefault: true,
        path: '/personal-details',
        name: 'Detaljer',
        loader: () => ComponentProxy.LoadComponentAsync('PersonalDetails', 'app/components/salary/employee/personalDetails/personalDetails')
    }),
    new AsyncRoute({
        path: '/employmentList',
        name: 'Arbeidsforhold',
        loader: () => ComponentProxy.LoadComponentAsync('EmploymentList', 'app/components/salary/employee/employments/employmentList')
    }),
    new AsyncRoute({
        path: '/recurringpost',
        name: 'Faste poster',
        loader: () => ComponentProxy.LoadComponentAsync('RecurringPost', 'app/components/salary/employee/recurringPost/recurringPost')
    }),
    new AsyncRoute({
        path: '/employeeleave',
        name: 'Permisjon',
        loader: () => ComponentProxy.LoadComponentAsync('EmployeeLeave', 'app/components/salary/employee/employeeLeave/employeeLeave')
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
    directives: [ROUTER_DIRECTIVES, WidgetPoster, UniTabs, EmployeeCategoryButtons, ContextMenu]
})

@RouteConfig(CHILD_ROUTES)
export class EmployeeDetails implements OnInit {
    public busy: boolean;
    private employee: Employee;
    private url: string;
    private employeeID: number;
    private isNextOrPrevious: boolean;
    private businessRelation: BusinessRelation;
    private childRoutes: RouteDefinition[];
    private contextMenuItems: IContextMenuItem[];

    constructor(private routeParams: RouteParams,
                private rootRouteParams: RootRouteParamsService,
                private _employeeService: EmployeeService,
                private _router: Router,
                private tabService: TabService) {

        this.childRoutes = CHILD_ROUTES;
        this.employee = new Employee();
        this.businessRelation = new BusinessRelation();
        this.employee.BusinessRelationInfo = this.businessRelation;
        this.url = '/salary/employees/';
        this.employeeID = +this.routeParams.get('id');
        this.rootRouteParams.params = this.routeParams;
        this.tabService.addTab({ name: 'Ansattnr. ' + this.employeeID, url: '/salary/employees/' + this.employeeID, moduleID: 12, active: true });

        this.contextMenuItems = [
            {
                label: 'Kittens',
                action: () => {
                    window.alert('Kattunger er søte!');
                }
            },
            {
                label: 'Sloths',
                action: () => {
                    window.alert('Dovendyr burde hete sløveløver');
                }
            },
            {
                label: 'Baby elephants',
                action: () => {
                    window.alert('Babyelefanter er tøffe!');
                }
            }
        ];

    }

    public ngOnInit() {
        if (this.employeeID) {
            if (!this.isNextOrPrevious) {
                this.busy = true;
                this._employeeService.get(this.employeeID).subscribe((response: any) => {
                this.employee = response;
                this.busy = false;
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
        this.busy = true;
        this._employeeService.getNext(this.employeeID).subscribe((response) => {
            if (response) {
                this.employee = response;
                this.isNextOrPrevious = true;
                this._router.navigateByUrl(this.url + this.employee.ID);
            }
            this.busy = false;
        });
    }

    public previousEmployee() {
        this.busy = true;
        this._employeeService.getPrevious(this.employeeID).subscribe((response) => {
            if (response) {
                this.employee = response;
                this.isNextOrPrevious = true;
                this._router.navigateByUrl(this.url + this.employee.ID);
            }
            this.busy = false;
        });
    }

}
