import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {VatType} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import * as moment from 'moment';

@Injectable()
export class VatTypeService extends BizHttp<VatType> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = VatType.RelativeUrl;

        this.entityType = VatType.EntityType;

        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = 'VatCode';
        this.defaultExpand = ['VatTypePercentages'];
    }

    public GetVatTypesWithVatReportReferencesAndVatCodeGroup(): Observable<VatType[]> {
        return this.GetAll(null, [
            'VatCodeGroup',
            'VatReportReferences',
            'VatReportReferences.Account',
            'VatReportReferences.VatPost'
        ]);
    }

    public GetVatTypesWithDefaultVatPercent(query: string): Observable<VatType[]> {
        return this.GetAll(query)
            .map(vattypes => {
                // map vattypepercentage data to vattype to get the defaultvalue
                // based on todays date - might need to consider checking based on
                // accountingyear instead, but this really depends on the context,
                // for invoicing current date is most likely what we want
                let response: Array<VatType> = [];

                let today = moment(new Date());

                vattypes.forEach((vatType) => {
                    let currentPercentage =
                        vatType.VatTypePercentages.find(y =>
                            (moment(y.ValidFrom) <= today && y.ValidTo && moment(y.ValidTo) >= today)
                            || (moment(y.ValidFrom) <= today && !y.ValidTo));

                    if (currentPercentage) {
                        vatType.VatPercent = currentPercentage.VatPercent;
                    }

                    response.push(vatType);
                });

                return response;
            });
    }
}
