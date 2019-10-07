import {Component, ViewChild, ElementRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Router, ActivationEnd} from '@angular/router';
import {IToolbarConfig} from '../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../framework/save/save';
import {KpiCompany} from './kpiCompanyModel';
import {BureauTagsDictionary} from '@app/components/bureau/bureauPreferencesModel';
import {UniEditFieldModal} from '@uni-framework/uni-modal/modals/editFieldModal';
import {AuthService} from '../../authService';
import {UniHttp} from '../../../framework/core/http/http';
import {BureauCurrentCompanyService} from './bureauCurrentCompanyService';
import {SubCompanyModal} from '@uni-framework/uni-modal/modals/subCompanyModal';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ErrorService, CompanyService, BrowserStorageService} from '@app/services/services';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {IUniTab} from '@app/components/layout/uniTabs/uniTabs';
import {CompanyGroupModal, ICompanyGroup} from './company-group-modal/company-group-modal';
import {IModalOptions, CompanyActionsModal, UniModalService} from '@uni-framework/uni-modal';
import {WizardSettingsModal} from '@uni-framework/uni-modal/modals/wizard-settings-modal/wizard-settings-modal';

enum KPI_STATUS {
    StatusUnknown = 0,
    StatusInProgress = 1,
    StatusError = 2,
    StatusReady = 3,
}

interface AllTagsType {
    name: string;
    count: number;
}

export interface IBureauPreferences {
    filterString: string;
    sortIsDesc: boolean;
    sortField: string;
    detailsMinimized?: boolean;
    filters?: ICompanyGroup[];
    activeFilterIndex?: number;
}

@Component({
    selector: 'uni-bureau-dashboard',
    templateUrl: './bureauDashboard.html'
})
export class BureauDashboard {
    @ViewChild('contextMenu') private contextMenu: ElementRef;
    @ViewChild(AgGridWrapper) private table: AgGridWrapper;

    companies: KpiCompany[];
    private subCompanies: { ID: number, Name: string, CustomerNumber: number, CompanyKey: string }[];

    toolbarConfig: IToolbarConfig;
    saveActions: IUniSaveAction[];

    filteredCompanies: KpiCompany[];
    highlightedCompany: KpiCompany;
    detailsMinimized: boolean;

    searchControl: FormControl;
    busy: boolean = false;
    currentSortField: string;
    sortIsDesc: boolean = true;
    companyTags: BureauTagsDictionary = {};

    allTags: AllTagsType[];
    activeTag: string;

    groups: ICompanyGroup[] = [];
    activeGroup: ICompanyGroup;
    activeGroupIndex: number = -1;

    tableConfig: UniTableConfig = this.getTableConfig();
    detailsTabs: IUniTab[] = [
        {name: 'Oppgaver', path: 'tasks'},
        {name: 'Firma', path: 'company'},
        {name: 'Regnskap', path: 'accounting'},
        {name: 'Salg', path: 'sales'},
        {name: 'Lønn', path: 'salary'},
        {name: 'Time', path: 'hours'},
    ];

    onDestroy$ = new Subject();

    constructor(
        private errorService: ErrorService,
        private authService: AuthService,
        private uniModalService: UniModalService,
        private uniHttp: UniHttp,
        private companyService: CompanyService,
        public currentCompanyService: BureauCurrentCompanyService,
        private modalService: UniModalService,
        private router: Router,
        private browserStorage: BrowserStorageService,
    ) {

        this.toolbarConfig = {
            title: '',
            hideBreadcrumbs: true
        };

        this.saveActions = [
            {
                label : 'Administrer selskaper',
                action: () => this.router.navigateByUrl('/license-info/companies')
            }
        ];
    }

    public ngOnInit() {
        const userPreferences = this.browserStorage.getItem('bureau_user_preferences') || {};

        this.searchControl = new FormControl(userPreferences.filterString || '');
        this.sortIsDesc = userPreferences.sortIsDesc || true;
        this.currentSortField = userPreferences.sortField;
        this.detailsMinimized = userPreferences.detailsMinimized;

        const groups = userPreferences.filters || [];
        if (!groups.some(g => g.name === 'Alle selskaper')) {
            groups.unshift({
                name: 'Alle selskaper',
                static: true
            });
        }

        this.groups = groups;
        this.activeGroup = this.groups.find(g => g.active) || this.groups[0];

        this.authService.authentication$.pipe(
            takeUntil(this.onDestroy$)
        ).subscribe(auth => {
            const user = auth && auth.user;
            if (user) {
                const agency = user.License.Company.Agency.Name;
                this.toolbarConfig.title = 'Mine selskaper' + (agency ? ` - ${agency}` : '');
            }
        });

        this.searchControl.valueChanges.subscribe(() => {
            this.filterCompanies();
        });

        this.busy = true;
        this.loadSubCompanies();
        this.loadCompanies();

        this.router.events
            .filter((event) => event instanceof ActivationEnd)
            .subscribe((change: ActivationEnd) => this.activeTag = change.snapshot.queryParams['tag']);
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
        this.saveUserPreferences();
    }

    private loadCompanies() {
        this.uniHttp
            .asGET()
            .usingRootDomain()
            .withEndPoint('kpi/companies')
            .send()
            .map(res => res.body)
            .do(() => this.busy = false)
            .subscribe(
                res => {
                    this.companies = this.mapKpiCounts(res);
                    if (this.subCompanies) { this.mergeWithSubCompanies(this.companies, this.subCompanies); }
                    if (this.companies.length > 0) {
                        this.setCurrentCompany(this.companies[0]);
                    }
                    this.filterCompanies();
                },
                err => this.errorService.handle(err)
            );
    }

    activateGroup(group?: ICompanyGroup) {
        this.groups.forEach(g => {
            g.active = g === group;
        });

        this.activeGroup = group;
        this.filterCompanies();
    }

    editGroups() {
        const activeIndex = this.groups.findIndex(g => g.active);
        this.modalService.open(CompanyGroupModal, {
            data: {
                groups: this.groups,
                activeGroupIndex: activeIndex,
                companies: this.companies
            }
        }).onClose.subscribe(updatedGroups => {
            if (updatedGroups) {
                this.groups = updatedGroups;
                this.activeGroup = this.groups[activeIndex] || this.groups[0];
                this.filterCompanies();

                this.saveUserPreferences();
            }
        });
    }

    private loadSubCompanies(isRefresh = false) {
        this.uniHttp.asGET()
        .usingRootDomain()
        .withEndPoint(`statistics?model=subcompany`
            + `&select=customer.id as ID,info.name as Name,customer.customernumber as CustomerNumber,companykey as CompanyKey`
            + `&filter=customerid gt 0&expand=customer.info&wrap=false`)
        .send()
        .map(res => res.body)
        .do(() => this.busy = false)
        .subscribe(
            res => {
                this.subCompanies = res;
                if (this.companies) {
                    this.mergeWithSubCompanies(this.companies, this.subCompanies);
                }
                if (isRefresh) {
                    this.companies = [...this.companies];
                    this.filterCompanies();
                }
            },
            err => this.errorService.handle(err)
        );
    }

    private mergeWithSubCompanies(list: KpiCompany[], subs: { ID: number, Name: string, CustomerNumber: number, CompanyKey: string}[]) {
        list.forEach( company => {
            const lKey = company.Key.toLowerCase();
            company['SubCompany'] = subs.find( x => x.CompanyKey && x.CompanyKey.toLowerCase() === lKey);
        });
    }

    private getTableConfig(): UniTableConfig {
        const companyNameCol = new UniTableColumn('Name', 'Selskap', UniTableColumnType.Link)
            .setCls('bureau-link-col')
            .setConditionalCls(company => {
                return company.IsTemplate ? 'template-company' : '';
            })
            .setWidth(240);

        const orgnrCol = new UniTableColumn('OrganizationNumber', 'Org.nr');

        const clientNrCol = new UniTableColumn('ClientNumber', 'Klientnr');

        const inboxCol =  new UniTableColumn('_inboxCount', 'Fakturainnboks', UniTableColumnType.Link)
            .setCls('bureau-link-col')
            .setAlignment('center');

        const approvalCol = new UniTableColumn('_approvedCount', 'Godkjente faktura', UniTableColumnType.Link)
            .setCls('bureau-link-col')
            .setAlignment('center');

        const toBePayedCol = new UniTableColumn('_toBePayedCount', 'Til utbetaling', UniTableColumnType.Link)
            .setCls('bureau-link-col')
            .setVisible(false)
            .setAlignment('center');

        const toBeRemindedCol = new UniTableColumn('_toBeRemindedCount', 'Klar til purring', UniTableColumnType.Link)
            .setCls('bureau-link-col')
            .setVisible(false)
            .setAlignment('center');

        const subCompanyCol = new UniTableColumn('SubCompany.Name', 'Lokal kunde', UniTableColumnType.Link)
            .setVisible(false)
            .setCls('bureau-link-col');

        companyNameCol.linkClick = row => this.onCompanyNameClick(row);
        inboxCol.linkClick = row => this.onCompanyInboxClick(row);
        approvalCol.linkClick = row => this.onCompanyApprovalsClick(row);
        subCompanyCol.linkClick = row => this.router.navigateByUrl('/sales/customer/' + row.SubCompany.ID);
        toBePayedCol.linkClick = row => this.redirectToCompanyUrl(row, '/bank?code=payment_list');
        toBeRemindedCol.linkClick = row => this.redirectToCompanyUrl(row, '/sales/reminders/ready');

        return new UniTableConfig('bureau_company_list', false, true, 15)
            .setAutofocus(true)
            .setColumnMenuVisible(true)
            .setColumns([
                companyNameCol,
                orgnrCol,
                clientNrCol,
                inboxCol,
                approvalCol,
                toBePayedCol,
                toBeRemindedCol,
                subCompanyCol,
            ])
            .setContextMenu([
                {
                    label: 'Administrer brukertilganger',
                    action: company => this.redirectToCompanyUrl(company, '/settings/users')
                },
                {
                    label: 'Opprett som kunde',
                    action: company => this.createCustomer(company)
                },
                {
                    label: 'Rediger klientnr',
                    action: company => this.editClientNumber(company)
                }
            ]);
    }

    private saveUserPreferences() {
        try {
            const preferences: IBureauPreferences = {
                filterString: <string>(this.searchControl.value || ''),
                sortIsDesc: this.sortIsDesc,
                sortField: this.currentSortField,
                detailsMinimized: this.detailsMinimized || false,
                filters: this.groups,
                activeFilterIndex: this.activeGroupIndex
            };

            this.browserStorage.setItem('bureau_user_preferences', preferences);
        } catch (e) {}
    }

    filterCompanies(): void {
        const filterString = this.searchControl.value || '';

        let filteredCompanies = [];

        if (this.activeGroup && this.activeGroup.companyKeys) {
            const companyKeys = this.activeGroup.companyKeys || [];
            filteredCompanies = this.companies.filter(company => companyKeys.some(key => key === company.Key));
        } else {
            filteredCompanies = this.companies;
        }

        // if (this.activeGroupIndex >= 0 && this.groups[this.activeGroupIndex]) {
        //     const companyKeys = this.groups[this.activeGroupIndex].companyKeys || [];
        //     filteredCompanies = this.companies.filter(company => companyKeys.some(key => key === company.Key));
        // } else {
        //     filteredCompanies = this.companies;
        // }

        if (filteredCompanies && filterString) {
            filteredCompanies = filteredCompanies.filter(company => {
                if (this.isNumber(filterString)) {
                    return company.ClientNumber === +filterString;
                } else {
                    return company.Name.toLowerCase().includes(filterString.toLowerCase());
                }
            });
        }

        this.filteredCompanies = filteredCompanies;
    }

    private isNumber(value: string | number): boolean {
        return !isNaN(Number(value.toString()));
    }

    private mapKpiCounts(companies: KpiCompany[]): KpiCompany[] {
        return companies.map(company => {
            company['_inboxCount'] = this.getKpiCount(company, 'Inbox');
            company['_approvedCount'] = this.getKpiCount(company, 'Approved');
            company['_toBePayedCount'] = this.getKpiCount(company, 'ToBePayed');
            company['_toBeRemindedCount'] = this.getKpiCount(company, 'ToBeReminded');
            return company;
        });
    }

    public getKpiCount(company: KpiCompany, kpiName: string): string {
        const kpi = company.Kpi.find(k => k.Name === kpiName);
        if (kpi) {
            switch (kpi.ValueStatus) {
                case KPI_STATUS.StatusReady:
                    return kpi.Counter !== 0 ? String(kpi.Counter) : '';
                case KPI_STATUS.StatusError:
                    return 'Feil';
                case KPI_STATUS.StatusInProgress:
                    return 'Loading...';
                case KPI_STATUS.StatusUnknown:
                    return 'Ukjent status';
            }
        }
        return '';
    }

    public onCompanyNameClick(company: KpiCompany) {
        this.redirectToCompanyUrl(company);
        this.busy = true;
    }

    public onCompanyInboxClick(company: KpiCompany) {
        const redirectUrl = '/accounting/bills?filter=Inbox';
        this.redirectToCompanyUrl(company, redirectUrl);
        this.busy = true;
    }

    public onCompanyApprovalsClick(company: KpiCompany) {
        const redirectUrl = '/accounting/bills?filter=Approved';
        this.redirectToCompanyUrl(company, redirectUrl);
        this.busy = true;
    }

    private redirectToCompanyUrl(kpi: KpiCompany, redirectUrl?: string) {
        this.companyService.Get(kpi.ID).subscribe(
            company => this.authService.setActiveCompany(company, redirectUrl),
            err => this.errorService.handle(err)
        );
    }

    public onRowClick(company: KpiCompany) {
        this.setCurrentCompany(company);
    }

    private setCurrentCompany(company: KpiCompany) {
        this.highlightedCompany = company;
        this.currentCompanyService.setCurrentCompany(company);
    }

    public createCustomer(company: KpiCompany) {
        this.modalService
            .open(SubCompanyModal, {
                    data: company
                })
                .onClose
                .subscribe(response => {
                    if (response) {
                        this.loadSubCompanies(true);
                    }
                });
    }

    public editClientNumber(company) {
        const options = {
            buttonLabels: {
                accept: 'Oppdater klientnr',
                cancel: 'Avbryt'
            },
            header: 'Rediger klientnr for: ' + company.Name,
            data: {
                ClientNumber: company.ClientNumber || 0
            }
        };

        this.uniModalService.open(UniEditFieldModal, options).onClose.subscribe((res) => {
            if (res) {
                this.companyService.updateCompanyClientNumber(company.ID, res, company.Key).subscribe((comp) => {
                    this.table.updateRow(company._originalIndex, comp);
                }, (err) => {
                    this.errorService.handle(err);
                });
            }
        });

    }
}
