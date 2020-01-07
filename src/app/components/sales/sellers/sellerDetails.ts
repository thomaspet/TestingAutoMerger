import {Component, ViewChild, Input} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';

import {UniForm, UniFieldLayout, FieldType} from '@uni-framework/ui/uniform/index';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {IUniSaveAction} from '@uni-framework/save/save';

import {IUniTab} from '@uni-framework/uni-tabs';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IToolbarConfig, IToolbarSubhead} from './../../common/toolbar/toolbar';
import {UniModalService, ConfirmActions} from '@uni-framework/uni-modal';

import {
    Project,
    Department,
    Team,
    User,
    Employee,
    Seller,
    StatusCodeCustomerInvoice
} from '@app/unientities';
import {
    ErrorService,
    ProjectService,
    DepartmentService,
    TeamService,
    SellerService,
    UserService,
    EmployeeService,
    NumberFormat,
    StatisticsService
} from '@app/services/services';

declare const _;

@Component({
    selector: 'seller-details',
    templateUrl: './sellerDetails.html',
})
export class SellerDetails {
    @ViewChild(UniForm, { static: false })
    public form: UniForm;

    public sellerID: number;

    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public seller$: BehaviorSubject<Seller> = new BehaviorSubject(null);
    public isDirty: boolean = false;

    private expandOptions: Array<string> = ['DefaultDimensions', 'User'];
    public toolbarconfig: IToolbarConfig;
    public toolbarSubheads: IToolbarSubhead[];

    public activeTab: IUniTab;
    public activeTabIndex: number = 0;
    public tabs: IUniTab[] = [
        {name: 'Detaljer'},
        {name: 'Tilbud', value: 'quotes'},
        {name: 'Ordre', value: 'orders'},
        {name: 'Faktura', value: 'invoices'},
    ];

    private projects: Project[];
    private departments: Department[];
    private users: User[];
    private teams: Team[];
    private employees: Employee[];

    private formIsInitialized: boolean = false;

    public saveactions: IUniSaveAction[] = [{
        label: 'Lagre',
        action: (completeEvent) => this.saveSeller().subscribe(
            res => completeEvent('Selger lagret'),
            err => {
                completeEvent('Lagring feilet');
                this.errorService.handle(err);
            }
        ),
        main: true,
        disabled: false
    }];

    constructor(
        private router: Router,
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
        private modalService: UniModalService,
        private numberFormat: NumberFormat,
        private statisticsService: StatisticsService
    ) {
        this.route.params.subscribe(params => {
            this.sellerID = +params['id'];
            this.tabService.addTab({
                name: 'Selger',
                url: '/sales/sellers/' + this.sellerID,
                active: true,
                moduleID: UniModules.Sellers
            });

            this.setupForm();
            this.loadSalesSums();
        });
    }

    ngOnInit() {
        this.route.url.subscribe(url => {
            // if seller url has sales as last url, use invoice as active tab
            if (url[2] && url[2].path === 'sales') {
                this.activeTabIndex = 3;
                this.activeTab = { name: 'Faktura', value: 'invoices' };
            }
        });
    }

    public canDeactivate(): boolean | Observable<boolean> {
        if (!this.isDirty) {
            return true;
        }

        return this.modalService.openUnsavedChangesModal().onClose.switchMap(res => {
            if (res === ConfirmActions.ACCEPT) {
                return this.saveSeller().map(
                    savedSeller => true,
                    error => false
                );
            } else if (res === ConfirmActions.REJECT) {
                return Observable.of(true);
            } else {
                return Observable.of(false);
            }
        });
    }

    private setupForm() {
        if (!this.formIsInitialized) {
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

                this.fields$.next(this.getFormFields());
                this.loadSeller();
            });
        } else {
            this.loadSeller();
        }
    }

    private loadSeller() {
        let subject = null;
        if (this.sellerID) {
            subject = this.sellerService.Get(this.sellerID, this.expandOptions);
        } else {
            subject = this.sellerService.GetNewEntity();
        }

        subject.subscribe(seller => {
            this.seller$.next(seller);
            this.setupToolbar();
        });
    }

    private saveSeller(): Observable<Seller> {
        const seller = this.seller$.getValue();
        if (seller.DefaultDimensions && (!seller.DefaultDimensions.ID || seller.DefaultDimensions.ID === 0)) {
            seller.DefaultDimensions['_createguid'] = this.sellerService.getNewGuid();
        }

        const saveRequest = this.sellerID
            ? this.sellerService.Put(seller.ID, seller)
            : this.sellerService.Post(seller);

        return saveRequest.map(res => {
            this.isDirty = false;
            if (this.sellerID) {
                this.loadSeller();
            } else {
                this.router.navigateByUrl('/sales/sellers/' + res.ID);
            }

            return res;
        });
    }

    private setupToolbar() {
        this.toolbarconfig = {
            title: this.sellerID ? this.seller$.getValue().Name : 'Ny selger',
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
                    this.toastService.addToast(
                        'Ingen flere selgere før denne selgeren!', ToastType.warn, ToastTime.short
                    );
                }
            }, err => this.errorService.handle(err));
    }

    private nextSeller() {
        this.sellerService.getNextID(this.seller$.getValue().ID)
            .subscribe((ID) => {
                if (ID) {
                    this.router.navigateByUrl('/sales/sellers/' + ID);
                } else {
                    this.toastService.addToast(
                        'Ingen flere selgere etter denne selgeren!', ToastType.warn, ToastTime.short
                    );
                }
            }, err => this.errorService.handle(err));
    }

    private addSeller() {
        this.router.navigateByUrl('/sales/sellers/0');
    }

    public onFormChange(event) {
        this.isDirty = true;
    }

    private loadSalesSums() {
        this.statisticsService.GetAllUnwrapped(
             `model=CustomerInvoice&select=sum(TaxInclusiveAmount) as TotalAmount,`
             + `sum(TaxInclusiveAmount mul casewhen(SellerLink.Percent gt 0,`
             + `SellerLink.Percent,100) div 100) as SellerTotalAmount,count(ID) as TotalCount`
             + `&join=CustomerInvoice.ID eq SellerLink.CustomerInvoiceID`
             + `&filter=SellerLink.SellerID eq ${this.sellerID} and StatusCode ne ${StatusCodeCustomerInvoice.Draft} `
             + `and year(InvoiceDate) eq thisyear()`
         ).subscribe(response => {
             const sums = response[0];
             this.toolbarSubheads = [
                 {
                     label: 'Totalsum i år',
                     title: this.numberFormat.asMoney(sums.TotalAmount || 0),
                 },
                 {
                     label: 'Selgersum i år',
                     title: this.numberFormat.asMoney(sums.SellerTotalAmount || 0),
                 },
                 {
                     label: 'Antall salg i år',
                     title: sums.TotalCount || 0,
                 },
             ];

         });
     }

    private getFormFields(): UniFieldLayout[] {
        return [
            <any> {
                Legend: 'Detaljer',
                FieldSet: 1,
                Property: 'Name',
                FieldType: FieldType.TEXT,
                Label: 'Navn',
            },
            <any> {
                FieldSet: 1,
                Property: 'UserID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Bruker',
                Options: {
                    source: this.users,
                    valueProperty: 'ID',
                    template: (item) => {
                        return item !== null ? (item.ID + ': ' + item.DisplayName) : '';
                    },
                    debounceTime: 200
                }
            },
            <any> {
                FieldSet: 1,
                Property: 'EmployeeID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Ansatt',
                Options: {
                    source: this.employees,
                    valueProperty: 'ID',
                    template: (item) => {
                        return item !== null ? (item.EmployeeNumber + ': ' + item.BusinessRelationInfo.Name) : '';
                    },
                    debounceTime: 200
                }
            },
            <any> {
                FieldSet: 1,
                Property: 'TeamID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Team',
                Options: {
                    source: this.teams,
                    valueProperty: 'ID',
                    template: (item) => {
                        return item !== null ? (item.ID + ': ' + item.Name) : '';
                    },
                    debounceTime: 200
                }
            },
            <any> {
                Legend: 'Dimensjoner',
                FieldSet: 2,
                Property: 'DefaultDimensions.ProjectID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Prosjekt',
                Options: {
                    source: this.projects,
                    valueProperty: 'ID',
                    template: (item) => {
                        return item !== null ? (item.ProjectNumber + ': ' + item.Name) : '';
                    },
                    debounceTime: 200
                }
            },
            <any> {
                FieldSet: 2,
                Property: 'DefaultDimensions.DepartmentID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Avdeling',
                Options: {
                    source: this.departments,
                    valueProperty: 'ID',
                    template: (item) => {
                        return item !== null ? (item.DepartmentNumber + ': ' + item.Name) : '';
                    },
                    debounceTime: 200
                }
            }];
    }
}
