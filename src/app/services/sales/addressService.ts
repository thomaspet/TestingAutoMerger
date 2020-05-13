import {Injectable} from '@angular/core';
import {BizHttp} from '@uni-framework/core/http/BizHttp';
import {Address} from '@app/unientities';
import {UniHttp} from '@uni-framework/core/http/http';
import {ErrorService} from '../common/errorService';

@Injectable()
export class AddressService extends BizHttp<Address> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = 'addresses'; // TODO: missing Address.RelativeUrl;
        this.entityType = Address.EntityType;
        this.DefaultOrderBy = null;
    }

    public addressToInvoice(entity: any, a: Address) {
        a = a || new Address();
        entity.InvoiceAddressLine1 = a.AddressLine1 || '';
        entity.InvoiceAddressLine2 = a.AddressLine2 || '';
        entity.InvoiceAddressLine3 = a.AddressLine3 || '';
        entity.InvoicePostalCode = a.PostalCode || '';
        entity.InvoiceCity = a.City || '';
        entity.InvoiceCountry = a.Country || '';
        entity.InvoiceCountryCode = a.CountryCode || '';
    }

    public addressToShipping(entity: any, a: Address) {
        a = a || new Address();
        entity.ShippingAddressLine1 = a.AddressLine1 || '';
        entity.ShippingAddressLine2 = a.AddressLine2 || '';
        entity.ShippingAddressLine3 = a.AddressLine3 || '';
        entity.ShippingPostalCode = a.PostalCode || '';
        entity.ShippingCity = a.City || '';
        entity.ShippingCountry = a.Country || '';
        entity.ShippingCountryCode = a.CountryCode || '';
    }

    public invoiceToAddress(entity: any): Address {
        const a = new Address();
        a.AddressLine1 = entity.InvoiceAddressLine1;
        a.AddressLine2 = entity.InvoiceAddressLine2;
        a.AddressLine3 = entity.ShippingAddressLine3;
        a.PostalCode = entity.InvoicePostalCode;
        a.City = entity.InvoiceCity;
        a.Country = entity.InvoiceCountry;
        a.CountryCode = entity.InvoiceCountryCode;

        return a;
    }

    public shippingToAddress(entity: any): Address {
        const a = new Address();
        a.AddressLine1 = entity.ShippingAddressLine1;
        a.AddressLine2 = entity.ShippingAddressLine2;
        a.AddressLine3 = entity.ShippingAddressLine3;
        a.PostalCode = entity.ShippingPostalCode;
        a.City = entity.ShippingCity;
        a.Country = entity.ShippingCountry;
        a.CountryCode = entity.ShippingCountryCode;

        return a;
    }

    public displayAddress(address: Address): string {
        if (address == null) { return ''; }
        let displayVal = '';
        if (address.AddressLine1 && address.AddressLine1 !== '') {
            displayVal += address.AddressLine1;
            if ((address.PostalCode && address.PostalCode !== '') ||
               (address.City && address.City !== '')) {
                displayVal += ', ';
            }
        }
        if (address.PostalCode && address.PostalCode !== '') {
            displayVal += address.PostalCode  + ' ';
        }
        if (address.City && address.City !== '') {
            displayVal += address.City;
        }
        return displayVal;
    }
}
