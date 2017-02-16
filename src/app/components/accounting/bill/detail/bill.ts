import {ViewChild, Component, SimpleChanges} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {Router, ActivatedRoute} from '@angular/router';
import {safeInt, roundTo, safeDec, filterInput, trimLength, createFormField, FieldSize, ControlTypes} from '../../../timetracking/utils/utils';
import {Supplier, SupplierInvoice, JournalEntryLineDraft, StatusCodeSupplierInvoice, BankAccount} from '../../../../unientities';
import {UniStatusTrack} from '../../../common/toolbar/statustrack';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm} from 'uniform-ng2/main';
import {SupplierDetailsModal} from '../../../common/supplier/details/supplierDetailModal';
import {RegisterPaymentModal} from '../../../common/modals/registerPaymentModal';
import {Location} from '@angular/common';
import {BillSimpleJournalEntryView} from './journal/simple';
import {UniConfirmModal, ConfirmActions} from '../../../../../framework/modals/confirm';
import {IOcrServiceResult, OcrValuables} from './ocr';
import {billViewLanguage as lang, billStatusflowLabels as workflowLabels} from './lang';
import {BillHistoryView} from './history/history';
import {BankAccountModal} from '../../../common/modals/modals';
import {
    SupplierInvoiceService,
    SupplierService,
    UniCacheService,
    VatTypeService,
    BankAccountService,
    ErrorService,
    PageStateService,
    checkGuid
} from '../../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniFieldLayout} from 'uniform-ng2/main';
import * as moment from 'moment';
declare var _;

interface ITab {
    name: string;
    label: string;
    isSelected?: boolean;
    count?: number;
    isHidden?: boolean;
}

enum actionBar {
    save = 0,
    delete = 1,
    ocr = 2
};


interface ILocalValidation {
    success: boolean;
    errorMessage?: string;
}

@Component({
    selector: 'uni-bill',
    templateUrl: './bill.html'
})
export class BillView {

    public busy: boolean = true;
    public toolbarConfig: any;
    public formConfig: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public fields: BehaviorSubject<UniFieldLayout[]>;
    public current: BehaviorSubject<SupplierInvoice> = new BehaviorSubject(new SupplierInvoice());
    public currentSupplierID: number = 0;
    public collapseSimpleJournal: boolean = false;
    public hasUnsavedChanges: boolean = false;
    public currentFileID: number = 0;
    public hasStartupFileID: boolean = false;
    public historyCount: number = 0;

    private files: Array<any>;
    private fileIds: Array<number> = [];
    private unlinkedFiles: Array<number> = [];
    private supplierIsReadOnly: boolean = false;
    private bankAccountChanged: any;
    private commentsConfig: any;

    @ViewChild(UniForm) public uniForm: UniForm;
    @ViewChild(SupplierDetailsModal) private supplierDetailsModal: SupplierDetailsModal;
    @ViewChild(BankAccountModal) public bankAccountModal: BankAccountModal;
    @ViewChild(RegisterPaymentModal) private registerPaymentModal: RegisterPaymentModal;
    @ViewChild(BillSimpleJournalEntryView) private simpleJournalentry: BillSimpleJournalEntryView;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;
    @ViewChild(BillHistoryView) private historyView: BillHistoryView;

    private tabLabel: string;
    public tabs: Array<ITab> = [
        { label: lang.tab_invoice, name: 'head', isHidden: true},
        { label: lang.tab_document, name: 'docs', isSelected: true},
        { label: lang.tab_journal, name: 'journal', isHidden: true },
        { label: lang.tab_items, name: 'items', isHidden: true },
        { label: lang.tab_history, name: 'history' }

    ];

    public actions: IUniSaveAction[];

    private rootActions: IUniSaveAction[] = [
            { label: lang.tool_save, action: (done) => this.save(done), main: true, disabled: true },
            { label: lang.tool_delete, action: (done) => this.tryDelete(done), main: false, disabled: true },
            { label: lang.ocr, action: (done) => this.runOcr(this.files).then(() => done()), main: false, disabled: false }
        ];

    constructor(
        private tabService: TabService,
        private supplierInvoiceService: SupplierInvoiceService,
        private toast: ToastService,
        private route: ActivatedRoute,
        private cache: UniCacheService,
        private vatTypeService: VatTypeService,
        private supplierService: SupplierService,
        private router: Router,
        private location: Location,
        private errorService: ErrorService,
        private pageStateService: PageStateService,
        private bankAccountService: BankAccountService) {
            this.actions = this.rootActions;
    }

    public ngOnInit() {
        this.initForm();
        this.initFromRoute();
    }

    public canDeactivate() {
        return this.checkSave();
    }

    private initFromRoute() {
        this.route.params.subscribe( (params: any) => {
            var id = params.id;
            if (safeInt(id) > 0) {
                this.updateTabInfo(id);
                this.fetchInvoice(id, true);
            } else {
                this.newInvoice(true);
                this.checkPath();
            }

            this.commentsConfig = {
                entityType: SupplierInvoice.EntityType,
                entityID: +params.id
            };
        });

    }

    private updateTabInfo(id?: number | string, label?: string) {
        let current = this.current.getValue();
        id = id || (current ? current.ID : 0);
        this.tabLabel = label || lang.title_with_id + id;
        var url = '/accounting/bill/' + id;
        this.tabService.addTab({ name: this.tabLabel, url: url, moduleID: UniModules.Bills, active: true });
        if (this.location.path(false) !== url) {
            this.location.go(url);
        }
    }

    private renderCombo(data: { SupplierNumber: number, InfoName: string }) {
        return data ? `${data.SupplierNumber} - ${data.InfoName}` : '';
    }

    private initForm() {
        var supIdCol = createFormField('SupplierID', lang.col_supplier, ControlTypes.AutocompleteInput, FieldSize.Full);
        supIdCol.Options = {
            source: this.supplierInvoiceService.getStatQuery('?model=supplier&orderby=Info.Name&select=id as ID,SupplierNumber as SupplierNumber,Info.Name&expand=info'),
            template: (data) => {
                let current: SupplierInvoice = this.current.getValue();
                if (data === undefined && (current && current.Supplier && current.Supplier.Info) ) {
                    data = { SupplierNumber: current.Supplier.SupplierNumber, InfoName: current.Supplier.Info.Name };
                }
                if (data && data.InfoName) {
                    return this.renderCombo(data);
                } else {
                    return '';
                }
            },
            getDefaultData: () => {
                return this.supplierInvoiceService.getStatQuery('?model=supplier&orderby=Info.Name&select=id as ID,SupplierNumber as SupplierNumber,Info.Name&expand=info&filter=ID eq ' + this.currentSupplierID);
            },
            search: (txt: string) => {
                let filter = `contains(info.name,'${txt}')`;
                return this.supplierInvoiceService.getStatQuery('?model=supplier&orderby=Info.Name&select=id as ID,SupplierNumber as SupplierNumber,Info.Name&expand=info&filter=' + filter);
            },
            valueProperty: 'ID'
        };

        var sumCol = createFormField('TaxInclusiveAmount', lang.col_total, ControlTypes.NumericInput, FieldSize.Double);
        sumCol.Options = {
            events: {
                enter: () => {
                    this.focusJournalEntries();
                }
            },
            decimalLength: 2
        };

        let bankAccountCol = createFormField('BankAccountID', lang.col_bank, ControlTypes.MultivalueInput, FieldSize.Double);
        bankAccountCol.Options = {
            entity: 'BankAccount',
            listProperty: 'Supplier.Info.BankAccounts',
            displayValue: 'AccountNumber',
            linkProperty: 'ID',
            storeResultInProperty: 'BankAccountID',
            editor: (bankaccount: BankAccount) => new Promise((resolve, reject) => {
                let current: SupplierInvoice = this.current.getValue();
                if (!bankaccount) {
                    bankaccount = new BankAccount();
                    bankaccount['_createguid'] = this.bankAccountService.getNewGuid();
                    bankaccount.BankAccountType = 'supplier';
                    bankaccount.BusinessRelationID = current.Supplier.BusinessRelationID;
                    bankaccount.ID = 0;
                }

                this.bankAccountModal.openModal(bankaccount, false);

                this.bankAccountChanged = this.bankAccountModal.Changed.subscribe((changedBankaccount) => {
                    this.bankAccountChanged.unsubscribe();

                    // save the bank account to the supplier
                    if (changedBankaccount.ID === 0) {
                        this.bankAccountService.Post(changedBankaccount)
                            .subscribe((savedBankAccount: BankAccount) => {
                                current.BankAccountID = savedBankAccount.ID;
                                this.current.next(current); //if we update current we emit the new value
                                resolve(savedBankAccount);
                            },
                            err => {
                                this.errorService.handle(err);
                                reject('Feil ved lagring av bankkonto');
                            }
                        );
                    } else {
                        throw new Error('Du kan ikke endre en bankkonto herfra');
                    }
                });
            })
        };

        var list = [
            supIdCol,
            createFormField('InvoiceDate', lang.col_date, ControlTypes.DateInput, FieldSize.Double),
            createFormField('PaymentDueDate', lang.col_due, ControlTypes.DateInput, FieldSize.Double),
            createFormField('InvoiceNumber', lang.col_invoice, undefined, FieldSize.Double),
            bankAccountCol,
            createFormField('PaymentID', lang.col_kid, ControlTypes.TextInput, FieldSize.Double),
            sumCol
        ];

        // this.fields = list;
        this.fields = new BehaviorSubject(list);
    }

    private focusJournalEntries() {
        // todo: ask Jorge how to fetch new value from the damned "TaxInclusiveAmount" ?
        this.simpleJournalentry.focus();
    }

    public onFormReady(event) {
        this.createNewSupplierButton();
    }


    /// =============================

    ///     FILES AND OCR

    /// =============================

    public onFileListReady(files: Array<any>) {
        this.files = files;
        if (files && files.length) {
            if (!this.hasValidSupplier()) {
                this.runOcr(files);
            }
            this.checkNewFiles(files);
        }
    }

    private checkNewFiles(files: Array<any>) {

        if ((!files) || files.length === 0) {
            return;
        }
        let firstFile = files[0];
        const current = this.current.getValue();
        if (!current.ID) {
            if (this.unlinkedFiles.findIndex( x => x === firstFile.ID ) < 0) {
                this.unlinkedFiles.push(firstFile.ID);
                if (this.hasStartupFileID !== firstFile.ID) {
                    this.tagFileStatus(firstFile.ID, 0);
                }
            }
        }
    }

    private hasValidSupplier() {
        let current = this.current.getValue();
        return (current && current.SupplierID) ? true : false;
    }

    private runOcr(files: Array<any>): Promise<boolean> {
        return new Promise( (resolve, reject) => {
            if (files && files.length > 0) {
                let firstFile = files[0];
                this.userMsg(lang.ocr_running, null, null, true);
                this.supplierInvoiceService.fetch(`files/${firstFile.ID}?action=ocranalyse`)
                    .subscribe( (result: IOcrServiceResult) => {
                        this.toast.clear();
                        this.handleOcrResult( new OcrValuables(result) );
                        resolve(true);
                    }, (err) => {
                        this.errorService.handle(err);
                        resolve(false);
                    });
            }
        });
    }

    private handleOcrResult(ocr: OcrValuables) {
        if (ocr.Orgno) {
            if (!this.hasValidSupplier()) {
                var orgNo = filterInput(ocr.Orgno);
                this.supplierService.GetAll(`filter=contains(OrgNumber,'${orgNo}')`, ['Info.BankAccounts'])
                    .subscribe( (result: Supplier[]) => {
                        if (result && result.length > 0) {
                            let supplier = result[0];

                            if (ocr.BankAccount) {
                                let bankAccount = supplier.Info.BankAccounts
                                    .find(x => x.AccountNumber === ocr.BankAccount);

                                if (bankAccount) {
                                    this.setFormValue('BankAccountID', bankAccount.ID);
                                } else {
                                    this.confirmModal.confirm(
                                        `${lang.create_bankaccount_info} ${supplier.Info.Name}`,
                                        `${lang.create_bankaccount_title} ${ocr.BankAccount}?`,
                                        false,
                                        {accept: `${lang.create_bankaccount_accept}`, reject: lang.create_bankaccount_reject}
                                    ).then((userChoice: ConfirmActions) => {
                                            if (userChoice === ConfirmActions.ACCEPT) {
                                                let newBankAccount = new BankAccount();
                                                newBankAccount.AccountNumber = ocr.BankAccount;
                                                newBankAccount.BusinessRelationID = supplier.BusinessRelationID;
                                                newBankAccount.BankAccountType = 'supplier';

                                                this.bankAccountService.Post(newBankAccount)
                                                    .subscribe((savedBankAccount: BankAccount) => {
                                                        supplier.Info.BankAccounts.push(savedBankAccount);
                                                        this.setFormValue('BankAccountID', savedBankAccount.ID);

                                                        this.setSupplier(supplier);
                                                    },
                                                    err => this.errorService.handle(err)
                                                );
                                            }
                                        });
                                }
                            }

                            this.setSupplier(supplier);
                        } else {
                            this.findSupplierViaPhonebook(orgNo, true, ocr.BankAccount);
                        }
                    }, err => this.errorService.handle(err));
            }
        }
        this.setFormValue('PaymentID', ocr.PaymentID);
        this.setFormValue('InvoiceNumber', ocr.InvoiceNumber);
        this.setFormValue('InvoiceDate', moment(ocr.InvoiceDate).format('L'), true);
        this.setFormValue('PaymentDueDate', moment(ocr.PaymentDueDate).format('L'), true);
        this.setFormValue('TaxInclusiveAmount', safeDec(ocr.TaxInclusiveAmount).toFixed(2));
    }

    private findSupplierViaPhonebook(orgNo: string, askUser: boolean, bankAccount?: string) {
        this.supplierInvoiceService.fetch('business-relations/?action=search-data-hotel&searchText=' + orgNo).subscribe( x => {
            if (x.Data && x.Data.entries && x.Data.entries.length > 0) {
                var item = x.Data.entries[0];
                var title = `${lang.create_supplier} '${item.navn}' ?`;
                var msg = `${item.foretningsadr || ''} ${item.forradrpostnr || ''} ${item.forradrpoststed || ''}. ${lang.org_number}: ${item.orgnr}`;
                this.toast.clear();
                if (askUser) {
                    this.confirmModal.confirm(msg, title, false, { warning: lang.org_not_found}, ).then( (userChoice: ConfirmActions) => {
                        if (userChoice === ConfirmActions.ACCEPT) {
                            this.createSupplier(item.orgnr, item.navn, item.foretningsadr, item.forradrpostnr, item.forradrpoststed, bankAccount);
                        }
                    });
                } else {
                    this.createSupplier(item.orgnr, item.navn, item.foretningsadr, item.forradrpostnr, item.forradrpoststed, bankAccount);
                }
            }
        }, err => this.errorService.handle(err));
    }

    private createSupplier(orgNo: string, name: string, address: string, postalCode: string, city: string, bankAccount?: string) {
        var sup = new Supplier();
        sup.OrgNumber = orgNo;

        sup.Info = <any>{
            Name: name,
            ShippingAddress: {
                AddressLine1: address || '',
                City: city || '',
                PostalCode: postalCode || '',
                Country: 'NORGE',
                CountryCode: 'NO'
            }
        };

        if (bankAccount) {
            sup.Info.DefaultBankAccount = <any>{ AccountNumber: bankAccount, BankAccountType: 'supplier' };
        }

        this.supplierService.Post(sup).subscribe( x => {
            this.fetchNewSupplier(x.ID, true);
        }, err => this.errorService.handle(err));
    }


    private setFormValue(colName: string, value: any, callInputChange = false) {
        let current = this.current.getValue();
        current[colName] = value;
        var fld: any = this.uniForm.field(colName);
        fld.Component.control.setValue(value, { emitEvent: true });
        if (callInputChange) {
            fld.Component.inputChange();
        }
        this.current.next(current);
        this.flagUnsavedChanged();
    }

    ///////////////////////


    public onSaveDraftForImage() {
        this.save((msg) => {
            this.userMsg(lang.add_image_now, lang.fyi, 3, true);
        });
    }

    public onFormChange(change: SimpleChanges) {
        let model = this.current.getValue();
        let changedProperties = Object.keys(change);
        changedProperties.forEach((property: string) => _.set(model, property, change[property].currentValue));
        this.current.next(model);
        if (model.SupplierID !== this.currentSupplierID) {
            this.fetchNewSupplier(model.SupplierID);
        }
        this.flagUnsavedChanged();
    }

    public onSupplierModalChanged(supplier: Supplier) {
        if (supplier && supplier.ID) {
            this.fetchNewSupplier(supplier.ID, true);
            this.flagUnsavedChanged();
        }
    }

    private fetchNewSupplier(id: number, updateCombo = false) {
        if (id) {
            this.supplierService.Get(id, ['Info', 'Info.BankAccounts', 'Info.DefaultBankAccount'])
                .subscribe( (result: Supplier) => this.setSupplier(result, updateCombo));
        }
    }

    private setSupplier(result: Supplier, updateCombo = true) {
        let current: SupplierInvoice = this.current.getValue();
        this.currentSupplierID = result.ID;
        current.Supplier = result;
        if (current.SupplierID !== result.ID) {
            current.SupplierID = result.ID;
        }
        if (updateCombo) {
            this.uniForm.field('SupplierID').Component.control
                .setValue(this.renderCombo({ SupplierNumber: result.SupplierNumber, InfoName: result.Info.Name }));
        }

        if (!current.BankAccountID && result.Info.DefaultBankAccountID ||
            (current.BankAccount && current.BankAccount.BusinessRelationID !== result.BusinessRelationID)) {
            current.BankAccountID = result.Info.DefaultBankAccountID;
            this.uniForm.field('BankAccountID').Component.control
                .setValue(result.Info.DefaultBankAccount.AccountNumber);
        }

        // make uniform update itself to show correct values for bankaccount
        this.current.next(current);

        this.setupToolbar();
        this.fetchHistoryCount(this.currentSupplierID);
    }

    private fetchHistoryCount(supplierId: number) {
        let current: SupplierInvoice = this.current.getValue();
        if (current.StatusCode >= StatusCodeSupplierInvoice.Payed ) {
            return;
        }
        if (!supplierId) {
            this.setHistoryCounter(0);
            return;
        }
        if (this.historyView) {
            let tab = this.tabs.find( x => x.name === 'history');
            if (tab) {
                this.historyView.getNumberOfInvoices(supplierId, current.ID)
                    .subscribe( x => this.setHistoryCounter(x) );
            }
        }
    }

    private setHistoryCounter(value: number) {
        let tab = this.tabs.find( x => x.name === 'history');
        if (tab) {
            tab.count = value;
        }
    }

    private newInvoice(isInitial: boolean) {
        let current = new SupplierInvoice();
        current.StatusCode = 0;
        this.current.next(current);

        this.tabLabel = lang.title_new;
        this.currentSupplierID = 0;
        this.simpleJournalentry.clear();
        this.tabService.currentActiveTab.name = this.tabLabel;
        this.setupToolbar();
        this.flagUnsavedChanged(true);
        this.initDefaultActions();
        this.flagActionBar(actionBar.delete, false);
        this.supplierIsReadOnly = false;
        this.hasUnsavedChanges = false;
        this.currentFileID = 0;
        this.fileIds = [];
        this.unlinkedFiles = [];
        this.files = undefined;
        this.setHistoryCounter(0);
        this.busy = false;
        if (!isInitial) {
            this.hasStartupFileID = false;
            this.uniForm.field('SupplierID').Component.control.setValue(0);
        }
        try { if (this.uniForm) { this.uniForm.editMode(); } } catch (err) {}

    }

    private flagUnsavedChanged(reset = false) {
        this.flagActionBar(actionBar.save, !reset);
        if (!reset) {
            this.actions.forEach( x => x.main = false );
            this.actions[actionBar.save].main = true;
        }
        this.hasUnsavedChanges = !reset;
    }

    private flagActionBar(index: actionBar, enable = true) {
        this.actions[index].disabled = !enable;
    }

    private loadActionsFromEntity() {
        var it: any = this.current.getValue();
        if (it && it._links) {
            var list: IUniSaveAction[] = [];
            this.rootActions.forEach( x => list.push(x) );
            var hasBilag = (!!(it.JournalEntry && it.JournalEntry.JournalEntryNumber));
            let filter = ((it.StatusCode === 30105 && hasBilag) ? ['journal'] : undefined);
            this.addActions(it._links.transitions, list, true, ['assign', 'approve', 'journal', 'pay'], filter);
            if (it._links.actions && it._links.actions.smartbooking) {
                if (it.StatusCode < StatusCodeSupplierInvoice.Journaled ) {
                    list.push(this.newAction(
                        workflowLabels.smartbooking,
                        'smartbooking',
                        it._links.actions.smartbooking.href, false
                    ));
                }
            }
            this.actions = list;
        } else {
            this.initDefaultActions();
        }
    }

    private initDefaultActions() {
        this.actions = this.rootActions;
    }

    private newAction(label: string, itemKey: string, href: string, asMain = false): any {
        return {
            label: label,
            action: (done) => {
                this.handleAction(itemKey, label, href, done);
            },
            main: asMain,
            disabled: false
        };
    }

    private addActions(linkNode: any, list: any[], mainFirst = false, priorities?: string[], filters?: string[]) {
        var ix = 0, setAsMain = false, isFiltered = false, key: string;
        var ixFound = -1;
        if (!linkNode) { return; }

        for (key in linkNode) {
            if (linkNode.hasOwnProperty(key)) {

                isFiltered = filters ? (filters.findIndex( x => x === key ) >= 0) : false;
                if (!isFiltered) {
                    ix++;
                    setAsMain = mainFirst ? ix <= 1 : false;
                    // prioritized main?
                    if (priorities) {
                        let ixPri = priorities.findIndex(x => x === key );
                        if (ixPri >= 0 && (ixPri < ixFound || ixFound < 0)) {
                            ixFound = ixPri;
                            setAsMain = true;
                        }
                    }
                    // reset main?
                    if (setAsMain) { list.forEach( x => x.main = false); }

                    let itemKey = key;
                    let label = this.mapActionLabel(itemKey);
                    let href = linkNode[key].href;
                    list.push(this.newAction(label, itemKey, href, setAsMain));
                }
            }
        }
    }

    private handleAction(key: string, label: string, href: string, done: any) {
        this.checkSave().then( x => {
            if (x) {
                this.handleActionAfterCheckSave(key, label, href, done);
            } else {
                done();
            }
        });
    }

    private handleActionAfterCheckSave(key: string, label: string, href: string, done: any): boolean {
        let current = this.current.getValue();
        switch (key) {
            case 'journal':
                this.confirmModal.confirm(
                    lang.ask_journal_msg + current.TaxInclusiveAmount.toFixed(2) + '?',
                    lang.ask_journal_title + current.Supplier.Info.Name, false,
                    { warning: lang.warning_action_not_reversable }).then( (result: ConfirmActions) => {

                    if (result === ConfirmActions.ACCEPT) {
                        this.busy = true;
                        this.tryJournal(href).then((status: ILocalValidation) => {
                            this.busy = false;
                            this.hasUnsavedChanges = false;
                            done(lang.save_success);
                        }).catch((err: ILocalValidation) => {
                            this.busy = false;
                            done(err.errorMessage);
                            this.userMsg(err.errorMessage, lang.warning, 10);
                        });
                    } else {
                        done();
                    }
                });
                return true;

            case 'smartbooking':
                this.supplierInvoiceService.Action(current.ID, key).subscribe( (result) => {
                    this.userMsg(JSON.stringify(result));
                    done('ok');
                }, (err) => {
                    this.errorService.handle(err);
                    done(err);
                });
                return true;

            case 'pay':
            case 'payInvoice':
                this.registerPayment(done);
                return true;

            case 'finish':
                this.confirmModal.confirm(
                    lang.ask_archive + current.InvoiceNumber,
                    lang.ask_archive,
                    false,
                    { warning: lang.warning_action_not_reversable })
                .then( (result: ConfirmActions) => {
                    if (result === ConfirmActions.ACCEPT) {
                        return this.RunActionOnCurrent(key, done);
                    } else { done(); }
                });
                return true;

            default:
                return this.RunActionOnCurrent(key, done);
        }
    }

    private RunActionOnCurrent(action: string, done?: (msg) => {}, successMsg?: string ): boolean {
        let current = this.current.getValue();
        this.busy = true;
        this.supplierInvoiceService.PostAction(current.ID, action)
        .finally(() => this.busy = false)
        .subscribe( () => {
            this.fetchInvoice(current.ID, true);
            if (done) { done(successMsg); }
        }, (err) => {
            this.errorService.handle(err);
            done(err);
        });
        return true;
    }

    private tryJournal(url: string): Promise<ILocalValidation> {

        return new Promise( (resolve, reject) => {

            this.UpdateSuppliersJournalEntry().then( result => {
                let current = this.current.getValue();
                var validation = this.hasValidDraftLines(true);
                if (!validation.success) {
                    reject(validation);
                    return;
                }

                this.supplierInvoiceService.journal(current.ID).subscribe( x => {
                    this.fetchInvoice(current.ID, false);
                    resolve(result);
                    this.userMsg(lang.journaled_ok, null, 6, true);

                }, (err) => {
                    this.errorService.handle(err);
                    reject(err);
                });


            }).catch((err: ILocalValidation) => {
                reject( err );
            });

        });
    }

    private mapActionLabel(key: string): string {
        var label = workflowLabels[key];
        if (!label) {
            return key;
        }
        return label;

    }

    private fetchInvoice(id: number | string, flagBusy: boolean): Promise<any> {
        let current = this.current.getValue();
        if (flagBusy) { this.busy = true; }
        this.currentFileID = 0;
        this.files = undefined;
        this.setHistoryCounter(0);
        return new Promise( (resolve, reject) => {
            this.supplierInvoiceService.Get(
                id,
                ['Supplier.Info.BankAccounts', 'JournalEntry.DraftLines.Account,JournalEntry.DraftLines.VatType']
            ).subscribe(result => {
                if (flagBusy) { this.busy = false; }
                if (result.Supplier === null) { result.Supplier = new Supplier(); };
                this.current.next(result);
                this.setupToolbar();
                this.updateTabInfo(id, trimLength(this.toolbarConfig.title, 12));
                this.flagActionBar(actionBar.delete, current.StatusCode <= StatusCodeSupplierInvoice.Draft);
                this.flagActionBar(actionBar.ocr, current.StatusCode <= StatusCodeSupplierInvoice.Draft);
                this.loadActionsFromEntity();
                this.checkLockStatus();
                this.fetchHistoryCount(current.SupplierID);
                resolve('');
            }, (err) => {
                this.errorService.handle(err);
                reject(err);
            });
        });
    }

    private checkLockStatus() {

        this.supplierIsReadOnly = true;
        let current = this.current.getValue();
        if (current && current.StatusCode) {
            switch (safeInt(current.StatusCode)) {
                case StatusCodeSupplierInvoice.Payed:
                case StatusCodeSupplierInvoice.PartlyPayed:
                case 90001: // rejected
                case 40001: // archived
                    this.uniForm.readMode();
                    return;

                case StatusCodeSupplierInvoice.ToPayment:
                    this.uniForm.readMode();
                    this.uniForm.field('BankAccountID').editMode();
                    this.uniForm.field('PaymentID').editMode();
                    return;

                case StatusCodeSupplierInvoice.Journaled:
                    this.uniForm.readMode();
                    this.uniForm.field('PaymentDueDate').editMode();
                    this.uniForm.field('BankAccountID').editMode();
                    this.uniForm.field('PaymentID').editMode();
                    return;

                case StatusCodeSupplierInvoice.ForApproval:
                    this.uniForm.readMode();
                    this.supplierIsReadOnly = false;
                    this.uniForm.field('PaymentID').editMode();
                    this.uniForm.field('PaymentDueDate').editMode();
                    return;
            }
        }

        this.uniForm.editMode();
        this.supplierIsReadOnly = false;
    }

    private getSupplierName(): string {
        let current = this.current.getValue();
        return current
            && current.Supplier
            && current.Supplier.Info ? current.Supplier.Info.Name : '';
    }

    public tryDelete(done) {
        let current = this.current.getValue();
        this.confirmModal.confirm(
            lang.ask_delete + (current.InvoiceNumber  || '') + '?',
            this.getSupplierName()).then( x => {
                if (x === ConfirmActions.ACCEPT) {
                    return this.delete(done);
                } else {
                    done(lang.delete_canceled);
                }
            });
    }

    public delete(done) {
        let current = this.current.getValue();
        var obs: any;
        if (current.ID) {
            obs = this.supplierInvoiceService.Remove<SupplierInvoice>(current.ID, current);
        } else {
            done(lang.delete_nothing_todo);
        }
        obs.subscribe((result) => {
            done(lang.delete_success);
            this.newInvoice(false);
        }, (error) => {
            var msg = error.statusText;
            if (error._body) {
                msg = error._body;
                this.showErrMsg(msg, true);
            } else {
                this.userMsg(lang.save_error);
            }
            done(lang.delete_error + ': ' + msg);
        });
    }


    public save(done?): Promise<ILocalValidation> {
        this.preSave();
        return new Promise((resolve, reject) => {

            var reload = () => {
                this.fetchInvoice(this.currentSupplierID, (!!done) )
                .then(() => {
                    resolve({ success: true});
                    if (done) { done(lang.save_success); }
                })
                .catch((msg) => {
                    reject( { success: false, errorMessage: msg });
                    if (done) { done(msg); }
                });
            };

            var obs: any;
            let current = this.current.getValue();
            if (current.ID) {
                obs = this.supplierInvoiceService.Put(current.ID, current);
            } else {
                obs = this.supplierInvoiceService.Post(current);
            }
            obs.subscribe((result) => {
                this.currentSupplierID = result.ID;
                this.hasUnsavedChanges = false;
                if (this.unlinkedFiles.length > 0) {
                    this.linkFiles(this.currentSupplierID, this.unlinkedFiles, 'SupplierInvoice', 40001).then( () => {
                        this.hasStartupFileID = false;
                        this.currentFileID = 0;
                        this.unlinkedFiles = [];
                        reload();
                    });
                } else {
                    reload();
                }
            }, (error) => {
                var msg = error.statusText;
                if (error._body) {
                    msg = error._body;
                    this.showErrMsg(msg, true);
                } else {
                    this.userMsg(lang.save_error);
                }
                if (done) { done(lang.save_error + ': ' + msg); }
                reject({ success: false, errorMessage: msg});
            });
        });
    }

    private preSave(): boolean {

        var changesMade = false;
        let current = this.current.getValue();
        // Ensure dates are set
        if (current.JournalEntry && current.JournalEntry.DraftLines) {
            current.JournalEntry.DraftLines.forEach( x => {
                let orig = x.FinancialDate;
                x.FinancialDate = x.FinancialDate || current.DeliveryDate || current.InvoiceDate;
                if (x.FinancialDate !== orig) {
                    changesMade = true;
                }
            });
        }

        // Auto-set "paymentinformation" from invoicenumber (if kid not set):
        if ((!current.PaymentID) && (!current.PaymentInformation)) {
            if (current.InvoiceNumber) {
                current.PaymentInformation = lang.headliner_invoice + current.InvoiceNumber;
                changesMade = true;
            }
        }

        // clear BankAccount, this should be saved/defined on the Supplier, and only the ID should
        // be set on the SupplierInvoice
        if (current.BankAccount) {
            current.BankAccount = null;
        }

        return changesMade;
    }

    private UpdateSuppliersJournalEntry(): Promise<ILocalValidation> {

        return new Promise((resolve, reject) => {
            let current = this.current.getValue();
            var completeAccount = (item: JournalEntryLineDraft, addToList = false) => {
                if (item.Amount !== current.TaxInclusiveAmount * -1) {
                    item.FinancialDate = item.FinancialDate || current.DeliveryDate || current.InvoiceDate;
                    item.Amount = current.TaxInclusiveAmount * -1;
                    item.Description = item.Description || (lang.headliner_invoice + ' ' + current.InvoiceNumber);
                    if (addToList) {
                         current.JournalEntry.DraftLines.push(item);
                    }
                    this.save().then(x => resolve(x)).catch( x => reject(x));
                } else {
                    resolve({ success: true });
                }
            };

            if (current.JournalEntry && current.JournalEntry.DraftLines) {
                var supplierId = safeInt(current.Supplier.SupplierNumber);
                var item: JournalEntryLineDraft;
                let items = current.JournalEntry.DraftLines;
                item = items.find( x => x.Account ? x.Account.AccountNumber === current.Supplier.SupplierNumber : false);
                if (!item) {
                    item = new JournalEntryLineDraft();
                    checkGuid(item);
                    this.supplierInvoiceService
                        .getStatQuery(`?model=account&select=ID as AccountID&filter=AccountNumber eq ${supplierId}`)
                        .subscribe( result => {
                            item.AccountID = result[0].AccountID;
                            completeAccount(item, true);
                            return;
                        }, (err) => {
                            this.errorService.handle(err);
                            reject({ success: false, errorMessage: lang.err_supplieraccount_not_found});
                        });
                    return;
                }
                completeAccount(item);
                return;
            }

            reject({ success: false, errorMessage: lang.err_missing_journalEntries});
        });
    }

    private registerPayment(done) {
        let current = this.current.getValue();
        const title = lang.ask_register_payment + current.InvoiceNumber;

        if (this.registerPaymentModal.changed.observers.length === 0) {
            this.registerPaymentModal.changed.subscribe((modalData: any) => {
                this.busy = true;
                this.supplierInvoiceService.ActionWithBody(modalData.id, modalData.invoice, 'payInvoice')
                .finally(() => this.busy = false)
                .subscribe((journalEntry) => {
                    this.fetchInvoice(current.ID, true);
                    this.userMsg(lang.payment_ok, null, null, true);
                }, (error) => {
                    this.errorService.handle(error);
                });
            });
        }

        const invoiceData = {
            Amount: current.RestAmount,
            PaymentDate: new Date()
        };

        this.registerPaymentModal.openModal(current.ID, title, invoiceData);

        done('');
    }


    private hasValidDraftLines(showErrMsg: boolean): ILocalValidation {
        var msg: string;
        let current = this.current.getValue();
        if (current.JournalEntry && current.JournalEntry.DraftLines) {
            let items = current.JournalEntry.DraftLines;
            var sum = 0, maxSum = 0, minSum = 0, itemSum = 0;
            items.forEach( x => {
                itemSum = x.Amount || 0;
                maxSum = itemSum > maxSum ? itemSum : maxSum;
                minSum = itemSum < minSum ? itemSum : minSum;
                sum += x.Amount;
            });
            sum = roundTo(sum);
            if (sum === 0 && (maxSum || minSum)) {
                return { success: true };
            }
            if (sum !== 0) {
                msg = lang.err_diff;
            }
        }
        msg = msg || lang.err_missing_journalEntries;
        if (showErrMsg) {
            this.userMsg(msg);
        }
        return { success: false, errorMessage: msg };
    }

    public onTabClick(tab: ITab) {
        if (tab.isSelected) { return; }
        this.tabs.forEach((t: any) => {
            if (t.name !== tab.name) { t.isSelected = false; }
        });
        tab.isSelected = true;
    }

    private checkSave(): Promise<boolean> {

        if (!this.hasUnsavedChanges) { return Promise.resolve(true); }

        return new Promise((resolve, reject) => {
            this.confirmModal.confirm('Lagre endringer før du fortsetter?', 'Advarsel', true).then( x => {
                if (x === ConfirmActions.ACCEPT) {
                    this.busy = true;
                    this.save().then( () => {
                        resolve(true);
                        this.busy = false;
                    }).catch( err => {
                        resolve(false);
                        this.busy = false;
                    });
                } else if (x === ConfirmActions.REJECT ) {
                    resolve(true); // no!, ignore saving
                } else {
                    resolve(false); // cancel, stop action
                    this.updateTabInfo();
                }
            });
        });

    }

    public onEntryChange(details: { rowIndex: number, item: JournalEntryLineDraft, extra: any }) {
        this.flagUnsavedChanged();
    }

    private getStatustrackConfig() {
        let current = this.current.getValue();
        let statustrack: UniStatusTrack.IStatus[] = [];
        let activeStatus = current.StatusCode;

        this.supplierInvoiceService.statusTypes.forEach((status) => {
            let _state: UniStatusTrack.States;
            let _addIt = status.isPrimary;
            if (status.Code > activeStatus) {
                _state = UniStatusTrack.States.Future;
            } else if (status.Code < activeStatus) {
                _state = UniStatusTrack.States.Completed;
            } else if (status.Code === activeStatus) {
                _state = UniStatusTrack.States.Active;
                _addIt = true;
            }
            if (_addIt) {
                statustrack.push({
                    title: status.Text,
                    state: _state,
                    code: status.Code
                });
            }
        });
        return statustrack;
    }

    private setupToolbar() {
        var doc: SupplierInvoice = this.current.getValue();
        var stConfig = this.getStatustrackConfig();
        var jnr = doc && doc.JournalEntry && doc.JournalEntry.JournalEntryNumber ? doc.JournalEntry.JournalEntryNumber : undefined;
        this.toolbarConfig = {
            title: doc && doc.Supplier && doc.Supplier.Info ? `${ trimLength(doc.Supplier.Info.Name,20)}` : lang.headliner_new,
            subheads: [
                {title: doc && doc.InvoiceNumber ? `${lang.headliner_invoice} ${doc.InvoiceNumber}` : ''},
                {title: doc && doc.Supplier ? `${lang.headliner_supplier} ${doc.Supplier.SupplierNumber}` : ''},
                {
                    title: jnr ? `(${lang.headliner_journal} ${jnr})` : `(${lang.headliner_journal_not})`,
                    link: jnr ?  `#/accounting/transquery/details;JournalEntryNumber=${jnr}` : undefined
                }
            ],
            statustrack: stConfig,
            navigation: {
                prev: () => this.navigateTo('prev'),
                next: () => this.navigateTo('next'),
                add: () => {
                    this.newInvoice(false);
                    this.router.navigateByUrl('/accounting/bill/0');
                }
            },
            entityID: doc && doc.ID ? doc.ID : null,
            entityType: 'SupplierInvoice'
        };
    }

    private navigateTo(direction = 'next') {
        this.busy = true;
        this.navigate(direction).then(() => this.busy = false, () => this.busy = false);
    }

    private navigate(direction = 'next'): Promise<any> {

        var params = '?model=supplierinvoice';
        var resultFld = 'minid';
        var id = this.current.getValue().ID;

        if (direction === 'next') {
            params += '&select=min(id)&filter=deleted eq \'false\'' + (id ? ' and id gt ' + id : '');
        } else {
            params += '&select=max(id)&filter=deleted eq \'false\'' + (id ? ' and id lt ' + id : '');
            resultFld = 'maxid';
        }

        // TODO: should use BizHttp.getNextID() / BizHttp.getPreviousID()
        return new Promise((resolve, reject) => {
            this.supplierInvoiceService.getStatQuery(params).subscribe((items) => {
                if (items && items.length > 0) {
                    var key = items[0][resultFld];
                    if (key) {
                        this.fetchInvoice(key, false);
                        resolve(true);
                        return;
                    }
                }
                reject(0); // not found
            }, (err) => {
                reject(-1); // error
            });
        });
    }

    private loadFromFileID(fileID: number | string) {
        this.hasStartupFileID = true;
        this.fileIds = [safeInt(fileID)];
        this.currentFileID = safeInt(fileID);
    }

    private linkFiles(ID: any, fileIDs: Array<any>, entityType: string, flagFileStatus?: any): Promise<any> {
        return new Promise( (resolve, reject) => {
            fileIDs.forEach( fileID => {
                var route = `files/${fileID}?action=link&entitytype=${entityType}&entityid=${ID}`;
                if (flagFileStatus) {
                    this.tagFileStatus(fileID, flagFileStatus);
                }
                this.supplierInvoiceService.send(route).subscribe( x => resolve(x) );
            });
        });
    }

    private checkPath() {
        var pageParams = this.pageStateService.getPageState();
        if (pageParams.fileid) {
            this.loadFromFileID(pageParams.fileid);
        }
    }

    private tagFileStatus(fileID: number, flagFileStatus: number, tag = 'incomingmail') {
        this.supplierInvoiceService.send(
                `filetags/${fileID}`,
                undefined ,
                undefined,
                { FileID: fileID, TagName: 'incomingmail', Status: flagFileStatus }
            ).subscribe(null, err => this.errorService.handle(err));
    }

    private showErrMsg(msg: string, lookForMsg = false): string {
        var txt = msg;
        if (lookForMsg) {
            if (msg.indexOf('"Message":') > 0) {
                txt = msg.substr(msg.indexOf('"Message":') + 12, 80) + '..';
            }
        }
        this.userMsg(msg, lang.warning, 7);
        return txt;
    }

    private createNewSupplierButton() {
        var frm: any = this.uniForm;
        if (frm && frm.elementRef && frm.elementRef.nativeElement) {
            var el = frm.elementRef.nativeElement.getElementsByClassName('uni-autocomplete-searchBtn');
            if (el && el.length > 0) {
                var btn = el[0];
                var sibling = btn.cloneNode(true);
                sibling.className = 'good tiny';
                sibling.innerHTML = lang.btn_new_supplier;
                sibling.addEventListener('click', () => {
                    if (!this.supplierIsReadOnly) {
                        this.supplierDetailsModal.open();
                    }
                });
                var dropDown = btn.nextSibling;
                btn.parentElement.insertBefore(sibling, dropDown);
            }
            // Create keyboard-shortcut (F3)
            el = frm.elementRef.nativeElement.getElementsByTagName('input');
            if (el && el.length > 0) {
                el[0].addEventListener('keydown', (event) => {
                    if (event.which === 114 && (!this.supplierIsReadOnly)) {
                        this.supplierDetailsModal.open();
                        event.preventDefault();
                        event.stopPropagation();
                    }
                });
            }
        }

    }

    private userMsg(msg: string, title?: string, delay = 3, isGood = false) {
        this.toast.addToast(
            title || (isGood ? lang.fyi : lang.warning),
            isGood ? ToastType.good : ToastType.bad, delay,
            msg
        );
    }
}
