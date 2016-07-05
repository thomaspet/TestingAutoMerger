import {Component, Input, OnInit, ViewChild, ComponentRef} from '@angular/core';
import {Router, RouteParams, RouterLink} from '@angular/router-deprecated';

import {Observable} from 'rxjs/Observable';

import {SupplierInvoiceService, SupplierService, BankAccountService, JournalEntryService} from '../../../../services/services';

import {UniForm, UniFieldLayout} from '../../../../../framework/uniform/index';
import {UniComponentLoader} from '../../../../../framework/core/componentLoader';
import {JournalEntryData} from '../../../..//models/models';
import {FieldType, ComponentLayout, SupplierInvoice, Supplier, BankAccount, StatusCodeSupplierInvoice} from '../../../../unientities';
import {JournalEntryManual} from '../journalentrymanual/journalentrymanual';
import {UniDocumentUploader} from '../../../../../framework/documents/index';
import {SupplierInvoiceFileUploader} from './supplierinvoiceuploader';
import {UniImage, UniImageSize} from '../../../../../framework/uniImage/uniImage';
import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {InvoicePaymentData} from '../../../../models/sales/InvoicePaymentData';
import {RegisterPaymentModal} from '../../../common/modals/registerPaymentModal';
import {TabService} from '../../../layout/navbar/tabstrip/tabService';

declare var moment;

@Component({
    selector: 'supplier-invoice-detail',
    templateUrl: 'app/components/accounting/journalentry/supplierinvoices/supplierinvoicedetail.html',
    directives: [UniForm, UniComponentLoader, RouterLink, JournalEntryManual, UniDocumentUploader, UniImage, UniSave, RegisterPaymentModal],
    providers: [SupplierInvoiceService, SupplierService, BankAccountService, JournalEntryService, SupplierInvoiceFileUploader]
})
export class SupplierInvoiceDetail implements OnInit {
    @Input() private invoiceId: any;
    private supplierInvoice: SupplierInvoice;
    private suppliers: Supplier[];
    private bankAccounts: BankAccount[];
    private errors;
    private disabled: boolean = false;

    private previewId: number;
    private previewSize: UniImageSize;

    @ViewChild(UniComponentLoader) private uniCompLoader: UniComponentLoader;
    @ViewChild(JournalEntryManual) private journalEntryManual: JournalEntryManual;
    @ViewChild(UniForm) private form: UniForm;
    @ViewChild(RegisterPaymentModal) private registerPaymentModal: RegisterPaymentModal;

    public config: any = {};
    public fields: any[] = [];

    private actions: IUniSaveAction[];

    constructor(
        private _supplierInvoiceService: SupplierInvoiceService,
        private _supplierService: SupplierService,
        private _bankAccountService: BankAccountService,
        private _journalEntryService: JournalEntryService,
        private fileuploader: SupplierInvoiceFileUploader,
        private router: Router,
        private _routeParams: RouteParams,
        private tabService: TabService) {

        this.invoiceId = _routeParams.get('id');
        this.previewId = 0;
        this.previewSize = UniImageSize.medium;
    }

    private setError(error) {
        console.log("== ERROR ==", error);
        var messages = error._body ? JSON.parse(error._body) : error;
        if (messages) {
            this.errors = messages.Messages ? messages.Messages : [messages];
            setInterval(() => {
                this.errors = null;
            }, 5000);
        }
    }

    public ngOnInit() {
        this.loadFormAndData();
    }

    private refreshFormData(supplierInvoice: SupplierInvoice) {
        this.invoiceId = supplierInvoice.ID;

        this._supplierInvoiceService
            .Get(this.invoiceId, ['JournalEntry', 'Supplier.Info'])
            .subscribe((res) => {
                this.supplierInvoice = res;
                //this.setActionsDisabled();
                this.updateSaveActions();
                this.setPreviewId();
                this.setTabTitle();
                // call ready to set readonly fields if needed
                this.ready(null);
            },
            (error) => {
                this.setError(error);
            }
            );
    }
    
    private setTabTitle() {
        let tabTitle = this.supplierInvoice.InvoiceNumber ? 'Leverandørfakturanr ' + this.supplierInvoice.InvoiceNumber : 'Leverandørfaktura (kladd)'; 
        this.tabService.addTab({ url: '/accounting/journalentry/supplierinvoices/details/' + this.invoiceId, name: tabTitle, active: true, moduleID: 7 });        
    }
    
    
    private getStatusText() {
        return this._supplierInvoiceService.getStatusText((this.supplierInvoice.StatusCode || '').toString());
    }
    private loadFormAndData() {
        Observable.forkJoin(
            this._supplierInvoiceService.Get(this.invoiceId, ['JournalEntry', 'Supplier.Info']),
            this._supplierService.GetAll(null, ['Info']),
            this._bankAccountService.GetAll(null)
        ).subscribe((response: any) => {
            let [invoice, suppliers, bac] = response;
            this.supplierInvoice = invoice;
            this.suppliers = suppliers;
            this.bankAccounts = bac;

            // add blank to dropdown
            this.suppliers.unshift(null);

            this.updateSaveActions();
            this.setPreviewId();
            this.setTabTitle();

            this.buildForm();
        }, (error) => {
            this.setError(error);
        });
    }

    private updateSaveActions() {
        this.actions = [];

        this.actions.push({
            label: 'Lagre',
            action: (done) => this.saveSupplierInvoice(done),
            main: true,
            disabled: (this.supplierInvoice.StatusCode !== StatusCodeSupplierInvoice.Draft)
        });

        this.actions.push({
            label: 'Bokfør',
            action: (done) => this.saveAndBook(done),
            disabled: this.IsJournalActionDisabled()
        });

        this.actions.push({
            label: 'Kjør smartbokføring på ny',
            action: (done) => this.saveAndRunSmartBooking(done),
            disabled: (this.supplierInvoice.StatusCode !== StatusCodeSupplierInvoice.Draft)
        });

        this.actions.push({
            label: 'Registrer betaling',
            action: (done) => this.payInvoice(done),
            disabled: this.IsRegisterPaymentActionDisabled()
        });
    }

    private IsJournalActionDisabled() {
        if (this.supplierInvoice.StatusCode === StatusCodeSupplierInvoice.Draft){
            return false;
        }
        return true;
    }
    private IsRegisterPaymentActionDisabled() {
        if (this.supplierInvoice.StatusCode === StatusCodeSupplierInvoice.Journaled ||
            this.supplierInvoice.StatusCode === StatusCodeSupplierInvoice.ToPayment ||
            this.supplierInvoice.StatusCode === StatusCodeSupplierInvoice.PartlyPayed){
            return false;
        }
        return true;
    }

    private saveSupplierInvoiceTransition(done: any, transition: string, doneText: string) {
        this._supplierInvoiceService.Transition(this.supplierInvoice.ID, this.supplierInvoice, transition).subscribe(() => {
            console.log('== TRANSITION OK ' + transition + ' ==');
            this.refreshFormData(this.supplierInvoice);
            done(doneText);
        });
    }

    private payInvoice(done: any) {
        if (this.supplierInvoice.StatusCode === StatusCodeSupplierInvoice.Journaled) {
            this._supplierInvoiceService.Transition(this.supplierInvoice.ID, this.supplierInvoice, 'sendForPayment').subscribe(() => {
                console.log('== TRANSITION OK sendForPayment ==');
                this.registerPayment(done)
                done('Betalt');
            },
                (error) => {
                    this.setError(error);
                    done('Lagring feilet');
                });
        }
        else {
            this.registerPayment(done)
            done('Betalt');
        }
    }

   

    private save(runSmartBooking: boolean, done) {
        if (!this.supplierInvoice.SupplierID) {
            this.setError({Message: 'Leverandør må være fyllt ut.'});
            done('Ikke lagret');
            return;
        }
        
        if ((this.supplierInvoice.PaymentID || '').trim().length == 0 && (this.supplierInvoice.PaymentInformation || '').trim().length == 0) {
            this.setError({Message: 'KID eller melding må være fyllt ut.'});
            done('Ikke lagret');
            return;
        }

        if (!!this.supplierInvoice.JournalEntryID) {
            let journalEntryData = this.journalEntryManual.getJournalEntryData();

            Observable.forkJoin(
                this._journalEntryService.saveJournalEntryData(journalEntryData),
                this._supplierInvoiceService.Put(this.supplierInvoice.ID, this.supplierInvoice)
            ).subscribe((response: any) => {
                if (runSmartBooking) {
                    this.runSmartBooking(this.supplierInvoice, done);
                } else {
                    let lines = response[0];
                    lines.forEach((line) => {
                        line.FinancialDate = moment(line.FinancialDate).toDate();
                    });

                    this.journalEntryManual.setJournalEntryData(lines);
                    this.refreshFormData(this.supplierInvoice);
                    done('Lagret');
                }
            }, (error) => {
                this.setError(error);
                done('Lagring feilet');
            });
        } else {
            this._supplierInvoiceService.Put(this.supplierInvoice.ID, this.supplierInvoice)
                .subscribe((result: SupplierInvoice) => {
                    //always run smartbooking for new supplier invoices, ignore input parameter
                    this.runSmartBooking(this.supplierInvoice, done);
                },
                (error) => {
                    this.setError(error);
                    done('Lagring feilet');
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
        // save and run transition to booking        
        let journalEntryData = this.journalEntryManual.getJournalEntryData();

        // set date today if date is default value / empty
        journalEntryData.forEach((line) => {
            if (!line.FinancialDate || line.FinancialDate.toISOString() == '0001-01-01T00:00:00.000Z') {
                line.FinancialDate = new Date();
            }
        });

        this._journalEntryService
            .saveJournalEntryData(journalEntryData)
            .subscribe((newJournalEntryData: Array<JournalEntryData>) => {                
                newJournalEntryData.forEach((line: JournalEntryData) => {
                    line.FinancialDate = moment(line.FinancialDate).toDate();
                });
                this.journalEntryManual.setJournalEntryData(newJournalEntryData);
                
                this._supplierInvoiceService.Put(this.supplierInvoice.ID, this.supplierInvoice)
                    .subscribe((res) => {
                        let sum = newJournalEntryData
                                    .filter(line => line.CreditAccountID != null)
                                    .map((line) => line.Amount)
                                    .reduce((a, b) => {
                                        return (a > 0 ? a : 0) + (b > 0 ? b : 0)
                                    });
                                    
                        if (sum !== this.supplierInvoice.TaxInclusiveAmount) {
                            this.setError({ Message: 'Sum bilagsbeløp er ulik leverandørfakturabeløp' });
                            done('Bokføring feilet');
                        } else {
                            this._supplierInvoiceService.Transition(this.supplierInvoice.ID, this.supplierInvoice, 'journal')
                                .subscribe((resBooking) => {
                                    done('Bokført');
                                    this.refreshFormData(this.supplierInvoice);                                    
                                },
                                (error) => {
                                    this.setError(error);
                                    done('Bokføring feilet');
                                }
                                );
                        }
                    },
                    (error) => {
                        this.setError(error);
                        done('Lagring feilet');
                    }
                    )
            },
            (error) => {
                this.setError(error);
                done('Lagring feilet');
            }
            );
    }

    private runSmartBooking(supplierInvoice: SupplierInvoice, done) {

        if (supplierInvoice.ID == 0) {
            done('Smartbokføring kunne ikke kjøres');
            console.error('Smart booking can not be performed since SupplierInvoice.ID is null');
            return;
        }

        this._supplierInvoiceService.Action(supplierInvoice.ID, 'smartbooking')
            .subscribe(
            (response: any) => {
                this.refreshFormData(supplierInvoice);
                done('Smartbokført');
            },
            (error) => {
                this.setError(error);
                done('Feilet i smartbokføring');
            }
            );
    }

    private setPreviewId() {
        let self = this;

        this.fileuploader.getSlots(this.supplierInvoice.ID).then((data) => {
            if (data && data.length) {
                self.previewId = data[0].ID;
            } else {
                self.previewId = -1;
            }
        });
    }

    private buildForm() {
        let self = this;

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
            template: (data) => data ? `${data.SupplierNumber} - ${data.Info.Name}` : '',
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 500
        };

        var invoiceDate = new UniFieldLayout();
        invoiceDate.FieldSet = 0;
        invoiceDate.Section = 0;
        invoiceDate.Combo = 0;
        invoiceDate.FieldType = 2;
        invoiceDate.Label = 'Fakturadato';
        invoiceDate.Property = 'InvoiceDate';
        invoiceDate.ReadOnly = false;

        var paymentDueDate = new UniFieldLayout();
        paymentDueDate.FieldSet = 0;
        paymentDueDate.Section = 0;
        paymentDueDate.Combo = 0;
        paymentDueDate.FieldType = 2;
        paymentDueDate.Label = 'Forfallsdato';
        paymentDueDate.Property = 'PaymentDueDate';
        paymentDueDate.ReadOnly = false;

        var taxInclusiveAmount = new UniFieldLayout();
        taxInclusiveAmount.FieldSet = 0;
        taxInclusiveAmount.Section = 0;
        taxInclusiveAmount.Combo = 0;
        taxInclusiveAmount.FieldType = 10;
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

        var bankAccount = new UniFieldLayout();
        bankAccount.FieldSet = 0;
        bankAccount.Section = 0;
        bankAccount.Combo = 0;
        bankAccount.FieldType = 10;
        bankAccount.Label = 'Bankkonto';
        bankAccount.Property = 'BankAccount';
        bankAccount.ReadOnly = false;
        //bankAccount.Options = {  // TODO: later on when using BankAccount                
        //    source: this.bankAccounts,
        //    valueProperty: 'AccountNumber',
        //    displayProperty: 'AccountNumber',
        //    debounceTime: 500
        //};

        var paymentID = new UniFieldLayout();
        paymentID.FieldSet = 0;
        paymentID.Section = 0;
        paymentID.Combo = 0;
        paymentID.FieldType = 10;
        paymentID.Label = 'KID';
        paymentID.Property = 'PaymentID';
        paymentID.ReadOnly = false;
        //paymentID.LineBreak = true; // TODO issue #724   

        var paymentInformation = new UniFieldLayout();
        paymentInformation.FieldSet = 0;
        paymentInformation.Section = 0;
        paymentInformation.Combo = 0;
        paymentInformation.FieldType = 10;
        paymentInformation.Label = 'Melding til mottaker';
        paymentInformation.Property = 'PaymentInformation';
        paymentInformation.ReadOnly = false;

        self.fields = [supplierName, invoiceDate, paymentDueDate, taxInclusiveAmount, invoiceNumber,
            bankAccount, paymentID, paymentInformation];

        this.config = {
        };
    }

    private onFileUploaded(slot) {
        this.previewId = slot.ID;
    }

    private ready(event) {
        if (this.supplierInvoice.StatusCode < StatusCodeSupplierInvoice.Journaled) {
            this.form.editMode();
            this.disabled = false;
        } else {
            this.form.readMode();
            this.disabled = true;
        }
    }

    private registerPayment(done) {
        const title = `Register betaling${this.supplierInvoice.InvoiceNumber ? ', Faktura ' + this.supplierInvoice.InvoiceNumber : ''}${this.supplierInvoice.InvoiceReceiverName ? ', ' + this.supplierInvoice.InvoiceReceiverName : ''}`;

        // Set up subscription to listen to when data has been registrerred and button clicked in modal window.        
        // Only setup one subscription - this is done to avoid problems with multiple callbacks
        if (this.registerPaymentModal.changed.observers.length === 0) {
            this.registerPaymentModal.changed.subscribe((modalData: any) => {
                this._supplierInvoiceService.ActionWithBody(modalData.id, modalData.invoice, 'payInvoice').subscribe((journalEntry) => {
                    this.refreshFormData(this.supplierInvoice);
                    done('Betaling registrert');
                }, (error) => {
                    this.setError(error);
                    done('Feilet ved registrering av betaling');
                });
            });
        }

        const invoiceData: InvoicePaymentData = {
            Amount: this.supplierInvoice.RestAmount,
            PaymentDate: new Date()
        };

        this.registerPaymentModal.openModal(this.supplierInvoice.ID, title, invoiceData);        
    }
}
