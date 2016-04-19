import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Address} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {SearchResultItem} from '../../../app/components/common/externalSearch/externalSearch';
import {Observable} from 'rxjs/Observable';

export class AddressService extends BizHttp<Address> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = "addresses"; // TODO: missing Address.relativeUrl;
                
        this.DefaultOrderBy = null;
    }           
    
    businessAddressFromSearch(selectedSearchInfo: SearchResultItem): Promise<any> {     
        var self = this;
        
        if(selectedSearchInfo.forretningsadr == "" && selectedSearchInfo.forradrpostnr == "" && selectedSearchInfo.forradrpoststed == "" && selectedSearchInfo.forradrland == "") {
            return null;
        };
               
        return new Promise(resolve => {
            this.GetNewEntity([], "address").subscribe(address => {
                address.AddressLine1 = selectedSearchInfo.forretningsadr;
                address.PostalCode = selectedSearchInfo.forradrpostnr;
                address.City = selectedSearchInfo.forradrpoststed;
                address.Country = selectedSearchInfo.forradrland;           
                
                resolve(address); 
            });
        });        
    }
    
    postalAddressFromSearch(selectedSearchInfo: SearchResultItem): Promise<any> {
        var self = this;

        if(selectedSearchInfo.postadresse == "" && selectedSearchInfo.ppostnr == "" && selectedSearchInfo.ppoststed == "" && selectedSearchInfo.ppostland == "") {
            return null;
        };
 
        return new Promise(resolve => {
            this.GetNewEntity([], "address").subscribe(address => {
                address.AddressLine1 = selectedSearchInfo.postadresse;
                address.PostalCode = selectedSearchInfo.ppostnr;
                address.City = selectedSearchInfo.ppoststed;
                address.Country = selectedSearchInfo.ppostland;
                
                resolve(address); 
            }); 
        }); 
    }
}