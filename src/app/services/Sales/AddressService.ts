import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Address} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {SearchResultItem} from '../../../app/components/common/externalSearch/externalSearch';

export class AddressService extends BizHttp<Address> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = "addresses"; // TODO: missing Address.relativeUrl;
                
        this.DefaultOrderBy = null;
    }           
    
    businessAddressFromSearch(selectedSearchInfo: SearchResultItem): Address {
        var address = new Address();
        address.AddressLine1 = selectedSearchInfo.forretningsadr;
        address.PostalCode = selectedSearchInfo.forradrpostnr;
        address.City = selectedSearchInfo.forradrpoststed;
        address.Country = selectedSearchInfo.forradrland;  
        
        if(address.AddressLine1 == "" && address.PostalCode == "" && address.City == "" && address.Country == "") return null;
        else return address; 
    }
    
    postalAddressFromSearch(selectedSearchInfo: SearchResultItem): Address {
        var address = new Address();
        address.AddressLine1 = selectedSearchInfo.postadresse;
        address.PostalCode = selectedSearchInfo.ppostnr;
        address.City = selectedSearchInfo.ppoststed;
        address.Country = selectedSearchInfo.ppostland;

        if(address.AddressLine1 == "" && address.PostalCode == "" && address.City == "" && address.Country == "") return null;
        else return address;   
    }
}