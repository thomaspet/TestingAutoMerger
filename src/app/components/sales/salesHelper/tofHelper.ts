import {Injectable} from '@angular/core';
import {AddressService} from '../../../services/services';
import {Customer} from '../../../unientities';

@Injectable()
export class TofHelper {
    constructor(private addressService: AddressService) {}

    public mapCustomerToEntity(customer: Customer, entity: any): any {
        entity.Customer = customer;
        entity.CustomerID = customer.ID;

        if (customer.Info) {
            entity.CustomerName = customer.Info.Name;
            const addresses = customer.Info.Addresses || [];

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
        }

        return entity;
    }

}
