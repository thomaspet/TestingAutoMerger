import {Injectable, EventEmitter} from '@angular/core';
import {IUniTab} from './tabStrip';

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

    Customers       = 200,
    Quotes          = 201,
    Orders          = 202,
    Invoices        = 203,
    Products        = 204,
    Reminders       = 205,

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

    Bank            = 450,
    Payment         = 451,
    PaymentBatches  = 452,
    Incomming       = 453,

    Employees       = 500,
    Wagetypes       = 501,
    Payrollrun      = 502,
    Amelding        = 503,
    Categories      = 504,
    Salarybalances  = 505,

    WorkProfiles    = 600,
    Workers         = 601,
    WorkTypes       = 602,
    Timesheets      = 603,

    Projects        = 700,
    Departments     = 701,

    Jobs            = 800,

    PaymentList     = 900,

    CurrencyExchange = 1000,
    CurrencyOverride = 1001
}

@Injectable()
export class TabService {
    private _tabs: Array<IUniTab>;
    public tabsChange: EventEmitter<IUniTab[]>;
    public currentActiveTab: IUniTab;
    public currentActiveIndex: number = 0;

    constructor() {
        this._tabs = JSON.parse(localStorage.getItem('navbarTabs')) || [];
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
            localStorage.setItem('navbarTabs', JSON.stringify(this._tabs));
            this.currentActiveIndex = moduleCheck.index;
            duplicate = true;
        }

        if (!duplicate) {
            newTab.active = true;
            this._tabs.push(newTab);
            localStorage.setItem('navbarTabs', JSON.stringify(this._tabs));
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

    // Sets tab active based on name
    public setTabActive(index: number) {
        this._tabs[index].active = true;
        this.currentActiveTab = this._tabs[index];
        this.currentActiveIndex = index;
    }

    // Removes tab and returns the new tab to be activated
    public removeTab(tabToRemove: IUniTab, index: number): IUniTab {
        this._tabs.splice(index, 1);
        localStorage.setItem('navbarTabs', JSON.stringify(this._tabs));
        this.currentActiveIndex = this._tabs.length - 1;

        // If the closed tab is not the active one
        if (!tabToRemove.active) {
            return this.currentActiveTab;
        } else {
            // If closing the last open tab -> go to dashboard? Creates "bug" if dashboard is last tab
            if (this._tabs.length === 0) {
                return { name: 'Nøkkeltall', url: '/', moduleID: 0 };
            } else {
                return this._tabs[this._tabs.length - 1];
            }
        }
    }

    public removeAllTabs() {
        this._tabs = [];
        localStorage.removeItem('navbarTabs');
    }

}
