import {UniHttp} from '../../../framework/core/http/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {IChangeEvent, ColumnType, ITypeSearch} from '../../components/common/utils/editable/editable';
import {safeInt} from '../../components/common/utils/utils';

@Injectable()
export class Lookupservice {

    constructor(
        private http: UniHttp) {

        }

    public getSingle<T>(route: string, id: any, expand = ''): Observable<T> {
        const pfx = typeof(id) === 'string' ? (id.indexOf('?') >= 0 ? '&' : '?') : '?';
        return this.GET(route + '/' + id + (expand ? pfx + 'expand=' + expand : ''));
    }

    public query<T>(route: string, searchString: string, matchCols: string, expand?: string,
                    select?: string, filter?: string, useModel?: string, numberSensitive = false): Observable<T> {

        const cols = matchCols.split(',');
        let params = '', prefix = '?', useStatistics = false;

        if (useModel) {
            route = '?model=' + useModel;
            useStatistics = true;
            prefix = '&';
        }

        if (numberSensitive && cols.length >= 2) {
            params = safeInt(searchString) > 0
                ? `startswith(${cols[0]},'${searchString}')`
                : `contains(${cols[1]},'${searchString}')`;
        } else {
            cols.forEach((value: string, index: number) => {
                if (index < 2) {
                    params += (index > 0 ? ' or ' : '') + 'startswith(' + value + ',\'' + searchString + '\')';
                }
            });
        }
        params = prefix + 'filter=' + ( filter ? filter + ' and ( ' + params + ' )' : params );
        if (expand) { params += '&expand=' + expand; }
        if (select) { params += '&select=' + this.mapStatSelect(select, useStatistics); }
        return this.GET(route + params, undefined, useStatistics );
    }

    public statQuery<T>(model: string, params: string): Observable<T> {
        return this.GET(`?model=${model}&${params}`, undefined, true );
    }

    private mapStatSelect(cols: string, useStatistics = false): string {
        if (!useStatistics) { return cols; }
        const arr = cols.split(',');
        const outArr = [];
        arr.forEach( item => {
            if (item.indexOf(' as ') < 0) {
                item += ' as ' + item;
            }
            outArr.push(item);
        });
        return outArr.join(',');
    }

    private analyzeUserInput(value: string): { iKey: number, key: any, label: string, isBlank: boolean } {
        const result = {
            iKey: 0, key: undefined, label: '', isBlank: true
        };
        // valid text input ?
        if (value && typeof value === 'string' && value.length > 0) {
            const parts = value.split(' ');
            if (parts.length === 1) {
                result.iKey = safeInt(value);
                result.key = value;
            } else {
                result.iKey = safeInt(parts[0]);
                result.key = parts[0];
                result.label = parts[1];
            }
        // number ?
        } else if (typeof value === 'number') {
            result.iKey = <any>value;
        }
        return result;
    }

    public checkAsyncLookup(event: IChangeEvent, success: (e: IChangeEvent) => void,
        failure?: (e: IChangeEvent) => void ): Promise<any> | void {

        // Handle lookups if user types, or user selects from a combo.
        // This is because there sometimes are visual referencekeys (ordernumber etc.), and sometimes there are actual foreignkeys
        // returns a Promise if validation is delayed.
        if (event.columnDefinition && event.columnDefinition.lookup) {

            const lookupDef = event.columnDefinition.lookup;

            // Remove "label" from key-value ?
            const validation = this.analyzeUserInput(event.value);
            const colType = (lookupDef.visualKeyType === 0 && event.userTypedValue) ? ColumnType.Text : event.columnDefinition.columnType;
            const key = (colType === ColumnType.Integer) ? validation.iKey : validation.key;

            // No key value (clear current value) ?
            if (!(validation.iKey || validation.key)) {
                if (validation.key && failure) {
                    failure(event);
                    return;
                }
                event.value = key;
                success(event);
                return;
            }

            let p: Promise<any>;

            // Did user just type a "visual" key value himself (customernumber, ordernumber etc.) !?
            if (event.userTypedValue && lookupDef.visualKey) {
                p = new Promise((resolve, reject) => {

                    if ((<any>lookupDef).searchValue) {
                        const rows = (<any>lookupDef).searchValue(key);
                        const item = (rows && rows.length > 0) ? rows[0] : {};
                        event.value = item[lookupDef.colToSave || 'ID'];
                        event.lookupValue = item;
                        success(event);
                        resolve(item);
                    } else {
                        let filter = `?filter=${lookupDef.visualKey} eq `;
                        if (lookupDef.visualKeyType === ColumnType.Text) {
                            filter += `'${key}'`;
                        } else {
                            filter += key;
                        }
                        this.getSingle<any>(lookupDef.route, filter, lookupDef.expand).subscribe((rows: any) => {
                            if (rows === undefined || rows === null || rows.length === 0) {
                                if (failure) { failure(event); } else { reject('not found'); }
                            } else {
                                const item = (rows && rows.length > 0) ? rows[0] : {};
                                event.value = item[lookupDef.colToSave || 'ID'];
                                event.lookupValue = item;
                                success(event);
                                resolve(item);
                            }
                        }, (err) => {
                            if (failure) { failure(event); } else { reject(err.statusText); }
                        });
                    }
                });
                event.updateCell = false;
                return p;
            }

            const lookupFunction = (<any>lookupDef).getValue;

            if (lookupFunction) {
                p = new Promise((resolve, reject) => {
                    const res = lookupFunction(key);
                    event.lookupValue = res;
                    event.value = key;
                    success(event);
                    resolve(res);
                });
            } else {
                // Normal lookup value (by foreignKey) ?
                p = new Promise((resolve, reject) => {
                    if (lookupDef.route) {
                        this.getSingle<any>(lookupDef.route, key, lookupDef.expand).subscribe( (item: any) => {
                            event.lookupValue = item;
                            event.value = key;
                            success(event);
                            resolve(item);
                        }, (err) => {
                            if (failure) { failure(event); } else { reject(err.statusText); }
                        });
                    }
                });
            }
            event.updateCell = false;
            return p;
        }
    }

    public onTypeSearch(details: ITypeSearch, numberSensitive = false) {
        if (details.columnDefinition && details.columnDefinition.lookup) {
            const lookup = details.columnDefinition.lookup;
            details.ignore = false;
            details.itemPropertyToSet = lookup.colToSave || 'ID';
            // Build combo-template
            const searchCols = lookup.select || 'ID,Name';
            const cols = searchCols.split(',');
            let filter = lookup.filter;
            if (details.value === '' && lookup.blankFilter) {
                filter = lookup.blankFilter;
            }
            details.renderFunc = details.columnDefinition.lookup.render || ((item: any) => {
                let ret = '';
                for (let i = 0; i < cols.length && i < 2; i++) {
                    ret += (i > 0 ? ' - ' : '') + item[cols[i]];
                }
                return ret;
            });

            if (!details.promise) {
                details.promise = this.query(lookup.route, details.value, searchCols, undefined,
                    searchCols, filter, details.columnDefinition.lookup.model, numberSensitive).toPromise();
            }
        }
    }


   // http helpers (less verbose?)

    private GET(route: string, params?: any, useStatistics = false ): Observable<any> {
        if (useStatistics) {
            return this.http.asGET().usingStatisticsDomain()
            .withEndPoint(route).send(params)
            .map(response => response.json().Data);
        }
        return this.http.asGET().usingBusinessDomain()
        .withEndPoint(route).send(params)
        .map(response => response.json());
    }
}
