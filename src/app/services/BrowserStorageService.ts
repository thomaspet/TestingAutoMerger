import {Injectable} from '@angular/core';

@Injectable()
export class BrowserStorageService  {

    // save to localStorage
    public save(key: string, json: string) {
        localStorage.setItem(key, json);
    }

    // get from localStorage
    public get(key: string): string {
        return localStorage.getItem(key);
    }

    // save to sessionStorage
    public sessionSave(key: string, json: string) {
        sessionStorage.setItem(key, json);
    }

    // get from sessionStorage
    public sessionGet(key: string): string {
        return sessionStorage.getItem(key);
    }
}
