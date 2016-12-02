import {Injectable} from '@angular/core';
import {Location} from '@angular/common';

@Injectable()
export class PageStateService {

    constructor(private location: Location) {
    }

    /// <summary>
    /// Sets url-state as parameters in actual url.
    /// Example: setPageState('filter', '123') results in url with '/test/single/1?filter=123
    /// Note: Also updates and protects existing parameters.
    /// </summary>
    public setPageState(parameterName: string, value: string) {
        var input = this.location.path(false);
        var output = this.mapIntoUrl(input, parameterName, value);
        if (input !== output) {
            this.location.replaceState(output);
        }
    }

    /// <summary>
    /// Returns a keyvalue-pair object with url-parameters.
    /// Example: '/test/single/1?abc=1&filter=myfilter' returns { abc: '1', filter: 'myfilter' }
    /// </summary>
    public getPageState(): any {
        return this.mapFromUrl(this.location.path(false));
    }   

    private mapIntoUrl(url: string, parameterName: string, value: string): string {
        var parts: string[] = [];
        var ixParams = url.indexOf('?');
        if (ixParams > 0) {
            let tParts = url.substr(ixParams + 1);
            url = url.substr(0, ixParams);        
            if (tParts.length > 0) {
                parts = tParts.split('&');
                for (var i = 0; i < parts.length; i++) {
                    if (parts[i].indexOf(parameterName + '=') === 0) {
                        parts[i] = parameterName + '=' + value;
                        return url + '?' + parts.join('&');
                    }
                }
            }            
        }
        parts.push(`${parameterName}=${value}`);
        return url + (parts.length > 0 ? ('?' + parts.join('&')) : '');
    }  

    private mapFromUrl(url: string): any {
        var keyValues: any = {};
        var ixParams = url.indexOf('?');
        if (ixParams > 0) {
            let tParts = url.substr(ixParams + 1);
            url = url.substr(0, ixParams);        
            if (tParts.length > 0) {
                let parts = tParts.split('&');
                for (var i = 0; i < parts.length; i++) {
                    let keyValue = parts[i].split('=');
                    if (keyValue.length >= 2) {
                        keyValues[keyValue[0]] = keyValue[1]; 
                    } 
                }
            }                        
        }   
        return keyValues;     
    }    
}
