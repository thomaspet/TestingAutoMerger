import {Injectable, EventEmitter, TRANSLATIONS} from '@angular/core';
import {IUniTab} from './tabStrip';
import {Router, NavigationEnd} from '@angular/router';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

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

    Sales           = 200,
    Customers       = 201,
    Quotes          = 202,
    Orders          = 203,
    Invoices        = 204,
    Products        = 205,
    Reminders       = 206,
    Contacts        = 207,
    ProductGroup    = 208,
    Sellers         = 209,
    Projects        = 210,

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

    Bank            = 450,
    Payment         = 451,
    PaymentBatches  = 452,
    Incomming       = 453,

    Salary          = 500,
    Employees       = 501,
    Wagetypes       = 502,
    Payrollrun      = 503,
    Amelding        = 504,
    Categories      = 505,
    Salarybalances  = 506,
    Supplements     = 507,

    WorkProfiles    = 600,
    Workers         = 601,
    WorkTypes       = 602,
    Timesheets      = 603,

    Jobs            = 700,
    Translations    = 701,
    Models          = 702,
    Roles           = 703,
    Thresholds      = 704,
    Dimensions      = 705,
    About           = 706,
    Versions        = 707
}

@Injectable()
export class TabService {
    private tabs: IUniTab[];
    public currentActiveTab: IUniTab;
    public currentActiveIndex: number = 0;

    private storageKey: string = 'navbarTabs';

    public tabs$: BehaviorSubject<IUniTab[]> = new BehaviorSubject([]);
    public activeTab$: BehaviorSubject<IUniTab> = new BehaviorSubject(null);

    constructor(private router: Router) {
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
        var duplicate = false;
        var moduleCheck = { index: 0, exists: false };
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
            this.updateMemStore();
            this.currentActiveIndex = moduleCheck.index;
            duplicate = true;
        }

        if (!duplicate) {
            newTab.active = true;
            this.tabs.push(newTab);
            this.updateMemStore();
            this.currentActiveIndex = this.tabs.length - 1;
        }

        this.currentActiveTab = newTab;

        /* DUMMY CHECK TO MAKE SURE THERE IS NEVER MORE THEN 7 TABS WHILE WAITING FOR ARNOR'S FINAL FIX */
        if (this.tabs.length > 6) {
            this.tabs.splice(1, 1); // dont remove home tab
        }
        /***********************************************************************************************/

        this.tabs$.next(this.tabs);
        this.activeTab$.next(this.currentActiveTab);
    }


    public activateTab(index: number): void {
        // Only navigate for now. Setting tab as active is done in onNavigateComplete
        // because we dont want it to happen if a router guard stops the navigation
        this.router.navigateByUrl(this.tabs[index].url);
    }

    public onNavigateComplete(event: NavigationEnd) {
        // Home tab is static (in tabstrip.ts template) and not in this.tabs
        // Deactivate current tab and don't activate anything else
        if (event.url === '/') {
            this.tabs.map(tab => tab.active = false);
            this.currentActiveIndex = undefined;
            this.currentActiveTab = undefined;
        } else {
            // If we're not going home, find the correct tab and activate it
            let index = this.tabs.findIndex(tab => tab.url === event.url);
            if (index >= 0) {
                this.tabs.map(tab => tab.active = false);
                this.tabs[index].active = true;
                this.currentActiveIndex = index;
                this.currentActiveTab = this.tabs[index];
            }
        }

        this.updateMemStore();
        this.tabs$.next(this.tabs);
        this.activeTab$.next(this.currentActiveTab);
    }

    public deactivateCurrentTab() {
        this.tabs[this.currentActiveIndex].active = false;
        this.currentActiveIndex = undefined;
        this.currentActiveTab = undefined;
        this.updateMemStore();

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
        this.tabs.splice(closeIndex, 1);

        // If we removed the last tab go to dashboard
        if (!this.tabs.length) {
            this.router.navigateByUrl('/');
            return;
        }

        if (closeIndex === this.currentActiveIndex) {
            // If we removed the current active tab activate another one
            this.activateTab(this.tabs.length - 1);
        } else {
            // If not, just update currentActiveIndex
            this.currentActiveIndex = closeIndex > this.currentActiveIndex
                ? this.currentActiveIndex
                : this.currentActiveIndex - 1;
        }
    }

    public removeAllTabs() {
        this.tabs = [];
        this.updateMemStore();
    }

    private getMemStore(): IUniTab[] {
        let tabs: IUniTab[] = JSON.parse(localStorage.getItem(this.storageKey));

        // TODO: this can be removed after some time (added 04.09.17)
        // It's only here to remove old tab store entries that includes Dashboard
        // Because they would cause duplicate home tabs (no biggie, but looks weird)
        if (tabs && tabs.length && tabs[0].moduleID === UniModules.Dashboard) {
            this.clearMemStore();
            return undefined;
        }

        return tabs;
    }

    private updateMemStore() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.tabs));
    }

    private clearMemStore() {
        localStorage.removeItem(this.storageKey);
    }

}
