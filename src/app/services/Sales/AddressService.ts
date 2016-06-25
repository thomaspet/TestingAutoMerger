import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Address} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {SearchResultItem} from '../../../app/components/common/externalSearch/externalSearch';

declare var _;

export class AddressService extends BizHttp<Address> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = 'addresses'; // TODO: missing Address.RelativeUrl;
                
        this.DefaultOrderBy = null;
    }           
    
    public businessAddressFromSearch(selectedSearchInfo: SearchResultItem): Promise<any> {     
        
        if ( selectedSearchInfo.forretningsadr === '' 
            && selectedSearchInfo.forradrpostnr  === '' 
            && selectedSearchInfo.forradrpoststed  === '' 
            && selectedSearchInfo.forradrland  === '') {
            return null;
        };
               
        return new Promise(resolve => {
            this.GetNewEntity([], 'address').subscribe(address => {
                address.AddressLine1 = selectedSearchInfo.forretningsadr;
                address.PostalCode = selectedSearchInfo.forradrpostnr;
                address.City = selectedSearchInfo.forradrpoststed;
                address.Country = selectedSearchInfo.forradrland;           
                
                resolve(address); 
            });
        });        
    }
    
    public postalAddressFromSearch(selectedSearchInfo: SearchResultItem): Promise<any> {
        if ( selectedSearchInfo.postadresse === '' 
            && selectedSearchInfo.ppostnr  === '' 
            && selectedSearchInfo.ppoststed  ==='' 
            && selectedSearchInfo.ppostland  ===''
        ) {
            return null;
        }
 
        return new Promise(resolve => {
            this.GetNewEntity([], 'address').subscribe(address => {
                address.AddressLine1 = selectedSearchInfo.postadresse;
                address.PostalCode = selectedSearchInfo.ppostnr;
                address.City = selectedSearchInfo.ppoststed;
                address.Country = selectedSearchInfo.ppostland;
                
                resolve(address); 
            }); 
        }); 
    }

    // Special address handling for CustomerInvoice, CustomerOrder and CustomerQuote which save addresses flat in entity

    private isEmptyAddress(address: Address): boolean {
        if (address == null) {
            return true;
        }
        return (address.AddressLine1 == null &&
            address.AddressLine2 == null &&
            address.AddressLine3 == null &&
            address.PostalCode == null &&
            address.City == null &&
            address.Country == null &&
            address.CountryCode == null);
    }

    public addressToInvoice(entity: any, a: Address) {
        a = a || new Address();
        entity.InvoiceAddressLine1 = a.AddressLine1;
        entity.InvoiceAddressLine2 = a.AddressLine2;
        entity.InvoiceAddressLine3 = a.AddressLine3;
        entity.InvoicePostalCode = a.PostalCode;
        entity.InvoiceCity = a.City;
        entity.InvoiceCountry = a.Country;
        entity.InvoiceCountryCode = a.CountryCode;
    }

    public addressToShipping(entity: any, a: Address) {
        a = a || new Address();
        entity.ShippingAddressLine1 = a.AddressLine1;
        entity.ShippingAddressLine2 = a.AddressLine2;
        entity.ShippingAddressLine3 = a.AddressLine3;
        entity.ShippingPostalCode = a.PostalCode;
        entity.ShippingCity = a.City;
        entity.ShippingCountry = a.Country;
        entity.ShippingCountryCode = a.CountryCode;
    }

    private invoiceToAddress(entity: any): Address {
        var a = new Address();
        a.AddressLine1 = entity.InvoiceAddressLine1;
        a.AddressLine2 = entity.InvoiceAddressLine2;
        a.AddressLine3 = entity.ShippingAddressLine3;
        a.PostalCode = entity.InvoicePostalCode;
        a.City = entity.InvoiceCity;
        a.Country = entity.InvoiceCountry;
        a.CountryCode = entity.InvoiceCountryCode;
  
        return a;
    }

    private shippingToAddress(entity: any): Address {
        var a = new Address();
        a.AddressLine1 = entity.ShippingAddressLine1;
        a.AddressLine2 = entity.ShippingAddressLine2;
        a.AddressLine3 = entity.ShippingAddressLine3;
        a.PostalCode = entity.ShippingPostalCode;
        a.City = entity.ShippingCity;
        a.Country = entity.ShippingCountry;
        a.CountryCode = entity.ShippingCountryCode;
 
        return a;
    }

    public setAddresses(entity: any, previousAddresses: Array<Address> = null) {
        var invoiceaddresses = entity._InvoiceAddresses || [];
        var shippingaddresses = entity._ShippingAddresses || [];
        var firstinvoiceaddress = null;
        var firstshippingaddress = null;

        // remove addresses from last customer
        if (previousAddresses) {
            previousAddresses.forEach(a => {
                invoiceaddresses.forEach((b, i) => {
                    if (a.ID == b.ID) {
                        delete invoiceaddresses[i];
                        return;
                    }
                });
                shippingaddresses.forEach((b, i) => {
                    if (a.ID == b.ID) {
                        delete shippingaddresses[i];
                        return;
                    }
                });
            });
        }

        // Add address from order if no addresses
        if (invoiceaddresses.length == 0) {
            var invoiceaddress = this.invoiceToAddress(entity);
            if (!this.isEmptyAddress(invoiceaddress)) {
                firstinvoiceaddress = invoiceaddress;
            }
        } else {
            firstinvoiceaddress = invoiceaddresses.shift();
        }

        if (shippingaddresses.length == 0) {
            var shippingaddress = this.shippingToAddress(entity);
            if (!this.isEmptyAddress(shippingaddress)) {
                firstshippingaddress = shippingaddress;
            }
        } else {
            firstshippingaddress = shippingaddresses.shift();
        }

        if (!this.isEmptyAddress(firstinvoiceaddress)) {
            invoiceaddresses.unshift(firstinvoiceaddress);
        }

        if (!this.isEmptyAddress(firstshippingaddress)) {
            shippingaddresses.unshift(firstshippingaddress);
        }

        // Add addresses from current customer
        if (entity.Customer) {
            console.log("== BEFORE ==", invoiceaddresses);

            invoiceaddresses = invoiceaddresses.concat(_.cloneDeep(entity.Customer.Info.Addresses));
            shippingaddresses = shippingaddresses.concat(_.cloneDeep(entity.Customer.Info.Addresses));

            console.log("== INVOICEADDRESSES IS NOW =", invoiceaddresses);
        } 

        entity._InvoiceAddresses = _.cloneDeep(invoiceaddresses);
        entity._ShippingAddresses = _.cloneDeep(shippingaddresses);
   }
}