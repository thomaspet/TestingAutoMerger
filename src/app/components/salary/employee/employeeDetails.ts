import {Component, OnInit} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute} from '@angular/router';
import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {WidgetPoster} from '../../../../framework/widgetPoster/widgetPoster';
import {EmployeeCategoryButtons} from './employeeCategoryButtons';
import {EmployeeService} from '../../../services/services';
import {Employee, BusinessRelation} from '../../../unientities';
import {EmployeeDS} from '../../../data/employee';
import {STYRKCodesDS} from '../../../data/styrkCodes';
import {RootRouteParamsService} from '../../../services/rootRouteParams';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {ContextMenu} from '../../common/contextMenu/contextMenu';
import {IContextMenuItem} from 'unitable-ng2/main';

@Component({
    selector: 'uni-employee-details',
    templateUrl: 'app/components/salary/employee/employeeDetails.html',
    providers: [
        EmployeeDS,
        STYRKCodesDS,
        EmployeeService,
        RootRouteParamsService
    ],
    directives: [ROUTER_DIRECTIVES, WidgetPoster, UniTabs, EmployeeCategoryButtons, ContextMenu]
})
export class EmployeeDetails implements OnInit {
    public busy: boolean;
    private employee: Employee;
    private url: string;
    private employeeID: number;
    private businessRelation: BusinessRelation;
    private childRoutes: any[];
    private contextMenuItems: IContextMenuItem[];

    constructor(
        private route: ActivatedRoute,
        private rootRouteParams: RootRouteParamsService,
        private _employeeService: EmployeeService,
        private _router: Router,
        private tabService: TabService) {

        this._employeeService.employee$.subscribe((emp: Employee) => {
            console.log(emp);
            this.employee = emp;
        });

        this.childRoutes = []; // TODO: ROUTES
        this.employee = new Employee();
        this.businessRelation = new BusinessRelation();
        this.employee.BusinessRelationInfo = this.businessRelation;
        this.url = '/salary/employees/';
        this.route.params.subscribe(params => {
            this.employeeID = +params['id'];
            this.rootRouteParams.params = params;
            if (this.employeeID) {
                this.tabService.addTab({ name: 'Ansattnr. ' + this.employeeID, url: '/salary/employees/' + this.employeeID, moduleID: 12, active: true });
            } else {
                this.tabService.addTab({ name: 'Ny ansatt', url: '/salary/employees/' + this.employeeID, moduleID: 12, active: true });
            }

        });

        this.childRoutes = [
            { name: 'Detaljer', path: 'personal-details' },
            { name: 'Arbeidsforhold', path: 'employment-list' },
            { name: 'Faste poster', path: 'recurring-post' },
            { name: 'Permisjon', path: 'employee-leave' }
        ];

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
    }

    public nextEmployee() {
        this.busy = true;
        this._employeeService.getNext(this.employeeID).subscribe((response: Employee) => {
            if (response) {
                console.log(response);
                if (!response.BusinessRelationInfo) {
                    this._employeeService.get(response.ID).subscribe((emp) => {
                        this._employeeService.refreshEmployee(emp);
                        this._router.navigateByUrl(this.url + emp.ID);
                    });
                } else {
                    this._employeeService.refreshEmployee(response);
                    this._router.navigateByUrl(this.url + response.ID);
                }

            }
            this.busy = false;
        });
    }

    public previousEmployee() {
        this.busy = true;
        this._employeeService.getPrevious(this.employeeID).subscribe((response) => {
            if (response) {
                console.log(response);
                if (!response.BusinessRelationInfo) {
                    this._employeeService.get(response.ID).subscribe((emp) => {
                        this._employeeService.refreshEmployee(emp);
                        this._router.navigateByUrl(this.url + emp.ID);
                    });
                } else {
                    this._employeeService.refreshEmployee(response);
                    this._router.navigateByUrl(this.url + response.ID);
                }

            }
            this.busy = false;
        });
    }

}
