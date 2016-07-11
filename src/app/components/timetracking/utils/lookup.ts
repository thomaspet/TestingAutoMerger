import {UniHttp} from '../../../../framework/core/http/http';
import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Rx";
import {IChangeEvent, ColumnType, ITypeSearch} from './editable/editable';

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


    public onEditableChange(event:IChangeEvent, callBackSetValue: (e:IChangeEvent)=> void ):any {

        // Handle lookups if user types, or user selects from a combo.
        // This is because there sometimes are visual referencekeys (ordernumber etc.), and sometimes there are actual foreignkeys

        if (event.columnDefinition && event.columnDefinition.lookup) {
        
            var lookupDef = event.columnDefinition.lookup;

            // Remove "label" from key-value ?
            var key = event.columnDefinition.columnType === ColumnType.Integer ? parseInt(event.value) : event.value;

            // Blank value (clear current value) ?
            if (!key) {
                event.value = key;
                callBackSetValue(event);
                return;
            }

            // Did user just type a "visual" key value himself (customernumber, ordernumber etc.) !?
            if (event.userTypedValue && lookupDef.visualKey) {                
                var p = new Promise((resolve, reject)=> {
                    var filter= `?filter=${lookupDef.visualKey} eq ${key}`;
                    this.getSingle<any>(lookupDef.route, filter).subscribe((rows:any)=> {
                        var item = (rows && rows.length > 0) ? rows[0] : {};
                        event.value = item[lookupDef.colToSave || 'ID'];
                        event.lookupValue = item;
                        callBackSetValue(event);
                        resolve(item);
                    }, (err)=>{
                        reject(err.statusText);
                    });
                });
                event.updateCell = false;
                return p;
            }

            // Normal lookup value (by foreignKey) ?
            var p = new Promise((resolve, reject)=>{                
                this.getSingle<any>(lookupDef.route, key).subscribe( (item:any) => {
                    event.lookupValue = item;
                    event.value = key;
                    callBackSetValue(event);
                    resolve(item);
                }, (err)=>{
                    reject(err.statusText);
                });
            });
            event.updateCell = false;
            return p;
        } 

    }

    public onTypeSearch(details: ITypeSearch) {
        if (details.columnDefinition && details.columnDefinition.lookup) {
            let lookup = details.columnDefinition.lookup;
            details.ignore = false;
            details.itemPropertyToSet = lookup.colToSave || 'ID';
            // Build combo-template
            var searchCols = lookup.select || 'ID,Name'
            var cols = searchCols.split(',');
            details.renderFunc = (item:any)=> { var ret = ''; for (var i=0;i<cols.length;i++) ret += (i>0 ? ' - ' : '') + item[cols[i]]; return ret; }
            details.promise = this.query(lookup.route, details.value, searchCols, undefined, searchCols, lookup.filter).toPromise();
        }
    }    


   // http helpers (less verbose?)
    
    private GET(route: string, params?:any ):Observable<any> {
        return this.http.asGET().usingBusinessDomain()
        .withEndPoint(route).send(params);
    }
 

}
