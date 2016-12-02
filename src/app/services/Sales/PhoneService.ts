import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Phone, PhoneTypeEnum} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {SearchResultItem} from '../../../app/components/common/externalSearch/externalSearch';
import {ErrorService} from '../common/ErrorService';

export class PhoneService extends BizHttp<Phone> {
    
    constructor(http: UniHttp, private errorService: ErrorService) {
        super(http);
        
        this.relativeURL = "phones"; //TODO: missing Phone.RelativeUrl;

        this.entityType = Phone.EntityType;
                
        this.DefaultOrderBy = null;
    }
    
    phoneFromSearch(selectedSearchInfo: SearchResultItem): Promise<any> {
        var self = this;

        if(selectedSearchInfo.tlf == "") {
            return null;
        };
        
        return new Promise(resolve => {
            this.GetNewEntity([], "phone").subscribe(phone => {
                phone.Number = selectedSearchInfo.tlf;
                phone.Type = PhoneTypeEnum.PtPhone;
                            
                resolve(phone); 
            }, err => this.errorService.handle(err));
        });  
    }
    
    mobileFromSearch(selectedSearchInfo: SearchResultItem): Promise<any> {
        var self = this;
        
        if(selectedSearchInfo.tlf_mobil == "") {
            return null;
        };
 
        return new Promise(resolve => {
            this.GetNewEntity([], "phone").subscribe(phone => {
                phone.Number = selectedSearchInfo.tlf_mobil;
                phone.Type = PhoneTypeEnum.PtMobile;
                        
                resolve(phone); 
            }, err => this.errorService.handle(err));
        });        
    }        
}
