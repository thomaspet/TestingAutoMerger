import {Injectable} from '@angular/core';
import {BizHttp} from '@uni-framework/core/http/BizHttp';
import {TravelLine} from '@uni-entities';
import {UniHttp} from '@uni-framework/core/http/http';
import {Observable} from 'rxjs';
import {VatTypeService} from '@app/services/accounting/vatTypeService';

@Injectable()
export class TravelLineService extends BizHttp<TravelLine> {

    constructor(
        protected http: UniHttp,
        private vatTypeService: VatTypeService

    ) {
        super(http);
        this.entityType = TravelLine.EntityType;
        this.relativeURL = TravelLine.RelativeUrl;
    }

    public suggestVatType(travelLine: TravelLine): Observable<TravelLine> {
        return this.vatTypeService
            .getVatTypeOnAccount(travelLine.AccountNumber)
            .map(vatType => {
                travelLine.VatType = vatType;
                travelLine.VatTypeID = vatType && vatType.ID;
                return travelLine;
            });
    }
}
