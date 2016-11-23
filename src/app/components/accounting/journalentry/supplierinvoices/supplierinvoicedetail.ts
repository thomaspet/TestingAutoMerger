import {Component, Input, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {SupplierInvoiceService, SupplierService, BankAccountService, JournalEntryService, ProjectService, DepartmentService} from '../../../../services/services';
import {UniForm, UniFieldLayout} from 'uniform-ng2/main';
import {JournalEntryData} from '../../../../models/models';
import {SupplierInvoice, Supplier, BankAccount, StatusCodeSupplierInvoice, FieldType, Project, Department} from '../../../../unientities';
import {JournalEntryManual} from '../journalentrymanual/journalentrymanual';
import {InvoicePaymentData} from '../../../../models/sales/InvoicePaymentData';
import {RegisterPaymentModal} from '../../../common/modals/registerPaymentModal';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {Subscription} from 'rxjs';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {SupplierDetailsModal} from '../../../sales/supplier/details/supplierDetailModal';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {UniStatusTrack} from '../../../common/toolbar/statustrack';
import {ErrorService} from '../../../../services/common/ErrorService';

declare var moment;
declare const _;

@Component({
    selector: 'supplier-invoice-detail',
    templateUrl: 'app/components/accounting/journalentry/supplierinvoices/supplierinvoicedetail.html'
})
export class SupplierInvoiceDetail implements OnInit, OnDestroy {
    @Input() private invoiceId: any;
    private supplierInvoice: SupplierInvoice;
    private suppliers: Supplier[];
    private bankAccounts: BankAccount[];
    private errors: any;
    private disabled: boolean = false;
    private subscriptions: Subscription[] = [];
    private projects: Project[];
    private departments: Department[];

    private toolbarconfig: IToolbarConfig;
    @ViewChild(JournalEntryManual) private journalEntryManual: JournalEntryManual;
    @ViewChild(UniForm) private form: UniForm;
    @ViewChild(RegisterPaymentModal) private registerPaymentModal: RegisterPaymentModal;
    @ViewChild(SupplierDetailsModal) private supplierDetailsModal: SupplierDetailsModal;

    public config: any = {};
    public fields: any[] = [];

    private actions: IUniSaveAction[];

    constructor(
        private _supplierInvoiceService: SupplierInvoiceService,
        private _supplierService: SupplierService,
        private _bankAccountService: BankAccountService,
        private _journalEntryService: JournalEntryService,
        private router: Router,
        private route: ActivatedRoute,
        private tabService: TabService,
        private projectService: ProjectService,
        private departmentService: DepartmentService,
        private errorService: ErrorService
    ) {

        route.params.subscribe(params => {
            this.invoiceId = +params['id'];
        });
    }

    private showError(error) {
        console.log('== ERROR ==', error);
        var messages = error._body ? JSON.parse(error._body) : error;
        if (messages) {
            this.errors = messages.Messages ? messages.Messages : [messages];
            setInterval(() => {
                this.errors = null;
            }, 5000);
        }
    }

    private getStatustrackConfig() {
        let statustrack: UniStatusTrack.IStatus[] = [];
        let activeStatus = this.supplierInvoice.StatusCode;

        this._supplierInvoiceService.statusTypes.forEach((s, i) => {
            let _state: UniStatusTrack.States;

            if (s.Code > activeStatus) {
                _state = UniStatusTrack.States.Future;
            } else if (s.Code < activeStatus) {
                _state = UniStatusTrack.States.Completed;
            } else if (s.Code === activeStatus) {
                _state = UniStatusTrack.States.Active;
            }

            statustrack[i] = {
                title: s.Text,
                state: _state
            };
        });
        return statustrack;
    }

    public ngOnInit() {
        this.loadFormAndData();

        this.subscriptions.push(
            this.supplierDetailsModal.change.subscribe(newSupplier => {
                this.fields = this.fields.map(field => {
                    if (field.Property === 'SupplierID') {
                        field.Options.source = this.suppliers.concat([newSupplier]);
                        this.supplierInvoice.SupplierID = newSupplier.ID;
                        return _.cloneDeep(field);
                    }
                    return field;
                });
                this.form.field('InvoiceDate').focus();
            })
        );
    }

    private refreshFormData(supplierInvoice: SupplierInvoice) {
        this.invoiceId = supplierInvoice.ID;

        this._supplierInvoiceService
            .Get(this.invoiceId, ['JournalEntry', 'Supplier.Info'])
            .subscribe((res) => {
                this.supplierInvoice = res;
                //this.setActionsDisabled();
                this.updateSaveActions();
                this.updateToolbar();
                this.setTabTitle();
                // call ready to set readonly fields if needed
                this.ready(null);
            },
                this.errorService.handle
            );
    }

    private setTabTitle() {
        let tabTitle = this.supplierInvoice.InvoiceNumber ? 'Leverandørfakturanr ' + this.supplierInvoice.InvoiceNumber : 'Leverandørfaktura (kladd)';
        this.tabService.addTab({ url: '/accounting/journalentry/supplierinvoices/' + this.invoiceId, name: tabTitle, active: true, moduleID: UniModules.Accounting });
    }

    private loadFormAndData() {
        Observable.forkJoin(
            this._supplierInvoiceService.Get(this.invoiceId, ['JournalEntry', 'Supplier.Info', 'Dimensions', 'Dimensions.Project', 'Dimensions.Department']),
            this._supplierService.GetAll(null, ['Info']),
            this._bankAccountService.GetAll(null),
            this.projectService.GetAll(null),
            this.departmentService.GetAll(null)
        ).subscribe((response: any) => {
            let [invoice, suppliers, bac, projects, departments] = response;
            this.supplierInvoice = invoice;
            this.suppliers = suppliers;
            this.bankAccounts = bac;
            this.projects = projects;
            this.departments = departments;

            // add blank to dropdown
            this.suppliers.unshift(null);

            this.updateSaveActions();
            this.updateToolbar();
            this.setTabTitle();

            this.buildForm();
        }, this.errorService.handle);
    }

    private updateToolbar() {
        this.toolbarconfig = {
            title: this.supplierInvoice !== null && this.supplierInvoice.ID > 0 ? (this.supplierInvoice.InvoiceNumber ? 'Leverandørfakturanr ' + this.supplierInvoice.InvoiceNumber : '') : '',
            subheads: [
                {title: this.supplierInvoice.Supplier ? ' ' + this.supplierInvoice.Supplier.Info.Name : ''},
                {title: this.supplierInvoice !== null && this.supplierInvoice.ID > 0 ? 'bilagsnr: ' + (this.supplierInvoice.JournalEntry !== null && this.supplierInvoice.JournalEntry.JournalEntryNumber !== null ? this.supplierInvoice.JournalEntry.JournalEntryNumber : 'Bilag ikke bokført') : ''}
            ],
            statustrack: this.getStatustrackConfig()
        };
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
        return this.supplierInvoice.StatusCode !== StatusCodeSupplierInvoice.Draft;
    }
    private IsRegisterPaymentActionDisabled() {
        return !(this.supplierInvoice.StatusCode === StatusCodeSupplierInvoice.Journaled ||
        this.supplierInvoice.StatusCode === StatusCodeSupplierInvoice.ToPayment ||
        this.supplierInvoice.StatusCode === StatusCodeSupplierInvoice.PartlyPayed);
    }

    private saveSupplierInvoiceTransition(done: any, transition: string, doneText: string) {
        this._supplierInvoiceService.Transition(this.supplierInvoice.ID, this.supplierInvoice, transition).subscribe(() => {
            console.log('== TRANSITION OK ' + transition + ' ==');
            this.refreshFormData(this.supplierInvoice);
            done(doneText);
        }, this.errorService.handle);
    }

    private payInvoice(done: any) {
        if (this.supplierInvoice.StatusCode === StatusCodeSupplierInvoice.Journaled) {
            this._supplierInvoiceService.Transition(this.supplierInvoice.ID, this.supplierInvoice, 'sendForPayment').subscribe(() => {
                console.log('== TRANSITION OK sendForPayment ==');
                this.registerPayment(done);
                done('Betalt');
            },
                (error) => {
                    this.errorService.handle(error);
                    done('Lagring feilet');
                });
        } else {
            this.registerPayment(done);
            done('Betalt');
        }
    }



    private save(runSmartBooking: boolean, done) {
        if (!this.supplierInvoice.SupplierID) {
            this.showError({Message: 'Leverandør må være fyllt ut.'});
            done('Ikke lagret');
            return;
        }

        if ((this.supplierInvoice.PaymentID || '').trim().length == 0 && (this.supplierInvoice.PaymentInformation || '').trim().length == 0) {
            this.showError({Message: 'KID eller melding må være fyllt ut.'});
            done('Ikke lagret');
            return;
        }

        if (this.supplierInvoice.Dimensions && (!this.supplierInvoice.DimensionsID || this.supplierInvoice.DimensionsID === 0)) {
            this.supplierInvoice.Dimensions['_createguid'] = this._supplierInvoiceService.getNewGuid();
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
                this.errorService.handle(error);
                done('Lagring feilet');
            });
        } else {
            this._supplierInvoiceService.Put(this.supplierInvoice.ID, this.supplierInvoice)
                .subscribe((result: SupplierInvoice) => {
                    //always run smartbooking for new supplier invoices, ignore input parameter
                    this.runSmartBooking(this.supplierInvoice, done);
                },
                (error) => {
                    this.errorService.handle(error);
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
            if (!line.FinancialDate || line.FinancialDate.toISOString() === '0001-01-01T00:00:00.000Z') {
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
                                    .filter(line => line.CreditAccountID !== null)
                                    .map((line) => line.Amount)
                                    .reduce((a, b) => {
                                        return (a > 0 ? a : 0) + (b > 0 ? b : 0)
                                    });

                        if (sum !== this.supplierInvoice.TaxInclusiveAmount) {
                            this.showError({ Message: 'Sum bilagsbeløp er ulik leverandørfakturabeløp' });
                            done('Bokføring feilet');
                        } else {
                            this._supplierInvoiceService.Transition(this.supplierInvoice.ID, this.supplierInvoice, 'journal')
                                .subscribe((resBooking) => {
                                    done('Bokført');
                                    this.refreshFormData(this.supplierInvoice);
                                },
                                (error) => {
                                    this.errorService.handle(error);
                                    done('Bokføring feilet');
                                }
                                );
                        }
                    },
                    (error) => {
                        this.errorService.handle(error);
                        done('Lagring feilet');
                    }
                    )
            },
            (error) => {
                this.errorService.handle(error);
                done('Lagring feilet');
            }
            );
    }

    private runSmartBooking(supplierInvoice: SupplierInvoice, done) {

        if (supplierInvoice.ID === 0) {
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
                this.errorService.handle(error);
                done('Feilet i smartbokføring');
            }
            );
    }

    private buildForm() {
        let self = this;

        var supplierName = new UniFieldLayout();
        supplierName.FieldSet = 0;
        supplierName.Section = 0;
        supplierName.Combo = 0;
        supplierName.FieldType = FieldType.DROPDOWN;
        supplierName.Label = 'Leverandørnavn';
        supplierName.Property = 'SupplierID';
        supplierName.ReadOnly = false;
        supplierName.Options = {
            source: this.suppliers,
            template: (data) => data ? `${data.SupplierNumber} - ${data.Info.Name}` : '',
            newButtonAction: () => this.supplierDetailsModal.open(),
            valueProperty: 'ID'
        };

        var invoiceDate = new UniFieldLayout();
        invoiceDate.FieldSet = 0;
        invoiceDate.Section = 0;
        invoiceDate.Combo = 0;
        invoiceDate.FieldType = FieldType.DATEPICKER;
        invoiceDate.Label = 'Fakturadato';
        invoiceDate.Property = 'InvoiceDate';
        invoiceDate.ReadOnly = false;

        var paymentDueDate = new UniFieldLayout();
        paymentDueDate.FieldSet = 0;
        paymentDueDate.Section = 0;
        paymentDueDate.Combo = 0;
        paymentDueDate.FieldType = FieldType.DATEPICKER;
        paymentDueDate.Label = 'Forfallsdato';
        paymentDueDate.Property = 'PaymentDueDate';
        paymentDueDate.ReadOnly = false;

        var taxInclusiveAmount = new UniFieldLayout();
        taxInclusiveAmount.FieldSet = 0;
        taxInclusiveAmount.Section = 0;
        taxInclusiveAmount.Combo = 0;
        taxInclusiveAmount.FieldType = FieldType.TEXT;
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
        invoiceNumber.FieldType = FieldType.TEXT;
        invoiceNumber.Label = 'Fakturanr';
        invoiceNumber.Property = 'InvoiceNumber';
        invoiceNumber.ReadOnly = false;

        var bankAccount = new UniFieldLayout();
        bankAccount.FieldSet = 0;
        bankAccount.Section = 0;
        bankAccount.Combo = 0;
        bankAccount.FieldType = FieldType.TEXT;
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
        paymentID.FieldType = FieldType.TEXT;
        paymentID.Label = 'KID';
        paymentID.Property = 'PaymentID';
        paymentID.ReadOnly = false;
        //paymentID.LineBreak = true; // TODO issue #724

        var paymentInformation = new UniFieldLayout();
        paymentInformation.FieldSet = 0;
        paymentInformation.Section = 0;
        paymentInformation.Combo = 0;
        paymentInformation.FieldType = FieldType.TEXT;
        paymentInformation.Label = 'Melding til mottaker';
        paymentInformation.Property = 'PaymentInformation';
        paymentInformation.ReadOnly = false;

        var project = new UniFieldLayout();
        project.FieldSet = 0;
        project.Section = 2;
        project.Combo = 0;
        project.FieldType = FieldType.DROPDOWN;
        project.Label = 'Prosjekt';
        project.Sectionheader = 'Dimensjoner';
        project.Property = 'Dimensions.ProjectID';
        project.ReadOnly = false;
        project.Options = {
            source: this.projects,
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.ProjectNumber + ': ' + item.Name) : '';
            },
            debounceTime: 200
        };

        var department = new UniFieldLayout();
        department.FieldSet = 0;
        department.Section = 2;
        department.Combo = 0;
        department.FieldType = FieldType.DROPDOWN;
        department.Label = 'Prosjekt';
        department.Sectionheader = 'Dimensjoner';
        department.Property = 'Dimensions.DepartmentID';
        department.ReadOnly = false;
        department.Options = {
            source: this.departments,
            valueProperty: 'ID',
            template: (item) => {
                return item !== null ? (item.DepartmentNumber + ': ' + item.Name) : '';
            },
            debounceTime: 200
        };

        self.fields = [supplierName, invoiceDate, paymentDueDate, taxInclusiveAmount, invoiceNumber,
            bankAccount, paymentID, paymentInformation, project, department];

        this.config = {
        };
    }

    private ready(event) {
        this.setupSubscriptions(null);

        if (this.supplierInvoice.StatusCode < StatusCodeSupplierInvoice.Journaled) {
            this.form.editMode();
            this.disabled = false;
        } else {
            this.form.readMode();
            this.disabled = true;
        }
    }

    private setupSubscriptions(event) {
        this.form.field('SupplierID')
             .changeEvent
             .subscribe((data) => {
                if (data) {
                    this._supplierService.Get(this.supplierInvoice.SupplierID, ['Dimensions', 'Dimensions.Project', 'Dimensions.Department']).subscribe((supplier: Supplier) => {
                        this.supplierInvoice.Dimensions = _.cloneDeep(supplier.Dimensions);
                        this.supplierInvoice = _.cloneDeep(this.supplierInvoice);
                        this.updateToolbar();
                    }, this.errorService.handle);
                }
             });
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
                    this.showError(error);
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

    public ngOnDestroy() {
        this.subscriptions.forEach(subscriptions => subscriptions.unsubscribe());
    }
}
