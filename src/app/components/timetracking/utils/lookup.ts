import {UniHttp} from '../../../../framework/core/http/http';
import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Rx";

@Injectable()
export class Lookupservice {

    constructor(private http:UniHttp) {}

    public getSingle<T>(route:string, id:any, expand = ""):Observable<T> {
        return this.GET(route + "/" + id);
    }

    public query<T>(route:string, searchString:string, matchCols:string, expand?:string, select?:string, filter?:string):Observable<T> {
        var cols = matchCols.split(',');
        var params = "";
        cols.forEach((value:string, index:number)=>{
            params += (index>0 ? ' or ' : '') + 'startswith(' + value + ',\'' + searchString + '\')';
        });
        params = "?filter=" + ( filter ? filter + " and ( " + params + " )" : params );  
        if (expand) params += '&expand=' + expand;
        if (select) params += '&select=' + select;
        return this.GET(route + params);
    }

   // http helpers (less verbose?)
    
    private GET(route: string, params?:any ):Observable<any> {
        return this.http.asGET().usingBusinessDomain()
        .withEndPoint(route).send(params);
    }
 

}
