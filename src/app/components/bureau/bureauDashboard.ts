import {Component, ViewChild, ElementRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ErrorService} from '../../services/common/errorService';
import {AuthService} from '../../authService';
import {UniModalService} from '../../../framework/uni-modal/modalService';
import {UniHttp} from '../../../framework/core/http/http';
import {UserService} from '../../services/common/userService';
import {ToastService, ToastType} from '../../../framework/uniToast/toastService';
import {UniNewCompanyModal} from './newCompanyModal';
import {IToolbarConfig} from '../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../framework/save/save';
import {Subscription} from 'rxjs/Subscription';
import {CompanyService} from '../../services/common/companyService';
import {BureauCurrentCompanyService} from './bureauCurrentCompanyService';
import {KpiCompany} from './kpiCompanyModel';
import {BureauPreferences, BureauTagsDictionary} from '@app/components/bureau/bureauPreferencesModel';
import {SingleTextFieldModal} from '../../../framework/uni-modal/modals/singleTextFieldModal';
import {isNullOrUndefined} from 'util';
import {Router, ActivationEnd} from '@angular/router';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {ManageProductsModal} from '@uni-framework/uni-modal/modals/manageProductsModal';
import {SubCompanyModal} from '@uni-framework/uni-modal/modals/subCompanyModal';

import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {IUniTab} from '@app/components/layout/uniTabs/uniTabs';

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

@Component({
    selector: 'uni-bureau-dashboard',
    templateUrl: './bureauDashboard.html'
})
export class BureauDashboard {
    @ViewChild('contextMenu') private contextMenu: ElementRef;

    private companies: KpiCompany[];
    private subCompanies: { ID: number, Name: string, CustomerNumber: number, CompanyKey: string }[];
    private subscription: Subscription;

    toolbarConfig: IToolbarConfig;
    saveActions: IUniSaveAction[];

    filteredCompanies: KpiCompany[];
    highlightedCompany: KpiCompany;

    searchControl: FormControl;
    busy: boolean = false;
    currentSortField: string;
    sortIsDesc: boolean = true;
    companyTags: BureauTagsDictionary = {};

    allTags: AllTagsType[];
    activeTag: string;

    tableConfig: UniTableConfig = this.getTableConfig();
    detailsTabs: IUniTab[] = [
        {name: 'Oppgaver', path: 'tasks'},
        {name: 'Firma', path: 'company'},
        {name: 'Regnskap', path: 'accounting'},
        {name: 'Salg', path: 'sales'},
        {name: 'Lønn', path: 'salary'},
        {name: 'Time', path: 'hours'},
    ];

    constructor(
        private errorService: ErrorService,
        private authService: AuthService,
        private uniModalService: UniModalService,
        private uniHttp: UniHttp,
        private userService: UserService,
        private toastService: ToastService,
        private companyService: CompanyService,
        public currentCompanyService: BureauCurrentCompanyService,
        private modalService: UniModalService,
        private elementRef: ElementRef,
        private router: Router,
        private browserStorage: BrowserStorageService,
    ) {

        this.toolbarConfig = {
            title: '',
        };

        this.saveActions = [{
            label : 'Opprett nytt selskap',
            action: (doneCallback) => this.startCompanyCreation(doneCallback)
        }];
    }

    public ngOnInit() {
        const userPreferences = this.getUserPreferences();
        this.searchControl = new FormControl(userPreferences.filterString || '');
        this.sortIsDesc = userPreferences.sortIsDesc || true;
        this.currentSortField = userPreferences.sortField;
        this.companyTags = userPreferences.tagsForCompany || {};
        this.allTags = this.generateAllTags(this.companyTags);

        this.authService.authentication$
            .asObservable()
            .filter(auth => !!auth.user)
            .map(auth => auth.user.License.Company.Agency.Name)
            .subscribe(name => this.toolbarConfig.title = 'Mine selskaper' + (name ? ` - ${name}` : '') );

        this.searchControl.valueChanges.subscribe((searchValue: string) => {
            this.filterCompanies(searchValue);
        });

        this.busy = true;
        this.loadSubCompanies();
        this.loadCompanies();

        this.router.events
            .filter((event) => event instanceof ActivationEnd)
            .subscribe((change: ActivationEnd) => this.activeTag = change.snapshot.queryParams['tag']);
    }

    private loadCompanies() {
        this.uniHttp
            .asGET()
            .usingRootDomain()
            .withEndPoint('kpi/companies')
            .send()
            .map(res => res.json())
            .do(() => this.busy = false)
            .subscribe(
                res => {
                    this.companies = this.mapKpiCounts(res);
                    if (this.subCompanies) { this.mergeWithSubCompanies(this.companies, this.subCompanies); }
                    if (this.companies.length > 0) {
                        this.setCurrentCompany(this.companies[0]);
                    }
                    this.filterCompanies(this.searchControl.value || '');
                },
                err => this.errorService.handle(err)
            );
    }

    private loadSubCompanies(isRefresh = false) {
        this.uniHttp.asGET()
        .usingRootDomain()
        .withEndPoint(`statistics?model=subcompany`
            + `&select=customer.id as ID,info.name as Name,customer.customernumber as CustomerNumber,companykey as CompanyKey`
            + `&filter=customerid gt 0&expand=customer.info&wrap=false`)
        .send()
        .map(res => res.json())
        .do(() => this.busy = false)
        .subscribe(
            res => {
                this.subCompanies = res;
                if (this.companies) {
                    this.mergeWithSubCompanies(this.companies, this.subCompanies);
                }
                if (isRefresh) {
                    this.companies = [...this.companies];
                    this.filterCompanies(this.searchControl.value || '');
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
            .setWidth(240);

        const orgnrCol = new UniTableColumn('OrganizationNumber', 'Org.nr');

        const inboxCol =  new UniTableColumn('_inboxCount', 'Fakturainnboks', UniTableColumnType.Link)
            .setCls('bureau-link-col')
            .setAlignment('center');

        const approvalCol = new UniTableColumn('_approvedCount', 'Godkjente faktura', UniTableColumnType.Link)
            .setCls('bureau-link-col')
            .setAlignment('center');

        const subCompanyCol = new UniTableColumn('SubCompany.Name', 'Lokal kunde', UniTableColumnType.Link)
            .setVisible(false)
            .setCls('bureau-link-col');

        companyNameCol.linkClick = row => this.onCompanyNameClick(row);
        inboxCol.linkClick = row => this.onCompanyInboxClick(row);
        approvalCol.linkClick = row => this.onCompanyApprovalsClick(row);
        subCompanyCol.linkClick = row => this.router.navigateByUrl('/sales/customer/' + row.SubCompany.ID);

        return new UniTableConfig('bureau_company_list', false, true, 15)
            .setAutofocus(true)
            .setColumnMenuVisible(true)
            .setColumns([companyNameCol, orgnrCol, inboxCol, approvalCol, subCompanyCol])
            .setContextMenu([
                {
                    label: 'Legg til i filter',
                    action: item => this.addLabel(item)
                },
                {
                    label: 'Administrer produkter',
                    action: item => this.editPurchases(item)
                },
                {
                    label: 'Opprett som kunde',
                    action: item => this.createCustomer(item)
                }
            ]);
    }

    public generateAllTags(companyTags: BureauTagsDictionary): AllTagsType[] {
        const tags = Object.keys(companyTags)
            .map(key => this.companyTags[key])
            .reduce((allTags, ntags) => {
                for (const tag of ntags) {
                    allTags[tag] = (allTags[tag] || []);
                    allTags[tag].push(tag);
                }
                return allTags;
            }, {});

        const tagList =  Object.keys(tags).map(key => <AllTagsType>{
            name: key,
            count: tags[key].length,
        });

        tagList.unshift({
            name: 'Alle',
            count: this.filteredCompanies && this.filteredCompanies.length
        });

        return tagList;
    }

    public ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        // Store filter string and sort info
        try {
            const preferences: BureauPreferences = {
                filterString: <string>(this.searchControl.value || ''),
                sortIsDesc: this.sortIsDesc,
                sortField: this.currentSortField,
                tagsForCompany: this.companyTags
            };
            this.browserStorage.setItem('bureau_list_user_preferences', preferences);
        } catch (e) {}
    }

    private filterCompanies(filterString: string): void {
        if (filterString && filterString.length) {
            this.filteredCompanies = this.companies.filter(company => {
                const companyName = (company.Name && company.Name.toLowerCase()) || '';
                return companyName.includes((filterString || '').toLowerCase());
            });
        } else {
            this.filteredCompanies = this.companies;
        }

        if (this.allTags && this.allTags[0]) {
            this.allTags[0].count = this.filteredCompanies.length;
        }
    }

    private mapKpiCounts(companies: KpiCompany[]): KpiCompany[] {
        return companies.map(company => {
            company['_inboxCount'] = this.getKpiCount(company, 'Inbox');
            company['_approvedCount'] = this.getKpiCount(company, 'Approved');
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

    public startCompanyCreation(doneCallback: (string) => void) {
        this.uniModalService.open(UniNewCompanyModal).onClose
            .subscribe(company => {
                if (!company) {
                    doneCallback('Oppretting av selskap avbrutt');
                } else {
                    this.companies.unshift(company);
                    this.companies = [...this.companies];
                    this.filterCompanies(this.searchControl.value || '');
                    doneCallback(`Selskap ${company.Name} opprettet`);
                }
            });
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

    private getUserPreferences(): BureauPreferences {
        let preferences: BureauPreferences;
        try {
            preferences = this.browserStorage.getItem('bureau_list_user_preferences');
        } catch (e) {}

        return preferences || <BureauPreferences>{};
    }

    public addLabel(company: KpiCompany) {
        const tags = this.companyTags[company.ID] || [];
        this.modalService
            .open(SingleTextFieldModal, {
                header: `Legg til filter som ${company.Name} skal vises i`,
                data: tags.join(', '),
                modalConfig: {label: 'Filter (kommaseparert)'},
            })
            .onClose
            .subscribe(
                newTagString => {
                    if (!isNullOrUndefined(newTagString)) {
                        const newLabels = newTagString.split(',')
                            .map(tag => tag.trim())
                            .filter(tag => !!tag);
                        this.companyTags[company.ID] = newLabels || undefined;
                        this.allTags = this.generateAllTags(this.companyTags);
                    }
                }
            );
    }

    public editPurchases(company: KpiCompany) {
        this.modalService.open(ManageProductsModal, {
            header: `Velg hvilke brukere som skal ha hvilke produkter i ${company.Name}`,
            data: {companyKey: company.Key},
        });
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

    public companyHasTag(company: KpiCompany, tag: string): boolean {
        if (!tag) {
            return true; // show everything if there is no active tag
        }
        return (this.companyTags[company.ID] || []).some(t => t === this.activeTag);
    }
}
