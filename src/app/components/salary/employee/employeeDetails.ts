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
    private isNextOrPrevious: boolean;
    private businessRelation: BusinessRelation;
    private childRoutes: any[];
    private contextMenuItems: IContextMenuItem[];

    constructor(private route: ActivatedRoute,
                private rootRouteParams: RootRouteParamsService,
                private _employeeService: EmployeeService,
                private _router: Router,
                private tabService: TabService) {

        this.childRoutes = []; // TODO: ROUTES
        this.employee = new Employee();
        this.businessRelation = new BusinessRelation();
        this.employee.BusinessRelationInfo = this.businessRelation;
        this.url = '/salary/employees/';
        this.route.params.subscribe(params => {
            this.employeeID = +params['id'];
            this.rootRouteParams.params = params;
            this.tabService.addTab({ name: 'Ansattnr. ' + this.employeeID, url: '/salary/employees/' + this.employeeID, moduleID: 12, active: true });
        });

        this.childRoutes = [
            {name: 'Detaljer', path: 'personal-details'},
            {name: 'Arbeidsforhold', path: 'employment-list'},
            {name: 'Faste poster', path: 'recurring-post'},
            {name: 'Permisjon', path: 'employee-leave'}
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
