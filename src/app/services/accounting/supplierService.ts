import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Supplier} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class SupplierService extends BizHttp<Supplier> {

    constructor(http: UniHttp) {
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

    public blockSupplier(id: number) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}?action=block&ID=${id}`)
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
