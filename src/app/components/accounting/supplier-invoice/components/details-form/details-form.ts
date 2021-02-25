import { Component, ElementRef } from '@angular/core';
import { SupplierInvoiceStore } from '../../supplier-invoice-store';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SupplierInvoice, BankAccount } from '@uni-entities';
import { FieldType } from '@uni-framework/ui/uniform';
import { UniModalService, UniBankAccountModal } from '@uni-framework/uni-modal';
import { SupplierEditModal } from '@app/components/common/modals/edit-supplier-modal/edit-supplier-modal';
import { StatisticsService, SupplierService, BankAccountService, ErrorService, NumberFormat } from '@app/services/services';
import { trigger, transition, animate, style, state, group } from '@angular/animations';

@Component({
    selector: 'details-form',
    templateUrl: './details-form.html',
    styleUrls: ['./details-form.sass'],
    animations: [
        trigger('slideInOut', [
            state('in', style({
                'max-height': '500px', 'opacity': '1', 'visibility': 'visible'
            })),
            state('out', style({
                'max-height': '0px', 'opacity': '0', 'visibility': 'hidden'
            })),
            transition('in => out', [group([
                animate('400ms ease-in-out', style({
                    'opacity': '0'
                })),
                animate('600ms ease-in-out', style({
                    'max-height': '0px'
                })),
                animate('700ms ease-in-out', style({
                    'visibility': 'hidden'
                }))
            ]
            )]),
            transition('out => in', [group([
                animate('1ms ease-in-out', style({
                    'visibility': 'visible'
                })),
                animate('600ms ease-in-out', style({
                    'max-height': '500px'
                })),
                animate('800ms ease-in-out', style({
                    'opacity': '1'
                }))
            ]
            )])
        ])
      ]
})
export class DetailsForm {

    supplierExpands: Array<string> = ['Info', 'Info.BankAccounts', 'Info.DefaultBankAccount', 'Dimensions.Info'];
    onDestroy$ = new Subject();
    supplierInvoice$ = new BehaviorSubject<SupplierInvoice>(null);
    fields$ = new BehaviorSubject<any[]>([]);
    addOnfields$ = new BehaviorSubject<any[]>([]);
    autocompleteOptions: any;
    accounts = [];
    openExtraFields = false;
    readonly = false;
    orgNumber: string;
    animationState = 'out';

    constructor(
        public elementRef: ElementRef, // used by supplier-invoice.ts
        private store: SupplierInvoiceStore,
        private modalService: UniModalService,
        private statisticsService: StatisticsService,
        private supplierService: SupplierService,
        private bankAccountService: BankAccountService,
        private errorService: ErrorService,
        private numberFormat: NumberFormat,
    ) {
        this.store.invoice$
            .pipe(takeUntil(this.onDestroy$))
            .subscribe(invoice => this.supplierInvoice$.next(invoice));

        // Update form config when readonly changes!
        this.store.readonly$.pipe(
            takeUntil(this.onDestroy$)
        ).subscribe(readonly => {
            this.readonly = readonly;
            this.fields$.next(this.getFields());
            this.addOnfields$.next(this.getAddOnFields());
        });

        this.autocompleteOptions = {
            placeholder: 'Velg leverandør',
            autofocus: true,
            canClearValue: false,
            lookup: query => this.supplierLookup(query),
            displayFunction: item => {
                if (item) {
                    const name = item.Info ? item.Info.Name : item.Name;
                    return item.SupplierNumber ? `${item.SupplierNumber} - ${name}` : name;
                }

                return '';
            },
            resultTableColumns: [
                { header: 'Leverandørnr', field: 'SupplierNumber' },
                { header: 'Navn', field: 'Name' },
                { header: 'Adresse', field: 'AddressLine1' },
                {
                    header: 'Poststed',
                    template: item => {
                        if (item.PostalCode || item.City) {
                            return `${item.PostalCode} - ${item.City}`;
                        }
                    }
                },
                { header: 'Orgnummer', field: 'OrgNumber' },
            ],
            createLabel: 'Opprett ny leverandør',
            createHandler: (value) => {
                return this.modalService.open(SupplierEditModal, {listkey: !!value.trim() ? value : '' }).onClose;
            }
        };

        this.fields$.next(this.getFields());
        this.addOnfields$.next(this.getAddOnFields());
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
        this.supplierInvoice$.complete();
        this.fields$.complete();
        this.addOnfields$.complete();
    }

    onFormChange(event) {
        const changedField = event && Object.keys(event) && Object.keys(event)[0];
        this.store.onInvoiceChange(changedField, event);
    }

    newSupplierSelected(supplier) {
        if (supplier) {
            this.supplierService.Get(supplier.ID, this.supplierExpands).subscribe(
                s => this.store.setSupplier(s).then(invoice => {
                    this.supplierInvoice$.next(invoice);
                    this.store.onInvoiceChange('Supplier');
                }),
                err => this.errorService.handle(err));
        }
    }

    toggleAddOnFields() {
        this.openExtraFields = !this.openExtraFields;
        this.animationState = this.openExtraFields ? 'in' : 'out';
    }

    supplierLookup(query: string) {
        const expand = 'Info.DefaultPhone,Info.InvoiceAddress';
        const select = [
            'Supplier.ID as ID',
            'Info.Name as Name',
            'Supplier.OrgNumber as OrgNumber',
            'InvoiceAddress.AddressLine1 as AddressLine1',
            'InvoiceAddress.PostalCode as PostalCode',
            'InvoiceAddress.City as City',
            'Supplier.SupplierNumber as SupplierNumber',
            'Supplier.StatusCode as StatusCode',
        ].join(',');

        let filter = `(Supplier.Statuscode eq 30001)`;

        if (query && query.length) {
            const queryFilter = ['Supplier.OrgNumber', 'Supplier.SupplierNumber', 'Info.Name']
                .map(field => `contains(${field},'${query}')`)
                .join(' or ');

            filter += ` and ( ${queryFilter} )`;
        }

        const odata = `model=Supplier`
            + `&expand=${expand}`
            + `&select=${select}`
            + `&filter=${filter}`
            + `&orderby=Info.Name&top=50&distinct=true`;

        return this.statisticsService.GetAllUnwrapped(odata);
    }

    getFields() {
        return [
            {
                Property: 'BankAccountID',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Betal til bankkonto',
                Options: {
                    entity: BankAccount,
                    listProperty: 'Supplier.Info.BankAccounts',
                    // displayValue: 'AccountNumber',
                    template: field => this.numberFormat.asBankAcct(field),
                    linkProperty: 'ID',
                    storeResultInProperty: 'BankAccount',
                    storeIdInProperty: 'BankAccountID',
                    editor: (bankAccount: BankAccount) => new Promise((resolve, reject) => {
                        const invoice: SupplierInvoice = this.supplierInvoice$.getValue();
                        if (!bankAccount.ID) {
                            bankAccount['_createguid'] = this.bankAccountService.getNewGuid();
                            bankAccount.BankAccountType = 'supplier';
                            bankAccount.BusinessRelationID = invoice.Supplier
                                ? invoice.Supplier.BusinessRelationID
                                : null;

                            bankAccount.ID = 0;
                        }

                        const modal = this.modalService.open(UniBankAccountModal, {
                            data: bankAccount
                        });

                        modal.onClose.subscribe(account => {
                            if (!account) {
                                reject();
                                return;
                            }

                            const request = account.ID > 0
                                ? this.bankAccountService.Put(account.ID, account)
                                : this.bankAccountService.Post(account);

                            request.subscribe(
                                res => resolve(res),
                                err => {
                                    this.errorService.handle(err);
                                    reject();
                                }
                            );
                        });
                    }),
                    display: (bankAccount: BankAccount) => {
                        let ret = bankAccount.AccountNumber ? (bankAccount.AccountNumber.substr(0, 4) + ' '
                        + bankAccount.AccountNumber.substr(4, 2) + ' ' + bankAccount.AccountNumber.substr(6)) : '';
                        if (bankAccount['Label']) {
                            ret = bankAccount['Label'] + '-' + ret;
                        }
                        return ret;
                    }
                }
            },
            {
                EntityType: 'SupplierInvoice',
                Property: 'InvoiceDate',
                Label: 'Fakturadato',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Classes: 'bill-small-field',
                ReadOnly: this.readonly,
                Options: {
                    useSmartYear: true,
                    useFinancialYear: true
                }
            },
            {
                EntityType: 'SupplierInvoice',
                Property: 'PaymentDueDate',
                Label: 'Forfallsdato',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Classes: 'bill-small-field',
                Options: {
                    useSmartYear: true,
                    useFinancialYear: true
                }
            },
            {
                EntityType: 'SupplierInvoice',
                Property: 'InvoiceNumber',
                Label: 'Fakturanummer',
                FieldType: FieldType.TEXT,
                Classes: 'bill-small-field',
                ReadOnly: this.readonly,
            },
            {
                EntityType: 'SupplierInvoice',
                Property: 'TaxInclusiveAmountCurrency',
                Label: 'Sum',
                FieldType: FieldType.NUMERIC,
                Classes: 'bill-small-field',
                ReadOnly: this.readonly,
                Options: {
                    format: 'money',
                    decimalSeparator: ','
                }
            },
            {
                EntityType: 'SupplierInvoice',
                Property: 'PaymentID',
                Label: 'KID/Melding',
                FieldType: FieldType.TEXT,
                Tooltip: {
                    Text: 'Skriv inn KID-nummer eller melding til mottaker. Dersom feltet inneholder tekst vil det tolkes som en melding.',
                }
            }
        ];
    }

    getAddOnFields() {
        return [
            {
                EntityType: 'SupplierInvoice',
                Property: 'FreeTxt',
                Label: 'Fritekst',
                FieldType: FieldType.TEXTAREA
            },
            {
                Property: 'DefaultDimensions.ProjectID',
                FieldType: FieldType.UNI_SEARCH,
                Label: 'Prosjekt',
                Options: {
                    uniSearchConfig: this.store.getDimensionsConfig(1),
                    valueProperty: 'ID'
                }
            },
            {
                Property: 'DefaultDimensions.DepartmentID',
                FieldType: FieldType.UNI_SEARCH,
                Label: 'Avdeling',
                Options: {
                    uniSearchConfig: this.store.getDimensionsConfig(2),
                    valueProperty: 'ID'
                }
            },
        ];
    }
}
