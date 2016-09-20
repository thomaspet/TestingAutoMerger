import {BizHttp} from '../../../framework/core/http/BizHttp';
import {VatType} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';

export class VatTypeService extends BizHttp<VatType> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.relativeURL = VatType.RelativeUrl;

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
