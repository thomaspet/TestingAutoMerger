import {Injectable} from '@angular/core';
import {AddressService} from '../../../services/services';
import {Customer} from '../../../unientities';

@Injectable()
export class TofHelper {
    constructor(private addressService: AddressService) {}

    // Without mapping the customer to entity here, creating a new TOF from customer 
    // will not bring along all the attributes that are needed in the TOF
    public mapCustomerToEntity(customer: Customer, entity: any): any {
        entity.Customer = customer;
        entity.CustomerID = customer.ID;

        if (customer.Info) {
            entity.CustomerName = customer.Info.Name;
            const emails = customer.Info.Emails || [];
            const addresses = customer.Info.Addresses || [];

            entity.EmailAddress = customer.Info.DefaultEmailID 
                && emails.find(email => email.ID === customer.Info.DefaultEmailID).EmailAddress;

            if (customer.Info.InvoiceAddressID) {
                this.addressService.addressToInvoice(
                    entity,
                    addresses.find(addr => addr.ID === customer.Info.InvoiceAddressID)
                );
            }

            if (customer.Info.ShippingAddressID) {
                this.addressService.addressToShipping(
                    entity,
                    addresses.find(addr => addr.ID === customer.Info.ShippingAddressID)
                );
            }

            entity.CurrencyCodeID = customer.CurrencyCodeID;
        }

        if (customer.Dimensions && customer.Dimensions.ProjectID) {
            entity.DefaultDimensions.ProjectID = customer.Dimensions.ProjectID;
            entity.DefaultDimensions.Project = customer.Dimensions.Project;
        }
        

        
        if (customer.PaymentTermsID) {
            entity.PaymentTermsID = customer.PaymentTermsID;
            entity.PaymentTerms = customer.PaymentTerms;
        }
        if (customer.DeliveryTermsID) {
            entity.DeliveryTermsID = customer.DeliveryTermsID;
            entity.DeliveryTerms = customer.DeliveryTerms;
        }

        if (customer.Sellers) {
            entity.Sellers = customer.Sellers.map(seller => {
                seller.ID = undefined;
                seller.CustomerID = undefined;
                return seller;
            });
        }

        return entity;
    }
}
