import {Component, Input, OnInit, ViewChild, ComponentRef} from '@angular/core';
import {Router, RouteParams, RouterLink} from '@angular/router-deprecated';

import {Observable} from 'rxjs/Observable';

import {SupplierInvoiceService, SupplierService, BankAccountService, JournalEntryService} from '../../../../services/services';

import {UniForm, UniFieldLayout} from '../../../../../framework/uniform/index';
import {UniComponentLoader} from '../../../../../framework/core/componentLoader';
import {FieldType, ComponentLayout, SupplierInvoice, Supplier, BankAccount} from '../../../../unientities';
import {JournalEntryManual} from '../journalentrymanual/journalentrymanual';
import {UniDocumentUploader} from '../../../../../framework/documents/index';
import {SupplierInvoiceFileUploader} from './supplierinvoiceuploader';
import {UniImage, UniImageSize} from '../../../../../framework/uniImage/uniImage';
import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';

@Component({
    selector: 'supplier-invoice-detail',
    templateUrl: 'app/components/accounting/journalentry/supplierinvoices/supplierinvoicedetail.html',
    directives: [UniForm, UniComponentLoader, RouterLink, JournalEntryManual, UniDocumentUploader, UniImage, UniSave],
    providers: [SupplierInvoiceService, SupplierService, BankAccountService, JournalEntryService, SupplierInvoiceFileUploader]
})
export class SupplierInvoiceDetail implements OnInit {
    @Input() private invoiceId: any;
    private supplierInvoice: SupplierInvoice;
    private suppliers: Supplier[];
    private bankAccounts: BankAccount[];

    private previewId: number;
    private previewSize: UniImageSize;

    @ViewChild(UniComponentLoader) private uniCompLoader: UniComponentLoader;
    @ViewChild(JournalEntryManual) private journalEntryManual: JournalEntryManual;
    @ViewChild(UniForm) private form: UniForm;

    config: any = {};
    fields: any[] = [];

    private actions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (done) => this.saveSupplierInvoice(done),
            main: true,
            disabled: false
        },
        {
            label: 'Bokfør',
            action: (done) => this.saveAndBook(done),
            disabled: true
        },
        {
            label: 'Kjør smartbokføring på ny',
            action: (done) => this.saveAndRunSmartBooking(done),
            disabled: true
        }
    ]

    constructor(
        private _supplierInvoiceService: SupplierInvoiceService,
        private _supplierService: SupplierService,
        private _bankAccountService: BankAccountService,
        private _journalEntryService: JournalEntryService,
        private fileuploader: SupplierInvoiceFileUploader,
        private router: Router,
        private _routeParams: RouteParams) {
            
        this.invoiceId = _routeParams.get('id');
        this.previewId = 0;
        this.previewSize = UniImageSize.medium;
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
              
                this.actions[1].disabled = !(this.supplierInvoice && this.supplierInvoice.ID > 0);
                this.actions[1].disabled = !(this.supplierInvoice && this.supplierInvoice.ID > 0);                
            },
            (err) => console.log('Error refreshing view: ', err));
    }
    private getStatusText() {
        return this._supplierInvoiceService.getStatusText((this.supplierInvoice.StatusCode || '').toString());
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

                this.actions[1].disabled = true;
                this.actions[2].disabled = true;

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
                
                this.actions[1].disabled = false;
                this.actions[2].disabled = false;
                
                this.buildForm();
            }, error => console.log(error));
        }
    }

    private save(runSmartBooking: boolean, done) {
        
        if (this.supplierInvoice.ID > 0) {
            
            //save journalentrydata and supplierinvoice - these can be saved separatly here            
            let journalEntryData = this.journalEntryManual.getJournalEntryData(); 
            this._journalEntryService
                .saveJournalEntryData(journalEntryData)
                .subscribe((res) => {                    
                }, 
                (err) => {
                    done('Feilet i lagring av bilagsdata');
                    console.log('error saving journaldata:', err);
                    this.log(err);
                }
            ); 
                        
            this._supplierInvoiceService.Put(this.supplierInvoice.ID, this.supplierInvoice)
                .subscribe((response: any) => {
                    if (runSmartBooking) {
                        this.runSmartBooking(this.supplierInvoice, false, done);
                    } else {
                        done('Lagret');
                        this.router.navigateByUrl('/accounting/journalentry/supplierinvoices/details/' + this.supplierInvoice.ID);
                    }
                },
                (error: Error) => {
                    done('Feilet i lagring');
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
                    this.runSmartBooking(newSupplierInvoice, true, done);
                },
                (error: Error) => {
                    done('Feilet i lagring');
                    console.error('error in SupplierInvoiceDetail.onSubmit - Post: ', error);
                    this.log(error);
                }
            );
        }
    };

    private saveSupplierInvoice(done) {
        this.save(false, done);
    }

    private saveAndRunSmartBooking(done) {
        this.save(true, done);
    }
    
    private saveAndBook(done) {        
        //save and run transition to booking        
        let journalEntryData = this.journalEntryManual.getJournalEntryData();        
        this._journalEntryService
            .saveJournalEntryData(journalEntryData)
            .subscribe((res) => {
                console.log('JournalEntryData saved, saving supplierinvoice...')
                this._supplierInvoiceService.Put(this.supplierInvoice.ID, this.supplierInvoice)
                    .subscribe((res) => {
                        console.log('Supplierinvoice saved, running booking transition...')
                        this._supplierInvoiceService.Transition(this.supplierInvoice.ID, this.supplierInvoice, 'journal')
                            .subscribe((res) => {
                                done("Lagret");
                                console.log('Booking complete - redirect to refresh view');
                                this.router.navigateByUrl('/accounting/journalentry/supplierinvoices/details/' + this.supplierInvoice.ID);
                            },
                            (err) => {
                                done('Overgang feilet');
                                console.log('error running book transition', err);
                                this.log(err);
                            }
                        );
                    },
                    (err) => {
                        done('Feilet i lagring');
                        console.log('error saving supplierinvoice', err);
                        this.log(err);
                    }
                )
            }, 
            (err) => { 
                done('Feilet i lagring av bilagsdata');
                console.log('error saving journaldata:', err);
                this.log(err);
            }
        );      
    }

    private runSmartBooking(supplierInvoice: SupplierInvoice, redirectAfter: boolean, done) {
        
        if (supplierInvoice.ID == 0) {
            done('Smartbokføring kunne ikke kjøres');
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
                        done('Smartbokført');
                        this.refreshFormData(supplierInvoice);
                    }
                },
                (error: any) => {
                    done('Feilet i smartbokføring');
                    console.log('Error running smartbooking', error)
                }       
            );
    }

    private buildForm() {         
        let self = this;         
        this.fileuploader.getSlots(this.supplierInvoice.ID).then((data) => {
            if (data && data.length) {
                self.previewId = data[0].ID;
            } else {
                self.previewId = -1;
            }    
        });
        
        var supplierName = new UniFieldLayout();
        supplierName.FieldSet = 0;
        supplierName.Section = 0;
        supplierName.Combo = 0;
        supplierName.FieldType = 3;
        supplierName.Label = 'Leverandørnavn';
        supplierName.Property = 'SupplierID';
        supplierName.ReadOnly = false;
        supplierName.Options = {                  
            source: this.suppliers,
            template: (data) => `${data.SupplierNumber} - ${data.Info.Name}`,
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 500
        };

        var paymentDueDate = new UniFieldLayout();
        paymentDueDate.FieldSet = 0;
        paymentDueDate.Section = 0;
        paymentDueDate.Combo = 0;
        paymentDueDate.FieldType = 2;
        paymentDueDate.Label = 'Forfallsdato';
        paymentDueDate.Property = 'PaymentDueDate';
        paymentDueDate.ReadOnly = false;
   
        var invoiceDate = new UniFieldLayout();
        invoiceDate.FieldSet = 0;
        invoiceDate.Section = 0;
        invoiceDate.Combo = 0;
        invoiceDate.FieldType = 2;
        invoiceDate.Label = 'Fakturadato';
        invoiceDate.Property = 'InvoiceDate';
        invoiceDate.ReadOnly = false;
        
        var taxInclusiveAmount = new UniFieldLayout();
        taxInclusiveAmount.FieldSet = 0;
        taxInclusiveAmount.Section = 0;
        taxInclusiveAmount.Combo = 0;
        taxInclusiveAmount.FieldType = 6;
        taxInclusiveAmount.Label = 'Beløp';
        taxInclusiveAmount.Property = 'TaxInclusiveAmount';
        taxInclusiveAmount.ReadOnly = false;
        taxInclusiveAmount.Options = {
            step: 1
        };
        
        var invoiceNumber = new UniFieldLayout();
        invoiceNumber.FieldSet = 0;
        invoiceNumber.Section = 0;
        invoiceNumber.Combo = 0;
        invoiceNumber.FieldType = 10;
        invoiceNumber.Label = 'Fakturanr';
        invoiceNumber.Property = 'InvoiceNumber';
        invoiceNumber.ReadOnly = false;
        
        var paymentInformation = new UniFieldLayout();
        paymentInformation.FieldSet = 0;
        paymentInformation.Section = 0;
        paymentInformation.Combo = 0;
        paymentInformation.FieldType = 10;
        paymentInformation.Label = 'Bilagstekst';
        paymentInformation.Property = 'PaymentInformation';
        paymentInformation.ReadOnly = false;        
        
        var bankAccount = new UniFieldLayout();
        bankAccount.FieldSet = 0;
        bankAccount.Section = 0;
        bankAccount.Combo = 0;
        bankAccount.FieldType = 3;
        bankAccount.Label = 'Lev. kontonummer';
        bankAccount.Property = 'BankAccount';
        bankAccount.ReadOnly = false;
        bankAccount.Options = {                  
            source: this.bankAccounts,
            valueProperty: 'AccountNumber',
            displayProperty: 'AccountNumber',
            debounceTime: 500
        };
        
        var paymentID = new UniFieldLayout();
        paymentID.FieldSet = 0;
        paymentID.Section = 0;
        paymentID.Combo = 0;
        paymentID.FieldType = 10;
        paymentID.Label = 'KID';
        paymentID.Property = 'PaymentID';
        paymentID.ReadOnly = false;
        
        self.fields = [supplierName, paymentDueDate, invoiceDate, taxInclusiveAmount, invoiceNumber, paymentInformation,
                       bankAccount, paymentID];
        
        this.config = {            
        };
    }
    
    private onFileUploaded(slot) {
        this.previewId = slot.ID;
    }
    
    private submit(data) {      
    }
    
    private change(data) {
        
    }
    
    private ready(data) {
        
    }
}
