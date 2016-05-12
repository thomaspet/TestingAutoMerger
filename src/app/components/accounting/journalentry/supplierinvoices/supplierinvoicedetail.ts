import {Component, Input, OnInit, ViewChild, ComponentRef} from '@angular/core';
import {Router, RouteParams, RouterLink} from '@angular/router-deprecated';

import { Observable } from 'rxjs/Observable';

import {SupplierInvoiceService, SupplierService, BankAccountService} from '../../../../services/services';

import {UniForm} from '../../../../../framework/forms/uniForm';
import {UniFormBuilder, UniFormLayoutBuilder} from '../../../../../framework/forms';
import {UniFieldBuilder} from '../../../../../framework/forms';
import {UniComponentLoader} from '../../../../../framework/core/componentLoader';
import {FieldType, ComponentLayout} from '../../../../unientities';
import {SupplierInvoice, Supplier, BankAccount} from '../../../../unientities';
import {JournalEntryManual} from '../journalentrymanual/journalentrymanual';

@Component({
    selector: 'supplier-invoice-detail',
    templateUrl: 'app/components/accounting/journalentry/supplierinvoices/supplierinvoicedetail.html',
    directives: [UniForm, UniComponentLoader, RouterLink, JournalEntryManual],
    providers: [SupplierInvoiceService, SupplierService, BankAccountService]
})
export class SupplierInvoiceDetail implements OnInit {
    @Input() private invoiceId: any;
    private supplierInvoice: SupplierInvoice;
    private suppliers: Supplier[];
    private bankAccounts: BankAccount[];

    private formBuilder: UniFormBuilder;
    private formInstance: UniForm;

    @ViewChild(UniComponentLoader) private uniCompLoader: UniComponentLoader;

    private whenFormInstance: Promise<UniForm>;

    constructor(
        private _supplierInvoiceService: SupplierInvoiceService,
        private _supplierService: SupplierService,
        private _bankAccountService: BankAccountService,
        private router: Router,
        private _routeParams: RouteParams) {
            
        this.invoiceId = _routeParams.get('id');
    }

    public ngOnInit() {
        var self = this;

        let id = this.invoiceId;

        if (id == 0) {
            Observable.forkJoin(
                self._supplierInvoiceService.GetNewEntity(),
                self._supplierService.GetAll(null, ['Info']),
                self._bankAccountService.GetAll(null)
            ).subscribe((response: any) => {
                let [invoice, suppliers, bac] = response;
                self.supplierInvoice = invoice;
                self.suppliers = suppliers;
                self.bankAccounts = bac;

                self.buildForm();
            }, error => console.log(error));
        } else {
            Observable.forkJoin(
                self._supplierInvoiceService.Get(id, ['JournalEntry', 'Supplier.Info']),
                self._supplierService.GetAll(null, ['Info']),
                self._bankAccountService.GetAll(null)
            ).subscribe((response: any) => {
                let [invoice, suppliers, bac] = response;
                self.supplierInvoice = invoice;
                self.suppliers = suppliers;
                self.bankAccounts = bac;

                self.buildForm();
            }, error => console.log(error));
        }
    }

    private save() {
        var self = this;
        this.formInstance.sync();  
        if (self.supplierInvoice.ID > 0) {
            if (self.supplierInvoice.SupplierID !== 0) {
                self.supplierInvoice.Supplier = null; // Needs to do this to avoid conflict between Supplier and SupplierID
            }
            self._supplierInvoiceService.Put(self.supplierInvoice.ID, self.supplierInvoice)
                .subscribe((response: any) => {
                    //if (self.supplierInvoice.JournalEntryID === null || self.supplierInvoice.JournalEntryID === 0) {
                    //    self.smartBooking(false);
                    //} else {
                    //
                    //}
                    
                    self.router.navigateByUrl('/accounting/journalentry/supplierinvoices/details/' + self.supplierInvoice.ID);
                },
                (error: Error) => console.error('error in SupplierInvoiceDetail.onSubmit - Put: ', error));
        } else {
            // Following fields are required. For now hardcoded.
            self.supplierInvoice.CreatedBy = '-';
            self.supplierInvoice.CurrencyCode = 'NOK';

            self._supplierInvoiceService.Post(self.supplierInvoice)
                .subscribe((result: SupplierInvoice) => {
                    let newSupplierInvoice = result;
                    //self.smartBooking(true);
                    
                    self.router.navigateByUrl('/accounting/journalentry/supplierinvoices/details/' + newSupplierInvoice.ID);
                },
                (error: Error) => console.error('error in SupplierInvoiceDetail.onSubmit - Post: ', error));
        }
    };

    // On hold
    // onSmartBook() {
    //    this.smartBooking(this, false);
    // }


    private book() {
        
        //save and run transition to booking
        
    }

    private smartbook() {
        var self = this;

        if (self.supplierInvoice.ID === null) {
            console.error('Smart booking can not be performed since SupplierInvoice.ID is null');
            return;
        }
        self._supplierInvoiceService.Action(self.supplierInvoice.ID, 'smartbooking')
            .subscribe(
            (response: any) => {
                self.router.navigateByUrl('/accounting/journalentry/supplierinvoices/');
                // alert(JSON.stringify(response));
            },
            (error: any) => console.log(error)
            );

    }

    private buildForm() {        
        // TODO get it from the API and move these to backend migrations   
        var view: ComponentLayout = {
            Name: 'SupplierInvoiceDetail',
            BaseEntity: 'SupplierInvoice',
            StatusCode: 0,
            Deleted: false,
            ID: 1,
            CustomFields: null,
            Fields: [     
                {
                    ComponentLayoutID: 2,
                    EntityType: 'SupplierInvoice',
                    Property: 'SupplierID',
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Leverandørnavn',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Legend: '',
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 2,
                    EntityType: 'SupplierInvoice',
                    Property: 'PaymentDueDate',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Forfallsdato',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Legend: '',
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 2,
                    EntityType: 'SupplierInvoice',
                    Property: 'InvoiceDate',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fakturadato',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Legend: '',
                    StatusCode: 0,
                    ID: 3,
                    Deleted: false,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 2,
                    EntityType: 'SupplierInvoice',
                    Property: 'TaxInclusiveAmount',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Beløp',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Legend: '',
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 2,
                    EntityType: 'SupplierInvoice',
                    Property: 'InvoiceID',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fakturanr',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Legend: '',
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 2,
                    EntityType: 'SupplierInvoice',
                    Property: 'PaymentInformation',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Bilagstekst',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Legend: '',
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 2,
                    EntityType: 'SupplierInvoice',
                    Property: 'BankAccount',
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Lev. kontonummer',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Legend: '',
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 2,
                    EntityType: 'SupplierInvoice',
                    Property: 'PaymentID',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'KID',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Legend: '',
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 2,
                    EntityType: 'SupplierInvoice',
                    Property: 'PaymentInformation',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Betalingsinformasjon',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Legend: '',
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CustomFields: null
                }
            ]
        };

        this.formBuilder = new UniFormLayoutBuilder().build(view, this.supplierInvoice);
        this.formBuilder.hideSubmitButton();
        this.extendFormConfig();
        this.loadForm();
    }

    private extendFormConfig() {
        var fieldSupplierName: UniFieldBuilder = this.formBuilder.find('SupplierID');
        fieldSupplierName.setKendoOptions({
            dataTextField: 'Info.Name',
            dataValueField: 'ID',
            template: '${data.SupplierNumber} - ${data.Info.Name}',
            dataSource: this.suppliers
        });

        var fieldBank: UniFieldBuilder = this.formBuilder.find('BankAccount');
        fieldBank.setKendoOptions({
            dataTextField: 'AccountNumber',
            dataValueField: 'AccountNumber',
            dataSource: this.bankAccounts
        });
    }

    private loadForm() {
        var self = this;
        return this.uniCompLoader.load(UniForm).then((cmp: ComponentRef<any>) => {
            cmp.instance.config = self.formBuilder;
            //TODO: KE - usikker på om noe mer må gjøres her..
            //cmp.instance.submit.subscribe(self.onSubmit.bind(self));
            
            self.whenFormInstance = new Promise((resolve: Function) => resolve(cmp.instance));
            setTimeout(() => {
                self.formInstance = cmp.instance;
            });
        });
    }
}
