import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Rx";
import {AuthService} from '../../../../framework/core/authService';

@Injectable()
export class CacheService {
            
    static cache:any = {};
    
    user = {
        id: 0,
        guid: '',
        name: '',
        email: '',
        company: ''
    };    
    
    
    
    constructor(authService: AuthService ) {
        this.user.name = authService.jwtDecoded.unique_name;
        this.user.id = authService.jwtDecoded.userId;
        this.user.guid = authService.jwtDecoded.nameid;
        this.user.company = JSON.parse(localStorage.getItem('activeCompany')).Name;
    }
    
    cacheGet(name:string) {
        var item = CacheService.cache[name];
        console.log(name + ' ' + (item ? 'found' : 'not') + ' in cache' );
        return item; 
    }
    
    inCache(name:string) {
        return CacheService.cache.hasOwnProperty(name);
    }
    
    cacheSet(name:string, value:any) {
        console.log("adding " + name + " to cache");
        CacheService.cache[name] = value;
        console.log(name + ": inCache = " + this.inCache(name) );
    }
}