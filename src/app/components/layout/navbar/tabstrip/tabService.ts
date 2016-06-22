import {Injectable} from "@angular/core";
import {UniTabStrip, IUniTab} from "./tabStrip";

@Injectable()
export class TabService {
    private _tabs: Array<IUniTab>;
    public currentActiveTab: IUniTab;

    constructor() {
        this._tabs = JSON.parse(localStorage.getItem("navbarTabs")) || [];
    }

    get tabs(): Array<IUniTab> {
        return this._tabs;
    }

    length(): number {
        return this._tabs.length;
    }

    addTab(newTab: IUniTab) {
        var duplicate = false;
        this._tabs.forEach((tab) => {
            tab.active = false;
            if (tab.name === newTab.name) {
                tab.active = true;
                duplicate = true;
            }
        });

        if (!duplicate) {
            newTab.active = true;
            this._tabs.push(newTab);
            localStorage.setItem("navbarTabs", JSON.stringify(this._tabs));
        }
        this.currentActiveTab = newTab;

        /* DUMMY CHECK TO MAKE SURE THERE IS NEVER MORE THEN 7 TABS WHILE WAITING FOR ARNOR'S FINAL FIX */
        if (this._tabs.length > 6) {
            this._tabs.splice(0, 1);
        }
        /***********************************************************************************************/
        
    }

    //Sets tab active based on name
    setTabActive(index: number) {
        this._tabs[index].active = true;
    }

    //Removes tab and returns the new tab to be activated
    removeTab(tabToRemove: IUniTab, index: number): IUniTab {
        this._tabs.splice(index, 1);
        localStorage.setItem("navbarTabs", JSON.stringify(this._tabs));

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
