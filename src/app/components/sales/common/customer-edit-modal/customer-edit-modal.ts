import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {IUniModal, IModalOptions, UniModalService, UniEmailModal, UniPhoneModal, UniAddressModal} from '@uni-framework/uni-modal';
import {Customer, FieldType, Address, BusinessRelation, Phone, Email} from '@uni-entities';
import {CustomerService, ErrorService, AddressService, IntegrationServerCaller} from '@app/services/services';
import {BehaviorSubject} from 'rxjs';
import {AutocompleteOptions, Autocomplete} from '@uni-framework/ui/autocomplete/autocomplete';
import {UniForm} from '@uni-framework/ui/uniform';

@Component({
    templateUrl: './customer-edit-modal.html',
    styleUrls: ['./customer-edit-modal.sass']
})
export class CustomerEditModal implements IUniModal {
    @ViewChild(UniForm, { static: true }) form: UniForm;
    @ViewChild(Autocomplete) autocomplete: Autocomplete;

    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    busy: boolean;

    isNewCustomer: boolean;
    value: string = '';

    customer$ = new BehaviorSubject<Customer>(null);
    fields$ = new BehaviorSubject([]);
    config$ = new BehaviorSubject({});

    isDirty: boolean;
    externalLookupOptions: AutocompleteOptions;

    constructor(
        private modalService: UniModalService,
        private errorService: ErrorService,
        private customerService: CustomerService,
        private addressService: AddressService,
        private integrationServerCaller: IntegrationServerCaller
    ) {}

    ngOnInit() {
        const customer = this.options.data;
        this.isNewCustomer = !!customer;
        if (customer) {
            this.customer$.next(customer);
            this.config$.next({autofocus: true});
        } else {
            this.value = this.options.listkey;
            this.initNewCustomer(this.options.listkey);
        }

        this.fields$.next(this.getFormFields());
    }

    ngOnDestroy() {
        this.customer$.complete();
        this.fields$.complete();
        this.config$.complete();
    }

    initNewCustomer(searchValue?: string) {
        this.busy = true;

        this.externalLookupOptions = {
            placeholder: 'Søk i 1880/Brønnøysundregistrene',
            autofocus: true,
            lookup: (query, filterCheckboxValues) => {
                return this.integrationServerCaller.businessRelationSearch(
                    query, 50, filterCheckboxValues[0], filterCheckboxValues[1]
                );
            },
            filterCheckboxes: [
                { label: 'Selskaper', value: true },
                { label: 'Privatpersoner', value: true }
            ],
            resultTableColumns: [
                { header: 'Navn', field: 'Name' },
                { header: 'Adresse', field: 'Streetaddress' },
                {
                    header: 'Poststed',
                    template: item => {
                        if (item.PostCode || item.City) {
                            return `${item.PostCode} - ${item.City}`;
                        }
                    }
                },
                { header: 'Orgnummer', field: 'OrganizationNumber' },
            ],
        };

        this.customerService.GetNewEntity(
            ['Info.Phones', 'Info.Addresses', 'Info.Emails']
        ).subscribe(
            res =>  {
                res.Info.Name = searchValue || '';
                this.customer$.next(res);
                this.busy = false;
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    onSearchShiftTab(event: KeyboardEvent) {
        event.preventDefault();
        if (this.form) {
            this.form.focus();
        }
    }

    onFormMoveOutEvent(event) {
        if (event && event.movingBackward && this.autocomplete) {
            this.autocomplete.focus();
        }
    }

    onCancelShiftTab(event: KeyboardEvent) {
        event.preventDefault();
        if (this.form) {
            this.form.focus();
        }
    }

    onExternalSearchSelected(item) {
        if (!item) {
            return;
        }

        const customer = this.customer$.value;

        customer.OrgNumber = item.OrganizationNumber;
        customer.WebUrl = item.Url;
        customer.Info = <BusinessRelation> { Name: item.Name };

        if (item.Streetaddress || item.PostCode || item.City) {
            const address = <Address> {
                AddressLine1: item.Streetaddress,
                PostalCode: item.PostCode,
                City: item.City,
                _createguid: this.customerService.getNewGuid()
            };

            customer.Info.Addresses = [address];
            customer.Info.InvoiceAddress = address;
            customer.Info.ShippingAddress = address;
        }

        if (item.Phone) {
            const phone = <Phone> {
                Number: item.Phone,
                _createguid: this.customerService.getNewGuid()
            };

            customer.Info.Phones = [phone];
            customer.Info.DefaultPhone = phone;
        }

        if (item.EmailAddress) {
            const email = <Email> {
                EmailAddress: item.EmailAddress,
                _createguid: this.customerService.getNewGuid()
            };

            customer.Info.Emails = [email];
            customer.Info.DefaultEmail = email;
        }

        this.isDirty = true;
        this.customer$.next(customer);
        setTimeout(() => {
            if (this.form) {
                this.form.focus();
            }
        });
    }

    save() {
        if (!this.isDirty) {
            this.onClose.emit();
        }

        // Remove duplicates (api should probably handle this..)
        const customer = this.customer$.value;
        customer.Info.Addresses = customer.Info.Addresses && customer.Info.Addresses.filter(address => {
            return address.ID || address._createguid !== customer.Info.InvoiceAddress._createguid;
        });

        customer.Info.Phones = customer.Info.Phones && customer.Info.Phones.filter(phone => {
            return phone.ID || phone._createguid !== customer.Info.DefaultPhone._createguid;
        });

        customer.Info.Emails = customer.Info.Emails && customer.Info.Emails.filter(email => {
            return email.ID || email._createguid !== customer.Info.DefaultEmail._createguid;
        });

        this.busy = true;
        const saveRequest = !!customer.ID
            ? this.customerService.Put(customer.ID, customer)
            : this.customerService.Post(customer);

        saveRequest.subscribe(
            res => this.onClose.emit(res),
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    getFormFields() {
        return [
            {
                Property: 'Info.Name',
                FieldType: FieldType.TEXT,
                Label: 'Navn',
            },
            {
                Property: 'Info.InvoiceAddress',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Fakturaadresse',
                Options: {
                    listProperty: 'Info.Addresses',
                    displayValue: 'AddressLine1',
                    linkProperty: 'ID',
                    storeResultInProperty: 'Info.InvoiceAddress',
                    storeIdInProperty: 'Info.InvoiceAddressID',
                    editor: (value) => {
                        const modal = this.modalService.open(UniAddressModal, {
                            data: value || {},
                            header: 'Fakturaadresse'
                        });

                        return modal.onClose.take(1).toPromise();
                    },
                    display: (address: Address) => {
                        return this.addressService.displayAddress(address);
                    }
                }
            },
            {
                Property: 'Info.DefaultEmail',
                FieldType: FieldType.MULTIVALUE,
                Label: 'E-postadresse',
                Options: {
                    listProperty: 'Info.Emails',
                    displayValue: 'EmailAddress',
                    linkProperty: 'ID',
                    storeResultInProperty: 'Info.DefaultEmail',
                    storeIdInProperty: 'Info.DefaultEmailID',
                    editor: (value) => {
                        const modal = this.modalService.open(UniEmailModal, { data: value || {} });
                        return modal.onClose.take(1).toPromise();
                    }
                }
            },
            {
                Property: 'Info.DefaultPhone',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Telefonnummer',
                Options: {
                    listProperty: 'Info.Phones',
                    displayValue: 'Number',
                    linkProperty: 'ID',
                    storeResultInProperty: 'Info.DefaultPhone',
                    storeIdInProperty: 'Info.DefaultPhoneID',
                    editor: (value) => {
                        const modal = this.modalService.open(UniPhoneModal, { data: value || {} });
                        return modal.onClose.take(1).toPromise();
                    }
                }
            },
            {
                Property: 'OrgNumber',
                FieldType: FieldType.TEXT,
                Label: 'Organisasjonsnummer',
            },
        ];
    }
}
