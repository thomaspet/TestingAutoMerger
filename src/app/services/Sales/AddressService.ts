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
        if(selectedSearchInfo.forretningsadr == "" && selectedSearchInfo.forradrpostnr == "" && selectedSearchInfo.forradrpoststed == "" && selectedSearchInfo.forradrland == "") {
            return null;
        };
        
        console.log("ZZ businessAddressFromSearch");
        this.GetNewEntity(null, "address").subscribe((data) => {
            console.log("XX8 GetNewEntity");
            console.log(data);
        });
           /*     
        this.GetNewEntity().map(address => {
            console.log("ZZ GetNewEntity");
            address.AddressLine1 = selectedSearchInfo.forretningsadr;
            address.PostalCode = selectedSearchInfo.forradrpostnr;
            address.City = selectedSearchInfo.forradrpoststed;
            address.Country = selectedSearchInfo.forradrland;
            
            console.log("ZZ INSIDE ==");
            console.log(address);
            
            return address; 
        });*/
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