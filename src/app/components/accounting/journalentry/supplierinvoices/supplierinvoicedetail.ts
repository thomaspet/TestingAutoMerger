import {Component, Input, OnInit, ViewChild, ComponentRef} from '@angular/core';
import {Router, RouteParams, RouterLink} from '@angular/router-deprecated';

import { Observable } from 'rxjs/Observable';

import {SupplierInvoiceService, SupplierService, BankAccountService, JournalEntryService} from '../../../../services/services';

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
    providers: [SupplierInvoiceService, SupplierService, BankAccountService, JournalEntryService]
})
export class SupplierInvoiceDetail implements OnInit {
    @Input() private invoiceId: any;
    private supplierInvoice: SupplierInvoice;
    private suppliers: Supplier[];
    private bankAccounts: BankAccount[];

    private formBuilder: UniFormBuilder;
    private formInstance: UniForm;

    @ViewChild(UniComponentLoader) private uniCompLoader: UniComponentLoader;
    @ViewChild(JournalEntryManual) private journalEntryManual: JournalEntryManual;

    private whenFormInstance: Promise<UniForm>;

    constructor(
        private _supplierInvoiceService: SupplierInvoiceService,
        private _supplierService: SupplierService,
        private _bankAccountService: BankAccountService,
        private _journalEntryService: JournalEntryService,
        private router: Router,
        private _routeParams: RouteParams) {
            
        this.invoiceId = _routeParams.get('id');
    }

    public ngOnInit() {
        this.loadFormAndData();
    }
    
    private log(err) {
        alert(err._body);
    }

    private refreshFormData(supplierInvoice: SupplierInvoice) {
        this.invoiceId = supplierInvoice.ID;
        
        this._supplierInvoiceService
            .Get(this.invoiceId, ['JournalEntry', 'Supplier.Info'])
            .subscribe((res) => {
                this.supplierInvoice = res;
                this.formInstance.Model = this.supplierInvoice;
            },
            (err) => console.log('Error refreshing view: ', err));
    }
    private getStatusText() {
        return this._supplierInvoiceService.getStatusText(this.supplierInvoice.StatusCode.toString());
    }
    private loadFormAndData() {
        let id = this.invoiceId;

        if (id == 0) {
            Observable.forkJoin(
                this._supplierInvoiceService.GetNewEntity(),
                this._supplierService.GetAll(null, ['Info']),
                this._bankAccountService.GetAll(null)
            ).subscribe((response: any) => {
                let [invoice, suppliers, bac] = response;
                this.supplierInvoice = invoice;
                this.suppliers = suppliers;
                this.bankAccounts = bac;

                this.buildForm();
            }, error => console.log(error));
        } else {
            Observable.forkJoin(
                this._supplierInvoiceService.Get(id, ['JournalEntry', 'Supplier.Info']),
                this._supplierService.GetAll(null, ['Info']),
                this._bankAccountService.GetAll(null)
            ).subscribe((response: any) => {
                let [invoice, suppliers, bac] = response;
                this.supplierInvoice = invoice;
                this.suppliers = suppliers;
                this.bankAccounts = bac;
                
                this.buildForm();
            }, error => console.log(error));
        }
    }

    private save(runSmartBooking: boolean) {
        
        this.formInstance.sync();  
        if (this.supplierInvoice.ID > 0) {
            
            //save journalentrydata and supplierinvoice - these can be saved separatly here            
            let journalEntryData = this.journalEntryManual.getJournalEntryData(); 
            this._journalEntryService
                .saveJournalEntryData(journalEntryData)
                .subscribe((res) => {                    
                }, 
                (err) => {
                    console.log('error saving journaldata:', err);
                    this.log(err);
                }
            ); 
                        
            this._supplierInvoiceService.Put(this.supplierInvoice.ID, this.supplierInvoice)
                .subscribe((response: any) => {
                    if (runSmartBooking) {
                        this.runSmartBooking(this.supplierInvoice, false);
                    } else {
                        this.router.navigateByUrl('/accounting/journalentry/supplierinvoices/details/' + this.supplierInvoice.ID);
                    }
                },
                (error: Error) => {
                    console.error('error in SupplierInvoiceDetail.onSubmit - Put: ', error);
                    this.log(error);
                }
            );
        } else {
            // Following fields are required. For now hardcoded.
            this.supplierInvoice.CreatedBy = '-';
            this.supplierInvoice.CurrencyCode = 'NOK';

            this._supplierInvoiceService.Post(this.supplierInvoice)
                .subscribe((result: SupplierInvoice) => {
                    let newSupplierInvoice = result;
                    
                    //always run smartbooking for new supplier invoices, ignore input parameter
                    this.runSmartBooking(newSupplierInvoice, true);
                },
                (error: Error) => {
                    console.error('error in SupplierInvoiceDetail.onSubmit - Post: ', error);
                    this.log(error);
                }
            );
        }
    };

    private saveSupplierInvoice() {
        this.save(false);
    }

    private saveAndRunSmartBooking() {
        this.save(true);
    }
    
    private saveAndBook() {        
        //save and run transition to booking        
        let journalEntryData = this.journalEntryManual.getJournalEntryData();        
        this._journalEntryService
            .saveJournalEntryData(journalEntryData)
            .subscribe((res) => {
                console.log('JournalEntryData saved, saving supplierinvoice...')
                this.formInstance.sync();  
                this._supplierInvoiceService.Put(this.supplierInvoice.ID, this.supplierInvoice)
                    .subscribe((res) => {
                        console.log('Supplierinvoice saved, running booking transition...')
                        this._supplierInvoiceService.Transition(this.supplierInvoice.ID, this.supplierInvoice, 'journal')
                            .subscribe((res) => {
                                console.log('Booking complete - redirect to refresh view');
                                this.router.navigateByUrl('/accounting/journalentry/supplierinvoices/details/' + this.supplierInvoice.ID);
                            },
                            (err) => {
                                console.log('error running book transition', err);
                                this.log(err);
                            }
                        );
                    },
                    (err) => {
                        console.log('error saving supplierinvoice', err);
                        this.log(err);
                    }
                )
            }, 
            (err) => { 
                console.log('error saving journaldata:', err);
                this.log(err);
            }
        );      
    }

    private runSmartBooking(supplierInvoice: SupplierInvoice, redirectAfter: boolean) {
        
        if (supplierInvoice.ID == 0) {
            console.error('Smart booking can not be performed since SupplierInvoice.ID is null');
            return;
        }
        
        this._supplierInvoiceService.Action(supplierInvoice.ID, 'smartbooking')
            .subscribe(
                (response: any) => {
                    if (redirectAfter) {
                        this.router.navigateByUrl('/accounting/journalentry/supplierinvoices/details/' + supplierInvoice.ID);        
                    }
                    else {
                        this.refreshFormData(supplierInvoice);
                    }
                },
                (error: any) => console.log('Error running smartbooking', error)       
            );
    }

    private buildForm() {        
        // TODO get it from the API and move these to backend migrations   
        // TODO set to 'ComponentLayout' when the object respects the interface
        var view: any = {
            Name: 'SupplierInvoiceDetail',
            BaseEntity: 'SupplierInvoice',
            StatusCode: 0,
            Deleted: false,
            CreatedAt: null,
            UpdatedAt: null,
            CreatedBy: null,
            UpdatedBy: null,
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
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
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
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
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
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 3,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
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
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
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
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
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
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
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
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
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
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
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
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
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
