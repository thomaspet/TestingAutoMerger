import {Injectable} from "@angular/core";
import {UniTabStrip, IUniTab} from "./tabStrip";

@Injectable()
export class TabService {
    private _tabs: Array<IUniTab>;
    public currentActiveTab: IUniTab;
    public currentActiveIndex: number = 0;

    constructor() {
        this._tabs = JSON.parse(localStorage.getItem("navbarTabs")) || [];
        this._tabs.forEach((tab, i) => {
            if (tab.active) {
                this.currentActiveTab = tab;
                this.currentActiveIndex = i;
            }
        });
    }

    public get tabs(): Array<IUniTab> {
        return this._tabs;
    }

    public length(): number {
        return this._tabs.length;
    }

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
            localStorage.setItem("navbarTabs", JSON.stringify(this._tabs));
            this.currentActiveIndex = moduleCheck.index;
            duplicate = true;
        }

        if (!duplicate) {
            newTab.active = true;
            this._tabs.push(newTab);
            localStorage.setItem("navbarTabs", JSON.stringify(this._tabs));
            this.currentActiveIndex = this._tabs.length - 1;
        }

        this.currentActiveTab = newTab;

        /* DUMMY CHECK TO MAKE SURE THERE IS NEVER MORE THEN 7 TABS WHILE WAITING FOR ARNOR'S FINAL FIX */
        if (this._tabs.length > 6) {
            this._tabs.splice(0, 1);
        }
        /***********************************************************************************************/
        
    }

    //Sets tab active based on name
    public setTabActive(index: number) {
        this._tabs[index].active = true;
        this.currentActiveTab = this._tabs[index];
        this.currentActiveIndex = index;
    }

    //Removes tab and returns the new tab to be activated
    public removeTab(tabToRemove: IUniTab, index: number): IUniTab {
        this._tabs.splice(index, 1);
        localStorage.setItem("navbarTabs", JSON.stringify(this._tabs));
        this.currentActiveIndex = this._tabs.length - 1;

        //If the closed tab is not the active one
        if (!tabToRemove.active) {
            return this.currentActiveTab;
        } else {
            //If closing the last open tab -> go to dashboard? Creates "bug" if dashboard is last tab
            if (this._tabs.length === 0) {
                return { name: 'Dashboard', url: '/' };
            } else {
                return this._tabs[this._tabs.length - 1];
            }
        }
    }

}
