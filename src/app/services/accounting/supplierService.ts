import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Supplier} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {StatisticsService} from '../common/statisticsService';
import {Observable} from 'rxjs';
import { StatisticsResponse } from '@app/models/StatisticsResponse';

@Injectable()
export class SupplierService extends BizHttp<Supplier> {

    constructor(http: UniHttp, private statisticsService: StatisticsService) {
        super(http);

        // TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.relativeURL = Supplier.RelativeUrl;

        this.entityType = Supplier.EntityType;

        // set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }

    public deleteSupplier(id: any): any {
        return this.http
            .asPUT()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}?action=delete&ID=${id}`)
            .send();
    }

    public getSuppliers(organizationNumber: string): Observable<StatisticsResponse> {
        const qry = '' +
        'model=Supplier&select=Supplier.SupplierNumber as SupplierNumber,Info.Name as Name' +
        '&filter=Supplier.OrgNumber eq ' + organizationNumber +
        '&expand=Info';
        return this.statisticsService.GetAll(qry);
    }

     public activateSupplier(id: any): any {
        return this.http
            .asPUT()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}?action=activate&ID=${id}`)
            .send();
    }

    public deactivateSupplier(id: any): any {
        return this.http
            .asPUT()
            .withDefaultHeaders()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}?action=deactivate&ID=${id}`)
            .send();
    }

    public blockSupplier(id: number, isBlock: boolean = false) {
        const action: string = isBlock ? 'block' : 'unblock';
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}?action=${action}&ID=${id}`)
            .send();
    }

    public clearCache() {
        super.invalidateCache();
    }

    NextSupplier(currentID: number): Observable<Supplier> {
        return super.GetAction(currentID, 'next');
    }

    PreviousSupplier(currentID: number): Observable<Supplier> {
        return super.GetAction(currentID, 'previous');
    }

    /* Not implemented on backend
    FirstCustomer(): Supplier
    {
        return super.Action(0, "first");
    }

    LastCustomer(): Supplier
    {
        return super.Action(0, "last");
    }
    */
}
