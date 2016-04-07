import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Phone, PhoneTypeEnum} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {SearchResultItem} from '../../../app/components/common/externalSearch/externalSearch';

export class PhoneService extends BizHttp<Phone> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = "phones"; //TODO: missing Phone.relativeUrl;
                
        this.DefaultOrderBy = null;
    }
    
    phoneFromSearch(selectedSearchInfo: SearchResultItem): Phone {
        this.GetNewEntity().subscribe(phone => {
           console.log("::INSIDE::");
           console.log(phone);
           phone.Number = selectedSearchInfo.tlf;
           phone.Type = PhoneTypeEnum.PtPhone;
           return phone; 
        });
        
        /*var phone = new Phone();
        phone.Number = selectedSearchInfo.tlf;
        phone.Type = PhoneTypeEnum.PtPhone;
        phone.StatusCode = 1;
        
        if (phone.Number == "") return null;
        else return phone;*/
    }
    
    mobileFromSearch(selectedSearchInfo: SearchResultItem): Phone {
        var phone = new Phone();
        phone.Number = selectedSearchInfo.tlf_mobil;
        phone.Type = PhoneTypeEnum.PtMobile;
        phone.StatusCode = 1;
        
        if (phone.Number == "") return null;
        else return phone;
    }        
}