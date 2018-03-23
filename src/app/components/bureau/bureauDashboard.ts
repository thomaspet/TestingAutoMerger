import {Component, ViewChild, ElementRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ErrorService} from '../../services/common/errorService';
import {AuthService} from '../../authService';
import {UniModalService} from '../../../framework/uniModal/modalService';
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
import {SingleTextFieldModal} from '../../../framework/uniModal/presets/singleTextFieldModal';
import {isNullOrUndefined} from 'util';
import {Router, ActivationEnd} from '@angular/router';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';

enum KPI_STATUS {
    StatusUnknown = 0,
    StatusInProgress = 1,
    StatusError = 2,
    StatusReady = 3,
}

export type AllTagsType = {
    name: string,
    count: number,
}

@Component({
    selector: 'uni-bureau-dashboard',
    templateUrl: './bureauDashboard.html'
})
export class BureauDashboard {
    public toolbarConfig: IToolbarConfig;
    public saveActions: IUniSaveAction[];

    private companies: KpiCompany[];
    private filteredCompanies: KpiCompany[];
    public highlightedCompany: KpiCompany;

    private subscription: Subscription;
    private searchControl: FormControl;
    public busy: boolean = false;
    public currentSortField: string;
    public sortIsDesc: boolean = true;
    public companyTags: BureauTagsDictionary = {};
    public allTags: AllTagsType[];
    public activeTag: string;
    public contextMenuCompany: KpiCompany;
    @ViewChild('contextMenu') private contextMenu: ElementRef;

    constructor(
        private errorService: ErrorService,
        private authService: AuthService,
        private uniModalService: UniModalService,
        private uniHttp: UniHttp,
        private userService: UserService,
        private toastService: ToastService,
        private companyService: CompanyService,
        private currentCompanyService: BureauCurrentCompanyService,
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
        let userPreferences = this.getUserPreferences();
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
        this.subscription = this.uniHttp
            .asGET()
            .usingRootDomain()
            .withEndPoint('kpi/companies')
            .send()
            .map(res => res.json())
            .do(() => this.busy = false)
            .subscribe(
                res => {
                    this.companies = this.mapKpiCounts(res);
                    if (this.companies.length > 0) {
                        this.setCurrentCompany(this.companies[0]);
                    }
                    this.filterCompanies(this.searchControl.value || '');
                    this.sortBy(this.currentSortField);
                },
                err => this.errorService.handle(err)
            );
        this.router.events
            .filter((event) => event instanceof ActivationEnd)
            .subscribe((change: ActivationEnd) => this.activeTag = change.snapshot.queryParams['tag'])
    }

    public generateAllTags(companyTags: BureauTagsDictionary): AllTagsType[] {
        const tags = Object.keys(companyTags)
            .map(key => this.companyTags[key])
            .reduce(
                (allTags, tags) => {
                    for (const tag of tags) {
                        allTags[tag] = (allTags[tag] || []);
                        allTags[tag].push(tag);
                    }
                    return allTags;
                }
                ,{}
            );
        return Object.keys(tags)
            .map(key => <AllTagsType>{
                name: key,
                count: tags[key].length,
            });
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

        this.sortBy(this.currentSortField);
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

    public startCompanyCreation(doneCallback: (string)=>void) {
        this.uniModalService.open(UniNewCompanyModal).onClose.subscribe(modalResult => {
            if (!modalResult || !modalResult.CompanyName) {
                doneCallback('Oppretting av selskap avbrutt');
                return;
            }

            this.userService.getCurrentUser().switchMap(user => {
                return this.createCompany(modalResult.CompanyName, user.Email);
            }).subscribe(
                res => {
                    this.companies.unshift(res.json());
                    doneCallback(`Selskap ${modalResult.CompanyName} opprettet`);
                },
                err => {
                    if (err.status === 403) {
                        this.toastService.addToast(
                            'Du har ikke tilgang til å opprette nye selskaper',
                            ToastType.bad,
                            3000
                        );
                    } else {
                        this.errorService.handle(err);
                    }

                    doneCallback('Oppretting av selskap feilet');
                }
            );
        });
    }

    private createCompany(name: string, email: string) {
        return this.uniHttp
            .asPUT()
            .withEndPoint('companies?action=create-company')
            .withBody({
                CompanyName : name
            })
            .send();
    }

    public sortBy(key: string, toggleDirection?: boolean) {
        if (!key || !key.length) {
            return;
        }

        if (toggleDirection && this.currentSortField === key) {
            this.sortIsDesc = !this.sortIsDesc;
        }

        this.currentSortField = key;
        this.filteredCompanies.sort((a, b) => {
            a = typeof a[key] === 'string' ? a[key].toLowerCase() : a[key];
            b = typeof b[key] === 'string' ? b[key].toLowerCase() : b[key];

            if (a > b) {
                return this.sortIsDesc ? -1 : 1;
            }
            if (a < b) {
                return this.sortIsDesc ? 1 : -1;
            }

            return 0;
        });
    }

    public getSortArrow(key: string) {
        if (this.currentSortField === key) {
            return this.sortIsDesc ? '▼' : '▲';
        }
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

    public openContextMenu(event: any, company: KpiCompany) {
        event.preventDefault();
        event.stopPropagation();
        this.contextMenuCompany = company;
        const offsetTop = (event.target.parentElement.offsetTop + event.target.parentElement.offsetHeight) + 'px';
        this.contextMenu.nativeElement.style = `top: ${offsetTop}`;
        const that = this;
        this.elementRef.nativeElement.addEventListener('click', function listener(event) {
            if (!that.contextMenu.nativeElement.contains(event.target)) {
                that.closeContextMenu();
                that.elementRef.nativeElement.removeEventListener(event.type, listener);
            }
        });
    }

    private closeContextMenu() {
        this.contextMenuCompany = null;
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
                    this.closeContextMenu();
                    if (!isNullOrUndefined(newTagString)) {
                        const newLabels = newTagString.split(',')
                            .map(tag => tag.trim())
                            .filter(tag => !!tag);
                        this.companyTags[company.ID] = newLabels || undefined;
                        this.allTags = this.generateAllTags(this.companyTags);
                    }
                }
            )
    }

    public companyHasTag(company: KpiCompany, tag: string): boolean {
        if (!tag) {
            return true; // show everything if there is no active tag
        }
        return (this.companyTags[company.ID] || [])
                .some(tag => tag === this.activeTag);
    }
}
