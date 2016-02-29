import {Injectable} from "angular2/core";
import {UniTabStrip, IUniTab} from "./tabStrip";

@Injectable()
export class TabService {
    private _tabs: Array<IUniTab>;

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
            if (tab.name === newTab.name) {
                duplicate = true;
            }
        });

        if (!duplicate) {
            this._tabs.push(newTab);
            localStorage.setItem("navbarTabs", JSON.stringify(this._tabs));
        }
    }

    removeTab(name: string) {
        this._tabs.forEach((tab: any, index: number) => {
            if (tab.name === name) {
                this._tabs.splice(index, 1);
                localStorage.setItem("navbarTabs", JSON.stringify(this._tabs));
                return;
            }
        });
    }

}
