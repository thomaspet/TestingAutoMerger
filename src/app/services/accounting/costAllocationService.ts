import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CostAllocation} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {ResponseContentType} from '@angular/http';
import {Observable} from 'rxjs';

@Injectable()
export class CostAllocationService extends BizHttp<CostAllocation> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = CostAllocation.RelativeUrl;
        this.entityType = CostAllocation.EntityType;
    }

    public search(query: string): Observable<CostAllocation[]> {
        return super.GetAll(`filter=startswith(ID,'${query}') or contains(Name,'${query}')`);
    }

    public getCostAllocationOptions(costAllocationID) {
        const defaultValue = Observable
            .of(costAllocationID)
            .switchMap(id => id > 0
                ? this.GetAll(`filter=ID eq ${id}&top=1`)
                : Observable.of([]))
            .take(1);

        return {
            getDefaultData: () => defaultValue,
            template: (obj: CostAllocation) => obj && obj.ID ? `${obj.ID} - ${obj.Name}` : '',
            search: (query: string) => this.search(query),
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        }   
    }
}