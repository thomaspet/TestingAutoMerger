import {Injectable, EventEmitter, TRANSLATIONS} from '@angular/core';
import {IUniTab} from './tabStrip';
import {Router} from '@angular/router';

// The enum is numbered based on its parent app:
//      1×× - Core
//      2×× - Sales
//      3×× - Accounting
//      4×× - Bank
//      5×× - Salary
//      6×× - Timetracking
//      7×× - Dimensions
//      9×× - Discontinued
export enum UniModules {
    Dashboard       = 100,
    Settings        = 101,
    Reports         = 102,
    UniQuery        = 103,
    UniTicker       = 104,
    Tasks           = 105,

    Sales           = 200,
    Customers       = 201,
    Quotes          = 202,
    Orders          = 203,
    Invoices        = 204,
    Products        = 205,
    Reminders       = 206,
    Contacts        = 207,

    Accounting      = 300,
    Transquery      = 301,
    TransqueryDetails = 302,
    Accountsettings = 303,
    Vatsettings     = 304,
    VatReport       = 305,
    Bills           = 311,
    Payments        = 306,
    AccountingReports = 307,
    Suppliers       = 308,
    AccountQuery    = 309,
    PredefinedDescription = 310,

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

    Dimensions      = 700,
    Projects        = 701,
    Departments     = 702,

    CurrencyExchange = 800,
    CurrencyOverride = 801,

    Jobs            = 900,
    Translations    = 901,
    Models          = 902,
    Roles           = 903,
	Thresholds		= 904,

    //PaymentList   = XX00, //commenting out because not in use and it fucks with the indexes of the underlying list

    About           = 1000,
    Versions        = 1001
}

@Injectable()
export class TabService {
    private _tabs: Array<IUniTab>;
    public tabsChange: EventEmitter<IUniTab[]>;
    public currentActiveTab: IUniTab;
    public currentActiveIndex: number = 0;

    private SKEY: string = 'navbarTabs';

    constructor(private router: Router) {
        this._tabs = this.getMemStore();
        this._tabs.forEach((tab, i) => {
            if (tab.active) {
                this.currentActiveTab = tab;
                this.currentActiveIndex = i;
            }
        });

        this.tabsChange = new EventEmitter<IUniTab[]>();
        this.tabsChange.next(this._tabs);
    }

    public get tabs(): Array<IUniTab> {
        return this._tabs;
    }

    public length(): number {
        return this._tabs.length;
    }

    /**
     * TO FIND WHAT MODULEID YOU SHOULD USE, GO TO
     * https://unimicro.atlassian.net/wiki/pages/viewpage.action?spaceKey=AD&title=TabService
     */

    public addTab(newTab: IUniTab) {
        var duplicate = false;
        var moduleCheck = { index: 0, exists: false}
        this._tabs.forEach((tab, i) => {
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
            this._tabs[moduleCheck.index] = newTab;
            this.updateMemStore();
            this.currentActiveIndex = moduleCheck.index;
            duplicate = true;
        }

        if (!duplicate) {
            newTab.active = true;
            this._tabs.push(newTab);
            this.updateMemStore();
            this.currentActiveIndex = this._tabs.length - 1;
        }

        this.currentActiveTab = newTab;

        /* DUMMY CHECK TO MAKE SURE THERE IS NEVER MORE THEN 7 TABS WHILE WAITING FOR ARNOR'S FINAL FIX */
        if (this._tabs.length > 6) {
            this._tabs.splice(0, 1);
        }
        /***********************************************************************************************/

        this.tabsChange.next(this._tabs);
    }


    public activateTab(index: number): void {
        this._tabs.map(tab => tab.active = false);
        this._tabs[index].active = true;
        this.currentActiveIndex = index;
        this.updateMemStore();
        this.tabsChange.emit(this._tabs);

        this.router.navigateByUrl(this._tabs[index].url);
    }

    public activateNextTab() {
        if (this.currentActiveIndex + 1 < this._tabs.length) {
            this.activateTab(this.currentActiveIndex + 1);
        }
    }

    public activatePrevTab() {
        if (this.currentActiveIndex - 1 >= 0) {
            this.activateTab(this.currentActiveIndex - 1);
        }
    }

    public closeTab(index: number = this.currentActiveIndex): void {
        this._tabs.splice(index, 1);
        if (!this._tabs.length) {
            this._tabs.push({
                name: 'Skrivebord',
                url: '/',
                moduleID: UniModules.Dashboard
            });
        }

        this.activateTab(this._tabs.length - 1);
    }

    public removeAllTabs() {
        this._tabs = [];
        this.clearMemStore();
    }

    private getMemStore() {
        return JSON.parse(localStorage.getItem(this.SKEY)) || [];
    }

    private updateMemStore() {
        localStorage.setItem(this.SKEY, JSON.stringify(this._tabs));
    }

    private clearMemStore() {
        localStorage.removeItem(this.SKEY);
    }

}
