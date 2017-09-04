import {Component, ViewChild, Input, Output, EventEmitter, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Project, Department, Team, User, Employee, Seller} from '../../../unientities';
import {UniForm, UniField, UniFieldLayout, FieldType} from '../../../../framework/ui/uniform/index';
import {ToastService, ToastTime, ToastType} from '../../../../framework/uniToast/toastService';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IUniSaveAction} from '../../../../framework/save/save';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {IToolbarConfig} from './../../common/toolbar/toolbar';
import {Observable} from 'rxjs/Observable';
import {UniModalService} from '../../../../framework/uniModal/barrel';
import {
    ErrorService,
    ProjectService,
    DepartmentService,
    TeamService,
    SellerService,
    UserService,
    EmployeeService
} from '../../../services/services';

declare const _;

@Component({
    selector: 'seller-list',
    templateUrl: './sellerDetails.html',
})
export class SellerDetails {
    @Input()
    public sellerId: any;

    @ViewChild(UniForm)
    public form: UniForm;

    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public seller$: BehaviorSubject<Seller> = new BehaviorSubject(null);
    public isDirty: boolean = false;

    private expandOptions: Array<string> = ['DefaultDimensions', 'User'];
    private toolbarconfig: IToolbarConfig;

    private projects: Project[];
    private departments: Department[];
    private users: User[];
    private teams: Team[];
    private employees: Employee[];

    private formIsInitialized: boolean = false;

    private saveactions: IUniSaveAction[] = [
         {
             label: 'Lagre',
             action: (completeEvent) => this.saveSeller(completeEvent),
             main: true,
             disabled: false
         }
    ];

    constructor(private router: Router,
                private route: ActivatedRoute,
                private errorService: ErrorService,
                private toastService: ToastService,
                private tabService: TabService,
                private projectService: ProjectService,
                private departmentService: DepartmentService,
                private teamService: TeamService,
                private sellerService: SellerService,
                private userService: UserService,
                private employeeService: EmployeeService,
                private modalService: UniModalService) {
        this.route.params.subscribe(params => {
            this.sellerId = +params['id'];
            this.setupForm();
        });
    }

    public canDeactivate(): boolean | Observable<boolean> {
        if (!this.isDirty) {
            return true;
        }

        return this.modalService.openUnsavedChangesModal().onClose;
    }

    // Load

    private setupForm() {
        if (!this.formIsInitialized) {
            this.setupFields();
            Observable.forkJoin(
                this.projectService.GetAll(null),
                this.departmentService.GetAll(null),
                this.userService.GetAll(null),
                this.teamService.GetAll(null),
                this.employeeService.GetAll(null)
            ).subscribe(res => {
                this.projects = res[0];
                this.departments = res[1];
                this.users = res[2];
                this.teams = res[3];
                this.employees = res[4];

                this.projects.unshift(null);
                this.departments.unshift(null);
                this.users.unshift(null);
                this.teams.unshift(null);
                this.employees.unshift(null);

                this.formIsInitialized = true;
                this.extendFormConfig();

                this.loadSeller();
            });
        } else {
            this.loadSeller();
        }
    }

    private loadSeller() {
        let subject = null;
        if (this.sellerId > 0) {
            subject = this.sellerService.Get(this.sellerId, this.expandOptions);
        } else {
            subject = this.sellerService.GetNewEntity();
        }

        subject.subscribe(seller => {
            this.seller$.next(seller);
            this.setupToolbar();
        });
    }

    // Save

    private saveSeller(complete) {
        let seller = this.seller$.getValue();
        if (seller.DefaultDimensions && (!seller.DefaultDimensions.ID || seller.DefaultDimensions.ID === 0)) {
            seller.DefaultDimensions['_createguid'] = this.sellerService.getNewGuid();
        }

        if (this.sellerId > 0) {
            this.sellerService.Put(seller.ID, seller).subscribe(
                (updated) => {
                    complete('Selger lagret');
                    this.isDirty = false;
                    this.loadSeller();
                },
                (err) => {
                    complete('Feil oppstod ved lagring');
                    this.errorService.handle(err);
                }
            );
        } else {
            this.sellerService.Post(seller).subscribe(
                (newSeller) => {
                    complete('Selger lagret');
                    this.isDirty = false;
                    this.router.navigateByUrl('/sales/sellers/' + newSeller.ID);
                },
                (err) => {
                    complete('Feil oppstod ved lagring');
                    this.errorService.handle(err);
                }
            );
        }
    }

    // Navigation

    private setupToolbar() {
        let subheads = [];
        if (this.sellerId > 0) {
            subheads.push({title: this.seller$.getValue().Name});
        }

        this.toolbarconfig = {
            title: this.sellerId > 0 ? 'Selger' : 'Ny selger',
            subheads: subheads,
            navigation: {
                prev: () => this.previousSeller(),
                next: () => this.nextSeller(),
                add: () => this.addSeller()
            }
        };
    }

    private previousSeller() {
        this.sellerService.getPreviousID(this.seller$.getValue().ID)
            .subscribe((ID) => {
                if (ID) {
                    this.router.navigateByUrl('/sales/sellers/' + ID);
                } else {
                    this.toastService.addToast('Ingen flere selgere før denne!', ToastType.warn, ToastTime.short);
                }
            }, err => this.errorService.handle(err));
    }

    private nextSeller() {
        this.sellerService.getNextID(this.seller$.getValue().ID)
            .subscribe((ID) => {
                if (ID) {
                    this.router.navigateByUrl('/sales/sellers/' + ID);
                } else {
                    this.toastService.addToast('Ingen flere selgere etter denne!', ToastType.warn, ToastTime.short);
                }
            }, err => this.errorService.handle(err));
    }

    private addSeller() {
        this.router.navigateByUrl('/sales/sellers/0');
    }

    private onFormChange(event) {
        this.isDirty = true;
    }

    // Layout

    private extendFormConfig() {
        let project: UniFieldLayout = this.fields$.getValue().find(x => x.Property === 'DefaultDimensions.ProjectID');
        project.Options = {
            source: this.projects,
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.ProjectNumber + ': ' + item.Name) : '';
            },
            debounceTime: 200
        };

        let department: UniFieldLayout = this.fields$.getValue().find(x => x.Property === 'DefaultDimensions.DepartmentID');
        department.Options = {
            source: this.departments,
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.DepartmentNumber + ': ' + item.Name) : '';
            },
            debounceTime: 200
        };

        let user: UniFieldLayout = this.fields$.getValue().find(x => x.Property === 'UserID');
        user.Options = {
            source: this.users,
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.ID + ': ' + item.DisplayName) : '';
            },
            debounceTime: 200
        };

        let team: UniFieldLayout = this.fields$.getValue().find(x => x.Property === 'TeamID');
        team.Options = {
            source: this.teams,
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.ID + ': ' + item.Name) : '';
            },
            debounceTime: 200
        };

        let employee: UniFieldLayout = this.fields$.getValue().find(x => x.Property === 'EmployeeID');
        employee.Options = {
            source: this.employees,
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.EmployeeNumber + ': ' + item.BusinessRelationInfo.Name) : '';
            },
            debounceTime: 200
        };
    }

    private setupFields() {
        let fields: UniFieldLayout[] = [
            <any> {
                Legend: 'Detaljer',
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: 'Seller',
                Property: 'Name',
                Placement: 2,
                FieldType: FieldType.TEXT,
                Label: 'Navn',
                Description: '',
                HelpText: '',
                Section: 0
            },
            <any> {
                Legend: 'Detaljer',
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: 'Seller',
                Property: 'UserID',
                Placement: 2,
                FieldType: FieldType.DROPDOWN,
                Label: 'Bruker',
                Description: '',
                HelpText: '',
                Section: 0,
            },
            <any> {
                Legend: 'Detaljer',
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: 'Seller',
                Property: 'EmployeeID',
                Placement: 2,
                FieldType: FieldType.DROPDOWN,
                Label: 'Ansatt',
                Description: '',
                HelpText: '',
                Section: 0,
            },
            <any> {
                Legend: 'Detaljer',
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: 'Seller',
                Property: 'TeamID',
                Placement: 2,
                FieldType: FieldType.DROPDOWN,
                Label: 'Team',
                Description: '',
                HelpText: '',
                Section: 0,
            },
            <any> {
                Legend: 'Dimensjoner',
                FieldSet: 2,
                FieldSetColumn: 1,
                EntityType: 'Seller',
                Property: 'DefaultDimensions.ProjectID',
                Placement: 4,
                FieldType: FieldType.DROPDOWN,
                Label: 'Prosjekt',
                Description: '',
                HelpText: '',
                Section: 0
            },
            <any> {
                Legend: 'Dimensjoner',
                FieldSet: 2,
                FieldSetColumn: 1,
                EntityType: 'Seller',
                Property: 'DefaultDimensions.DepartmentID',
                Placement: 4,
                FieldType: FieldType.DROPDOWN,
                Label: 'Avdeling',
                Description: '',
                HelpText: '',
                Section: 0
            }];

        this.fields$.next(fields);
    }
}
