import {Injectable} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {IUniTab} from './tabstrip';
import {Router, NavigationEnd} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {UniTranslationService} from '@app/services/services';
import {environment} from 'src/environments/environment';

// The enum is numbered based on its parent app:
//      1×× - Key figures
//      2×× - Sales
//      3×× - Accounting
//      4×× - Bank
//      5×× - Salary
//      6×× - Timetracking
//      7×× - Settings
//      9×× - Discontinued
export enum UniModules {
    Dashboard       = 100,
    BureauDashboard = 101,
    Settings        = 102,
    Reports         = 103,
    UniQuery        = 104,
    UniTicker       = 105,
    Assignments     = 106,
    Marketplace     = 107,
    Sharings        = 108,
    LicenseInfo     = 109,

    Sales            = 200,
    Customers        = 201,
    Quotes           = 202,
    Orders           = 203,
    Invoices         = 204,
    Products         = 205,
    Reminders        = 206,
    Contacts         = 207,
    ProductGroup     = 208,
    Sellers          = 209,
    Projects         = 210,
    CustomDimensions = 211,
    KIDSettings      = 212,
    RecurringInvoice = 213,
    BatchInvoice     = 214,

    Accounting      = 300,
    Transquery      = 301,
    TransqueryDetails = 302,
    Accountsettings = 303,
    Vatsettings     = 304,
    VatReport       = 305,
    Payments        = 306,
    AccountingReports = 307,
    Suppliers       = 308,
    AccountQuery    = 309,
    PredefinedDescription = 310,
    PostPost        = 311,
    Bills           = 312,
    Departments     = 313,
    CurrencyExchange = 314,
    CurrencyOverride = 315,
    Budget          = 316,
    CostAllocation  = 317,
    Inbox           = 318,

    Bank            = 450,
    Payment         = 451,
    Incomming       = 452,
    BankReconciliation = 453,

    Salary          = 500,
    Employees       = 501,
    Wagetypes       = 502,
    Payrollrun      = 503,
    Amelding        = 504,
    Categories      = 505,
    Salarybalances  = 506,
    Supplements     = 507,
    AnnualStatements  = 508,
    AltinnOverview = 509,
    Travel = 510,
    TravelType = 511,
    SalarybalanceTemplates = 512,
    OTPExport       = 513,
    VariablePayrolls = 514,
    Regulative = 515,
    WorkProfiles    = 600,
    Workers         = 601,
    WorkTypes       = 602,
    Timesheets      = 603,
    InvoiceHours    = 604,
    TimeOff         = 605,

    Jobs            = 700,
    Translations    = 701,
    Dimensions      = 705,
    About           = 706,
    Versions        = 707,
    GDPRList        = 708,
    Flow            = 709,
    ImportCentral   = 710,
    ImportCentralLog   = 711,
}

@Injectable()
export class TabService {
    public tabs: IUniTab[];
    public currentActiveTab: IUniTab;
    public currentActiveIndex: number = 0;

    private storageKey: string = 'navbarTabs';

    public tabs$: BehaviorSubject<IUniTab[]> = new BehaviorSubject([]);
    public activeTab$: BehaviorSubject<IUniTab> = new BehaviorSubject(null);

    constructor(
        private router: Router,
        private browserStorage: BrowserStorageService,
        private titleService: Title,
        private translateService: UniTranslationService
    ) {
        this.tabs = this.getMemStore() || [];

        this.tabs.forEach((tab, i) => {
            if (tab.active) {
                this.currentActiveTab = tab;
                this.currentActiveIndex = i;
            }
        });

        this.router.events
            .filter(event => event instanceof NavigationEnd)
            .subscribe((navigationEvent: NavigationEnd) => {
                this.onNavigateComplete(navigationEvent);
            });

        this.tabs$.next(this.tabs);
        this.activeTab$.next(this.currentActiveTab);
    }

    /**
     * TO FIND WHAT MODULEID YOU SHOULD USE, GO TO
     * https://unimicro.atlassian.net/wiki/pages/viewpage.action?spaceKey=AD&title=TabService
     */
    public addTab(newTab: IUniTab) {
        let duplicate = false;
        const moduleCheck = { index: 0, exists: false };
        this.tabs.forEach((tab, i) => {
            tab.active = false;
            if (tab.name === newTab.name) {
                tab.active = true;
                duplicate = true;
                this.currentActiveIndex = i;
            }

            if (tab.moduleID === newTab.moduleID) {
                moduleCheck.exists = true;
                moduleCheck.index = i;
            }
        });

        if (moduleCheck.exists) {
            newTab.active = true;
            this.tabs[moduleCheck.index] = newTab;
            this.updateTabStorage();
            this.currentActiveIndex = moduleCheck.index;
            duplicate = true;
        }

        if (!duplicate) {
            newTab.active = true;
            this.tabs.push(newTab);
            this.updateTabStorage();
            this.currentActiveIndex = this.tabs.length - 1;
        }

        this.currentActiveTab = newTab;

        if (this.tabs.length > 6) {
            this.tabs.splice(0, 1);
        }

        this.tabs$.next(this.tabs);
        this.activeTab$.next(this.currentActiveTab);
    }


    public activateTab(index: number): Promise<boolean> {
        // Only navigate for now. Setting tab as active is done in onNavigateComplete
        // because we dont want it to happen if a router guard stops the navigation
        return this.router.navigateByUrl(this.tabs[index].url);
    }

    public onNavigateComplete(event: NavigationEnd) {
        // Home tab is static (in tabstrip.ts template) and not in this.tabs
        // Deactivate current tab and don't activate anything else
        if (event.url === '/') {
            this.tabs.map(tab => tab.active = false);
            this.currentActiveIndex = undefined;
            this.currentActiveTab = undefined;
            this.activeTab$.next(this.currentActiveTab);
        } else {
            // If we're not going home, find the correct tab and activate it
            const index = this.tabs.findIndex(tab => tab.url === event.url);
            if (index >= 0 && index !== this.currentActiveIndex) {
                this.tabs.map(tab => tab.active = false);
                this.tabs[index].active = true;
                this.currentActiveIndex = index;
                this.currentActiveTab = this.tabs[index];

                this.updateTabStorage();
                this.tabs$.next(this.tabs);
                this.activeTab$.next(this.currentActiveTab);
            }
        }

        // Set document title so browser history makes sense
        const appName = environment.isSrEnvironment ? 'SR-Bank Regnskap' : 'Uni Economy';
        const documentTitle = this.currentActiveTab
            ? this.translateService.translate(this.currentActiveTab.name)
            : appName;

        this.titleService.setTitle(documentTitle);
    }

    public deactivateCurrentTab() {
        this.tabs[this.currentActiveIndex].active = false;
        this.currentActiveIndex = undefined;
        this.currentActiveTab = undefined;
        this.updateTabStorage();

        this.tabs$.next(this.tabs);
        this.activeTab$.next(this.currentActiveTab);
    }

    public activateNextTab() {
        if (this.currentActiveIndex + 1 < this.tabs.length) {
            this.activateTab(this.currentActiveIndex + 1);
        }
    }

    public activatePrevTab() {
        if (this.currentActiveIndex - 1 >= 0) {
            this.activateTab(this.currentActiveIndex - 1);
        }
    }

    public closeTab(closeIndex: number = this.currentActiveIndex): void {
        const removeAndUpdate = (index) => {
            this.tabs.splice(index, 1);
            this.tabs$.next(this.tabs);
            this.updateTabStorage();
            this.currentActiveIndex = this.tabs.findIndex(t => t.active);
        };

        // If closed tab is active then we need to first check that we can
        // navigate away from it, then actually remove the tab
        if (closeIndex === this.currentActiveIndex) {
            let navigationPromise: Promise<boolean>;

            if (this.tabs[closeIndex + 1]) {
                navigationPromise = this.activateTab(closeIndex + 1);
            } else if (this.tabs[closeIndex - 1]) {
                navigationPromise = this.activateTab(closeIndex - 1);
            } else {
                navigationPromise = this.router.navigateByUrl('/');
            }

            navigationPromise.then(navigationSuccess => {
                if (navigationSuccess) {
                    removeAndUpdate(closeIndex);
                }
            }).catch((err) => {});
        } else {
            // If tab is not active we don't have to check anything, just remove it
            removeAndUpdate(closeIndex);
        }
    }

    public closeLeftOf(index: number) {
        if (index === 0) {
            return;
        }

        this.tabs.splice(0, index);
        this.tabs$.next(this.tabs);
        this.updateTabStorage();

        if (this.currentActiveIndex <= index) {
            this.activateTab(0);
        }
    }

    public closeRightOf(index: number) {
        if (index === this.tabs.length - 1) {
            return;
        }

        this.tabs.splice(index + 1);
        this.tabs$.next(this.tabs);
        this.updateTabStorage();

        if (this.currentActiveIndex > index) {
            this.activateTab(index);
        }
    }

    public closeAllOthers(index: number) {
        const tab = this.tabs[index];
        this.tabs = [tab];
        this.tabs$.next(this.tabs);
        this.updateTabStorage();

        this.activateTab(0);
    }

    public removeAllTabs() {
        this.tabs = [];
        this.tabs$.next(this.tabs);
        this.updateTabStorage();
    }

    private getMemStore(): IUniTab[] {
        const tabs: IUniTab[] = this.browserStorage.getItem(this.storageKey);

        // TODO: this can be removed after some time (added 04.09.17)
        // It's only here to remove old tab store entries that includes Dashboard
        // Because they would cause duplicate home tabs (no biggie, but looks weird)
        if (tabs && tabs.length && tabs[0].moduleID === UniModules.Dashboard) {
            this.clearTabStorage();
            return undefined;
        }

        return tabs;
    }

    private updateTabStorage() {
        this.browserStorage.setItem(this.storageKey, this.tabs);
    }

    private clearTabStorage() {
        this.browserStorage.removeItem(this.storageKey);
    }

}
