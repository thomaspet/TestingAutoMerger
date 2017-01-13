import {Injectable} from '@angular/core';
import {AuthService} from '../../../framework/core/authService';

@Injectable()
export class BrowserStorageService  {

    constructor(private authService: AuthService) {

    }

    // save to localStorage
    public save(key: string, json: string, isClientData: boolean = false) {
        localStorage.setItem(this.getStorageKey(key, isClientData), json);
    }

    // get from localStorage
    public get(key: string, isClientData: boolean = false): string {
        return localStorage.getItem(this.getStorageKey(key, isClientData));
    }

    // save to sessionStorage
    public sessionSave(key: string, json: string, isClientData: boolean = false) {
        sessionStorage.setItem(this.getStorageKey(key, isClientData), json);
    }

    // get from sessionStorage
    public sessionGet(key: string, isClientData: boolean = false): string {
        return sessionStorage.getItem(this.getStorageKey(key, isClientData));
    }

    private getStorageKey(key: string, isClientData: boolean = false): string {
        if (isClientData) {
            return this.authService.getCompanyKey() + '_' + key;
        }

        return key;
    }
}
