import {Injectable} from 'angular2/core';
import {NavbarTab} from './tabStrip';

@Injectable()
export class TabService {
	private _tabs: Array<NavbarTab>;
	
	constructor() {
		this._tabs = [];
	}
	
	get tabs(): Array<NavbarTab> {
		return this._tabs;
	}
	
	length(): number {
		return this._tabs.length;
	}
	
	addTab(newTab: NavbarTab) {
        var duplicate = false;
        
		this._tabs.forEach((tab) => {
            if (tab.name === newTab.name) {
                duplicate = true;
            }
		});
		
		if (!duplicate) this._tabs.push(newTab);
	}
	
	removeTab(name: string) {
		this._tabs.forEach((tab, index) => {
			if (tab.name === name) {
				this._tabs.splice(index, 1);
				return;
			}
		});
	}
	
}