import {Injectable} from '@angular/core';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';

@Injectable()
export class SettingsService {

    constructor(private browserStorage: BrowserStorageService) {
    }

    public getViewSettings(viewName: string): ViewSettings {
        return new ViewSettings(viewName, this.browserStorage);
    }
}

export class ViewSettings {

    private settingsObject: any = {};
    private settingsKey: string;
    private isLoaded: boolean = false;
    private browserStorage: BrowserStorageService;

    constructor(
        viewName: string,
        browserStorage: BrowserStorageService,
    ) {
        this.settingsKey = viewName;
        this.browserStorage = browserStorage;
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
        this.browserStorage.setItem(this.settingsKey, this.settingsObject);
        this.isLoaded = true;
    }

    private load() {
        this.settingsObject = this.browserStorage.getItem(this.settingsKey) || this.settingsObject;
        this.isLoaded = true;
    }


}
