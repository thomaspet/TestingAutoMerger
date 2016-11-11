import {Injectable} from '@angular/core';

@Injectable()
export class SettingsService {

    constructor() {
    }

    public getViewSettings(viewName: string): ViewSettings {
        return new ViewSettings(viewName);
    }
}

export class ViewSettings {

    private settingsObject: any = {};
    private settingsKey: string;
    private isLoaded: boolean = false;

    constructor(viewName: string) {
        this.settingsKey = viewName;
    }

    public setProp(name: string, value: any) {
        this.settingsObject[name] = value;
        this.save();
    }

    public getProp(name: string, defaultValue?: any) {
        if (!this.isLoaded) {
            this.load();
        }
        return this.settingsObject[name] || defaultValue;
    }

    private save() {        
        localStorage.setItem(this.settingsKey, JSON.stringify(this.settingsObject));
        this.isLoaded = true;
    }

    private load() {
        var raw = localStorage.getItem(this.settingsKey);
        this.settingsObject = raw ? JSON.parse(raw) : this.settingsObject;
        this.isLoaded = true;
    }


}
