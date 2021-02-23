import {Injectable} from '@angular/core';
import {AddressService, SellerLinkService} from '../../../services/services';
import {Customer, BusinessRelation} from '../../../unientities';

@Injectable()
export class TofHelper {
    constructor(
        private addressService: AddressService,
        private sellerLinkService: SellerLinkService
    ) {}

    // Warning: this runs before save on quote, order and invoice.
    // Don't put logic specific to one of the entities here.
    beforeSave(entity) {
        if (entity.DefaultDimensions && !entity.DefaultDimensions.ID) {
            entity.DefaultDimensions._createguid = this.addressService.getNewGuid();
        }

        if (entity.DefaultSeller && entity.DefaultSeller.ID > 0 && entity.DefaultSellerID > 0) {
            entity.DefaultSeller = undefined;
        }

        if (entity.DefaultSeller && entity.DefaultSeller.ID === null) {
            entity.DefaultSeller = null;
            entity.DefaultSellerID = null;
        }

        /*
            Removing customer so we don't accidentally save changes to it through
            complex put on the tof entity. This might be limited on the backend later,
            but Frode want's a hotfix on it.

            https://unimicro.atlassian.net/browse/RIG-570
        */
        entity.Customer = null;

        return entity;
    }

    // Without mapping the customer to entity here, creating a new TOF from customer
    // will not bring along all the attributes that are needed in the TOF
    public mapCustomerToEntity(customer: Customer, entity: any, isNew: boolean = true): any {
        entity.Customer = customer;
        entity.CustomerID = customer?.ID;

        if (!customer) { // == for undefined and null check
            entity.EmailAddress = null;
            this.addressService.addressToInvoice(entity, null);
            this.addressService.addressToShipping(entity, null);
            entity.CustomerName = null;
            entity.CurrencyCodeID = null;
            entity.DefaultSellerID = null;
            entity.DefaultSeller = null;

            entity.PaymentTermsID = null;
            entity.PaymentTerms = null;
            entity.DeliveryTermsID = null;
            entity.DeliveryTerms = null;
            entity.Sellers = [];
            return entity;
        } 

        if (customer?.Info) {
            entity.CustomerName = customer.Info.Name;
            const emails = customer.Info.Emails || [];
            const addresses = customer.Info.Addresses || [];

            entity.EmailAddress = customer.Info.DefaultEmail && customer.Info.DefaultEmail.EmailAddress;

            if (customer.Info.InvoiceAddressID) {
                this.addressService.addressToInvoice(
                    entity,
                    addresses.find(addr => addr.ID === customer.Info.InvoiceAddressID)
                );
            } else {
                this.addressService.addressToInvoice(entity, null);
            }

            if (customer.Info.ShippingAddressID) {
                this.addressService.addressToShipping(
                    entity,
                    addresses.find(addr => addr.ID === customer.Info.ShippingAddressID)
                );
            } else {
                this.addressService.addressToShipping(entity,null);
            }

            // Only change currencycode when new customer is selected and it has a CurrencyCodeID
            if (isNew && customer.CurrencyCodeID > 0) {
                entity.CurrencyCodeID = customer.CurrencyCodeID;
            }

            entity.YourReference = customer.Info.DefaultContact && customer.Info.DefaultContact.Info.Name;
        }

        entity.DefaultSellerID = customer.DefaultSellerID || null;
        entity.DefaultSeller = customer.DefaultSeller || null;

        if (customer.Dimensions) {
            entity.DefaultDimensions = entity.DefaultDimensions || {};
            // Project
            entity.DefaultDimensions.ProjectID = customer.Dimensions.ProjectID;
            entity.DefaultDimensions.Project = customer.Dimensions.Project;
            // Department
            entity.DefaultDimensions.DepartmentID = customer.Dimensions.DepartmentID;
            entity.DefaultDimensions.Department = customer.Dimensions.Department;
            // Custom Dimensions
            for (let i = 5; i <= 10; i++) {
                entity.DefaultDimensions[`Dimension${i}ID`] = customer.Dimensions[`Dimension${i}ID`];
                entity.DefaultDimensions[`Dimension${i}`] = customer.Dimensions[`Dimension${i}`];
            }
        }

        if (customer.PaymentTermsID) {
            entity.PaymentTermsID = customer.PaymentTermsID;
            entity.PaymentTerms = customer.PaymentTerms;
        }
        if (customer.DeliveryTermsID) {
            entity.DeliveryTermsID = customer.DeliveryTermsID;
            entity.DeliveryTerms = customer.DeliveryTerms;
        }

        // map sellers to entity
        const sellers = [];
        if (!entity.Sellers.length && customer.Sellers) {
            customer.Sellers.forEach((seller) => {
                sellers.push({
                    Percent: seller.Percent,
                    SellerID: seller.SellerID,
                    Seller: seller.Seller,
                    _createguid: this.sellerLinkService.getNewGuid(),
                });
            });
            entity.Sellers = sellers;
        }

        return entity;
    }

    isDistributable(entityName, entity, settings, plans) {
        var distributionPlanID = entity.DistributionPlanID
            || (entity.Customer && entity.Customer.Distributions && entity.Customer.Distributions[entityName + 'DistributionPlanID'])
            || (settings && settings.Distributions && settings.Distributions[entityName + 'DistributionPlanID']);

        if (!distributionPlanID) {
            return false;
        }

        var plan = plans.find(plan => plan.ID === distributionPlanID);
        return plan && plan.Name !== 'Ingen utsendelse';
    }
}
