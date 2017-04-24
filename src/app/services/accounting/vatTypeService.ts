import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {VatType} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../../framework/core/authService';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class VatTypeService extends BizHttp<VatType> {

    constructor(http: UniHttp, authService: AuthService) {
        super(http, authService);

        this.relativeURL = VatType.RelativeUrl;

        this.entityType = VatType.EntityType;

        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = 'VatCode';
    }

    public GetVatTypesWithVatReportReferencesAndVatCodeGroup(): Observable<VatType[]> {
        return this.GetAll(null, [
            'VatCodeGroup',
            'VatReportReferences',
            'VatReportReferences.Account',
            'VatReportReferences.VatPost'
        ]);
    }
}
