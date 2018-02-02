import {Injectable} from '@angular/core';
import {AuthService} from '@app/authService';

interface Storage {
    setItem(key: string, value: string);
    getItem(key: string): any;
    removeItem(key: string);
    clear();
}

@Injectable()
export class BrowserStorageService  {

    constructor(
        private authService: AuthService,
    ) {}

    /* user specific storage */
    public setItem(key: string, data: any) {
        localStorage.setItem(key, this.marshal(data));
    }
    public getItem(key: string): any {
        try {
            return this.unmarshal(localStorage.getItem(key));
        } catch (e) {
            this.removeItem(key);
            return null;
        }
    }
    public removeItem(key: string) {
        localStorage.removeItem(key);
    }

    public setSessionItem(key: string, data: any) {
        sessionStorage.setItem(key, this.marshal(data));
    }
    public getSessionItem(key: string): any {
        try {
            return this.unmarshal(sessionStorage.getItem(key));
        } catch (e) {
            this.removeSessionItem(key);
            return null;
        }
    }
    public removeSessionItem(key: string) {
        sessionStorage.removeItem(key);
    }

    /* company specific storage */
    public setItemOnCompany(key: string, data: any) {
        return this.saveOnCompanyGenericStorage(key, data, localStorage);
    }
    public getItemFromCompany(key: string): any {
        return this.getFromCompanyGenericStorage(key, localStorage);
    }
    public removeItemFromCompany(key: string) {
        return this.removeFromCompanyGenericStorage(key, localStorage);
    }

    public setSessionItemOnCompany(key: string, data: any) {
        return this.saveOnCompanyGenericStorage(key, data, sessionStorage);
    }
    public getSessionItemFromCompany(key: string): any {
        return this.getFromCompanyGenericStorage(key, sessionStorage);
    }
    public removeSessionItemFromCompany(key: string) {
        return this.removeFromCompanyGenericStorage(key, sessionStorage);
    }

    private saveOnCompanyGenericStorage(key: string, data: any, storage: Storage) {
        const companyKey = this.getCompanyKey();
        const companyJonString = storage.getItem(companyKey);
        let companyDict;
        try {
            companyDict = this.unmarshal(companyJonString) || {};
        } catch (e) {
            companyDict = {};
        }
        companyDict[key] = data;
        const jsonString = this.marshal(companyDict);
        storage.setItem(companyKey, jsonString);
    }
    private getFromCompanyGenericStorage(key: string, storage: Storage): any {
        const companyKey = this.getCompanyKey();
        const companyJonString = storage.getItem(companyKey);
        if (companyJonString !== null) {
            try {
                return this.unmarshal(companyJonString)[key];
            } catch (e) {
                this.removeFromCompanyGenericStorage(key, storage);
                return null;
            }
        }
        return null;
    }
    private removeFromCompanyGenericStorage(key: string, storage: Storage) {
        const companyKey = this.getCompanyKey();
        const companyJonString = storage.getItem(companyKey);
        try {
            const companyDict = this.unmarshal(companyJonString) || {};
            delete companyDict[key];
            const jsonString = this.marshal(companyDict);
            storage.setItem(companyKey, jsonString);
        } catch (e) {
            this.removeFromCompanyGenericStorage(key, storage);
        }
    }

    private getCompanyKey(): string {
        return this.authService.getCompanyKey();
    }

    private unmarshal(jsonString: string): any {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            const message = `Could not unmarshal JSON string from localStorage: "${jsonString}"`;
            console.error(message);
            throw new Error(message);
        }
    }

    private marshal(obj: any): string {
        if (obj === undefined) {
            throw new Error('Tried to marshal undefined into a JSON string, failing to prevent corrupt localStorage');
        }
        return JSON.stringify(obj);
    }
}
