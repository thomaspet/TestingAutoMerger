import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {IUniModal, IModalOptions, UniModalService, UniEmailModal, UniPhoneModal, UniAddressModal} from '@uni-framework/uni-modal';
import {Supplier, FieldType, Address, BusinessRelation, Phone, Email, NumberSeries} from '@uni-entities';
import {SupplierService, ErrorService, AddressService, IntegrationServerCaller, NumberSeriesService} from '@app/services/services';
import {BehaviorSubject} from 'rxjs';
import {AutocompleteOptions, Autocomplete} from '@uni-framework/ui/autocomplete/autocomplete';
import {UniForm} from '@uni-framework/ui/uniform';

@Component({
    templateUrl: './edit-supplier-modal.html',
    styleUrls: ['./edit-supplier-modal.sass']
})
export class SupplierEditModal implements IUniModal {
    @ViewChild(UniForm, { static: true }) form: UniForm;
    @ViewChild(Autocomplete) autocomplete: Autocomplete;

    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    busy: boolean;
    value: string = '';
    isNewSupplier: boolean;

    supplier$ = new BehaviorSubject<Supplier>(null);
    fields$ = new BehaviorSubject([]);
    config$ = new BehaviorSubject({});

    numberSeries: NumberSeries[];

    isDirty: boolean;
    externalLookupOptions: AutocompleteOptions;

    constructor(
        private modalService: UniModalService,
        private errorService: ErrorService,
        private supplierService: SupplierService,
        private addressService: AddressService,
        private integrationServerCaller: IntegrationServerCaller,
        private numberSeriesService: NumberSeriesService,
    ) {}

    ngOnInit() {
        const supplier = this.options.data;
        this.isNewSupplier = !!supplier;
        if (supplier) {
            this.supplier$.next(supplier);
            this.config$.next({autofocus: true});
            this.initNumberSeries();
        } else {
            this.value = this.options.listkey;
            this.initNewSupplier(this.options.listkey);
        }
    }

    ngOnDestroy() {
        this.supplier$.complete();
        this.fields$.complete();
        this.config$.complete();
    }

    initNewSupplier(searchValue?: string) {
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
                { label: 'Privatpersoner', value: false }
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

        this.supplierService.GetNewEntity(
            ['Info.Phones', 'Info.Addresses', 'Info.Emails']
        ).subscribe(
            res =>  {
                res.Info.Name = searchValue || '';
                this.supplier$.next(res);
                this.initNumberSeries();
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    initNumberSeries() {
        this.busy = true;
        this.numberSeriesService.GetAll(
            `filter=NumberSeriesType.Name eq 'Supplier Account number series'
            and Empty eq false and Disabled eq false`,
            ['NumberSeriesType']
        ).subscribe(response => {
            this.numberSeries = this.numberSeriesService.CreateAndSet_DisplayNameAttributeOnSeries(response);
            const numberSerie = this.numberSeries.find(x => x.Name === 'Supplier number series');
            if (numberSerie) {
                this.numberSeriesChange(numberSerie);
            }
            
            this.fields$.next(this.getFormFields());
            if (this.numberSeries.length > 1) {
                const fields = this.fields$.getValue();
                fields.push({
                    Property: 'SubAccountNumberSeriesID',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Nummerserie',
                    Options: {
                        source: this.numberSeries,
                        valueProperty: 'ID',
                        displayProperty: 'DisplayName',
                        debounceTime: 200
                    }
                });
                this.fields$.next(fields);
            }
            this.busy = false;
        },
        err => {
            this.errorService.handle(err);
            this.busy = false;
        });
    }

    numberSeriesChange(selectedSerie) {
        const supplier = this.supplier$.getValue();
        supplier.SubAccountNumberSeriesID = selectedSerie.ID;
        this.supplier$.next(supplier);
    }

    onExternalSearchSelected(item) {
        if (!item) {
            return;
        }

        const supplier = this.supplier$.value;

        supplier.OrgNumber = item.OrganizationNumber;
        supplier.WebUrl = item.Url;
        supplier.Info = <BusinessRelation> { Name: item.Name };

        if (item.Streetaddress || item.PostCode || item.City) {
            const address = <Address> {
                AddressLine1: item.Streetaddress,
                PostalCode: item.PostCode,
                City: item.City,
                _createguid: this.supplierService.getNewGuid()
            };

            supplier.Info.Addresses = [address];
            supplier.Info.InvoiceAddress = address;
            supplier.Info.ShippingAddress = address;
        }

        if (item.Phone) {
            const phone = <Phone> {
                Number: item.Phone,
                _createguid: this.supplierService.getNewGuid()
            };

            supplier.Info.Phones = [phone];
            supplier.Info.DefaultPhone = phone;
        }

        if (item.EmailAddress) {
            const email = <Email> {
                EmailAddress: item.EmailAddress,
                _createguid: this.supplierService.getNewGuid()
            };

            supplier.Info.Emails = [email];
            supplier.Info.DefaultEmail = email;
        }

        this.isDirty = true;
        this.supplier$.next(supplier);
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
        const supplier = this.supplier$.value;
        supplier.Info.Addresses = supplier.Info.Addresses && supplier.Info.Addresses.filter(address => {
            return address.ID || address._createguid !== supplier.Info.InvoiceAddress._createguid;
        });

        supplier.Info.Phones = supplier.Info.Phones && supplier.Info.Phones.filter(phone => {
            return phone.ID || phone._createguid !== supplier.Info.DefaultPhone._createguid;
        });

        supplier.Info.Emails = supplier.Info.Emails && supplier.Info.Emails.filter(email => {
            return email.ID || email._createguid !== supplier.Info.DefaultEmail._createguid;
        });

        const query = supplier.ID ? this.supplierService.Put(supplier.ID, supplier) : this.supplierService.Post(supplier);

        this.busy = true;
        query.subscribe(
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
