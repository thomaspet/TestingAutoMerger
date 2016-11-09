import {ViewChild, Component} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {SupplierInvoiceService,  SupplierService, UniCacheService, VatTypeService} from '../../../../services/services';
import {ToastService, ToastType} from '../../../../../framework/unitoast/toastservice';
import {ActivatedRoute} from '@angular/router';
import {safeInt, trimLength, createFormField, FieldSize, ControlTypes} from '../../../timetracking/utils/utils';
import {Supplier, SupplierInvoice, JournalEntryLineDraft, StatusCodeSupplierInvoice} from '../../../../unientities';
import {UniStatusTrack} from '../../../common/toolbar/statustrack';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm} from '../../../../../framework/uniform';
import {SupplierDetailsModal} from '../../../sales/supplier/details/supplierDetailModal';
import {checkGuid} from '../../../../services/common/dimensionservice';

declare const moment;

interface ITab {
    name: string;
    label: string;
    isSelected?: boolean;
    count?: number;
    isHidden?: boolean;
}

const lang = {
    tab_invoice: 'Faktura',
    tab_document: 'Dokument',
    tab_journal: 'Bilagslinjer',
    tab_items: 'Varelinjer',
    tab_history: 'Historikk',

    title_new: 'Regning (ny)',
    title_with_id: 'Regning #',

    headliner_new: 'Ny regning',
    headliner_invoice: 'Fakturanr.',
    headliner_supplier: 'Leverandørnr.',
    headliner_journal: 'Bilagsnr.',
    headliner_journal_not: 'ikke bokført',

    col_supplier: 'Leverandør',
    col_invoice: 'Fakturanr.',
    col_total: 'Sum inkl.mva',
    col_date: 'Fakturadato',
    col_due: 'Forfallsdato',
    col_kid: 'KID',
    col_bank: 'Bankkonto',

    tool_save: 'Lagre endringer',
    tool_delete: 'Slett',
    save_error: 'Feil ved lagring',    
    save_success: 'Lagret ok',

    delete_nothing_todo: 'Ingenting å slette',
    delete_error: 'Feil ved sletting',
    delete_success: 'Sletting ok',

    btn_new_supplier: 'Ny',

    journaled_ok: 'Bokføring fullført',

    err_missing_journalEntries: 'Kontering mangler!',
    err_diff: 'Differanse i posteringer!',
    err_supplieraccount_not_found: 'Fant ikke leverandørkonto!'
};

const workflowLabels = { 
    'smartbooking': 'Foreslå kontering',
    'payInvoice': 'Registrere betaling',
    'journal': 'Bokfør',
    'sendForPayment': 'Send til betaling',
    'pay': 'Betal',
    'assign': 'Tildel',
    'cancelApprovement': 'Kanseler godkjenning',
    'reAssign': 'Tildel på nytt',
    'accept': 'Godkjenn'
};

enum actionBar {
    save = 0,
    delete = 1
};


interface ILocalValidation {
    success: boolean;
    errorMessage?: string;
}

@Component({
    selector: 'uni-bill',
    templateUrl: 'app/components/accounting/bill/detail/bill.html'
})
export class BillView {

    public busy: boolean = true;
    public toolbarConfig: any;
    public formConfig: any = {};
    public fields: any[] = [];
    public current: SupplierInvoice;
    private currentSupplierID: number = 0;
    public collapseSimpleJournal: boolean = false;
    
    @ViewChild(UniForm) public uniForm: UniForm;
    @ViewChild(SupplierDetailsModal) private supplierDetailsModal: SupplierDetailsModal;

    // private listOfSuppliers: Array<any> = [];
    private tabLabel: string;    
    public tabs: Array<ITab> = [
        { label: lang.tab_invoice, name: 'head', isHidden: true},
        { label: lang.tab_document, name: 'docs', isSelected: true},
        { label: lang.tab_journal, name: 'journal' },
        { label: lang.tab_items, name: 'items' },
        { label: lang.tab_history, name: 'history' }
    ];


    public actions: IUniSaveAction[];

    private rootActions: IUniSaveAction[] = [
            { label: lang.tool_save, action: (done) => this.save(done), main: true, disabled: true },
            { label: lang.tool_delete, action: (done) => this.delete(done), main: false, disabled: true }
        ];

    constructor(
        private tabService: TabService, 
        private supplierInvoiceService: SupplierInvoiceService, 
        private toast: ToastService, 
        private route: ActivatedRoute,
        private cache: UniCacheService,
        private vatTypeService: VatTypeService,
        private supplierService: SupplierService) {
            this.actions = this.rootActions;
    }

    public ngOnInit() {
        this.initForm();        
        this.initFromRoute();    
    }

    private initFromRoute() {
        this.route.params.subscribe( (params: any) => {
            var id = params.id;
            if (safeInt(id) > 0) {
                this.tabLabel = lang.title_with_id + id;
                this.tabService.addTab({ name: this.tabLabel, url: '/accounting/bill/' + id, moduleID: UniModules.Bills, active: true });
                this.fetchInvoice(id, true);
            } else {
                this.newInvoice();
            }
        });
        
    }

    private renderCombo(data: { SupplierNumber: number, InfoName: string }) {
        return data ? `${data.SupplierNumber} - ${data.InfoName}` : '';
    }

    private initForm() {

        var supIdCol = createFormField('SupplierID', lang.col_supplier, ControlTypes.AutocompleteInput, FieldSize.Full);
        supIdCol.Options = {
            template: (data) => {
                if (data === undefined && (this.current && this.current.Supplier && this.current.Supplier.Info) ) {
                    data = { SupplierNumber: this.current.Supplier.SupplierNumber, InfoName: this.current.Supplier.Info.Name };
                }
                if (data && data.InfoName) {
                    return this.renderCombo(data);
                } else {
                    return '';
                }
            },
            search: (txt: string) => {
                var filter = `contains(info.name,'${txt}')`;
                return this.supplierInvoiceService.getStatQuery('?model=supplier&orderby=Info.Name&select=id as ID,SupplierNumber as SupplierNumber,Info.Name&expand=info&filter=' + filter);
            },
            valueProperty: 'ID'
        };

        var list = [
            supIdCol,
            createFormField('InvoiceDate', lang.col_date, ControlTypes.DateInput, FieldSize.Double),
            createFormField('PaymentDueDate', lang.col_due, ControlTypes.DateInput, FieldSize.Double),
            createFormField('InvoiceNumber', lang.col_invoice, undefined, FieldSize.Double),
            createFormField('BankAccount', lang.col_bank, ControlTypes.TextInput, FieldSize.Double),
            createFormField('PaymentID', lang.col_kid, ControlTypes.TextInput, FieldSize.Double),
            createFormField('TaxInclusiveAmount', lang.col_total, ControlTypes.NumericInput, FieldSize.Double) 
        ];

        this.fields = list;
    }


    public onFormReady(event) {
        this.createNewSupplierButton();
    }    

    public onSaveDraftForImage() {
        this.save((msg) => {            
            this.toast.addToast('Add image now!', ToastType.good, 3);
        });
    }    

    public onFormChange(model: SupplierInvoice) {
        this.current = model;
        if (model.SupplierID !== this.currentSupplierID) {
            this.fetchNewSupplier(model.SupplierID);
        }
        this.flagUnsavedChanged();
    }

    public onSupplierModalChanged(supplier: Supplier) {
        // debugger;
        if (supplier && supplier.ID) {
            this.fetchNewSupplier(supplier.ID, true);
            this.flagUnsavedChanged();
        }
    }

    private fetchNewSupplier(id: number, updateCombo = false) {
        this.supplierService.Get(id, ['Info']).subscribe( (result: Supplier) => {
            this.currentSupplierID = result.ID;
            this.current.Supplier = result;
            if (this.current.SupplierID !== id) {
                this.current.SupplierID = id;
            }
            if (updateCombo) {
                this.uniForm.field('SupplierID').control.setValue(this.renderCombo({ SupplierNumber: result.SupplierNumber, InfoName: result.Info.Name }));                
            }
            this.setupToolbar();
        });
    }

    private newInvoice() {
        this.tabLabel = lang.title_new;
        this.currentSupplierID = 0;
        this.current = new SupplierInvoice();
        this.current.StatusCode = StatusCodeSupplierInvoice.Draft;
        this.tabService.currentActiveTab.name = this.tabLabel;
        this.setupToolbar();
        this.flagUnsavedChanged(true);
        this.flagActionBar(actionBar.delete, false);
        this.busy = false;
    }

    private flagUnsavedChanged(reset = false) {
        this.flagActionBar(actionBar.save, !reset);
        if (!reset) {
            this.actions.forEach( x => x.main = false );
            this.actions[actionBar.save].main = true;
        }
    }

    private flagActionBar(index: actionBar, enable = true) {
        this.actions[index].disabled = !enable;
    }

    private loadActionsFromEntity() {
        var it: any = this.current;
        if (it && it._links) {
            var list: IUniSaveAction[] = [];
            this.rootActions.forEach( x => list.push(x) );
            this.addActions(it._links.actions, list);
            this.addActions(it._links.transitions, list, true, ['journal', 'pay']);
            this.actions = list;
        }
    }

    private addActions(linkNode: any, list: any[], mainFirst = false, priorities?: string[]) {
        var ix = 0, setAsMain = false;
        var ixFound = -1;
        if (!linkNode) { return; }

        for (var key in linkNode) {
            if (linkNode.hasOwnProperty(key)) {
                
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

                list.push({ 
                    label: label, 
                    action: (done) => {
                        if (!this.handleAction(itemKey, label, href, done)) {
                            this.toast.addToast(itemKey + ' todo...', ToastType.warn, 3);
                            done('Action not ready yet: ' + itemKey);
                        }
                    }, 
                    main: setAsMain, 
                    disabled: false  
                });
            }
        }
    }

    private handleAction(key: string, label: string, href: string, done: any): boolean {
        switch (key) {
            case 'journal':
                this.busy = true;
                this.tryJournal(href).then((status: ILocalValidation) => {
                    this.busy = false;
                    done(lang.save_success);
                }).catch((err: ILocalValidation) => {
                    this.busy = false;
                    done(err.errorMessage);
                });
                return true;
        }
        return false;
    }

    private tryJournal(url: string): Promise<ILocalValidation> {

        return new Promise( (resolve, reject) => {

            this.UpdateSuppliersJournalEntry().then( result => {

                var validation = this.hasValidDraftLines(true);
                if (!validation.success) {
                    reject(validation);
                    return;
                }

                this.supplierInvoiceService.journal(this.current.ID).subscribe( x => {
                    this.fetchInvoice(this.current.ID, false);
                    resolve(result);
                    this.toast.addToast(lang.journaled_ok, ToastType.good, 6);

                }, (err) => {
                    var msg = this.showHttpError(err);
                    reject(msg);
                });
            
            }).catch((err: ILocalValidation) => {
                reject( err );
            });
            
        });
    }

    private showHttpError(error: any): string {
        var msg = error.statusText;
        if (error._body) {
            msg = error._body;
        }             
        this.showErrMsg(msg, true);
        return msg;
    }

    private mapActionLabel(key: string): string {        
        var label = workflowLabels[key];
        if (!label) {
            return key;
        }
        return label;

    }

    private fetchInvoice(id: number | string, flagBusy: boolean) {
        if (flagBusy) { this.busy = true; }
        this.supplierInvoiceService.Get(id, ['Supplier.Info', 'JournalEntry.DraftLines.Account,JournalEntry.DraftLines.VatType']).subscribe(result => {
            if (flagBusy) { this.busy = false; }
            this.current = result;
            this.setupToolbar();
            this.tabService.currentActiveTab.name = trimLength(this.toolbarConfig.title, 12);
            this.flagActionBar(actionBar.delete, this.current.StatusCode <= StatusCodeSupplierInvoice.Draft);
            this.loadActionsFromEntity();
        });              
    }

    public delete(done) {
        return new Promise((resolve, reject) => {
            var obs: any;
            if (this.current.ID) {
                obs = this.supplierInvoiceService.Remove<SupplierInvoice>(this.current.ID, this.current);                
            } else {
                reject();
                done(lang.delete_nothing_todo);
            }
            obs.subscribe((result) => {
                done(lang.delete_success);
                this.newInvoice();
                resolve();
            }, (error) => {
                var msg = error.statusText;
                if (error._body) {
                    msg = error._body;
                    this.showErrMsg(msg, true);
                } else {
                    this.toast.addToast(lang.save_error, ToastType.bad, 7);
                }
                done(lang.delete_error + ': ' + msg);
                reject(msg);
            });
        });        
    }


    public save(done?): Promise<ILocalValidation> {
        this.preSave();
        return new Promise((resolve, reject) => {
            var obs: any;
            if (this.current.ID) {
                obs = this.supplierInvoiceService.Put(this.current.ID, this.current);                
            } else {
                obs = this.supplierInvoiceService.Post(this.current);
            }
            obs.subscribe((result) => {
                if (done) { done(lang.save_success); }                
                this.fetchInvoice(result.ID, (!!done) );
                this.currentSupplierID = this.current.ID;
                resolve({ success: true});
            }, (error) => {
                var msg = error.statusText;
                if (error._body) {
                    msg = error._body;
                    this.showErrMsg(msg, true);
                } else {
                    this.toast.addToast(lang.save_error, ToastType.bad, 7);
                }
                if (done) { done(lang.save_error + ': ' + msg); }
                reject({ success: false, errorMessage: msg});
            });
        });
    }

    private preSave(): boolean {

        var changesMade = false;

        // Ensure dates are set        
        if (this.current.JournalEntry && this.current.JournalEntry.DraftLines) {
            this.current.JournalEntry.DraftLines.forEach( x => {
                let orig = x.FinancialDate;
                x.FinancialDate = x.FinancialDate || this.current.DeliveryDate || this.current.InvoiceDate;
                if (x.FinancialDate !== orig) {
                    changesMade = true;
                }
            });     
        }

        // Auto-set "paymentinformation" from invoicenumber (if kid not set): 
        if ((!this.current.PaymentID) && (!this.current.PaymentInformation)) {
            if (this.current.InvoiceNumber) {
                this.current.PaymentInformation = lang.headliner_invoice + this.current.InvoiceNumber;
                changesMade = true;
            }
        }

        return changesMade;
    }

    private UpdateSuppliersJournalEntry(): Promise<ILocalValidation> {

        return new Promise((resolve, reject) => {

            var completeAccount = (item: JournalEntryLineDraft, addToList = false) => {
                if (item.Amount !== this.current.TaxInclusiveAmount * -1) {
                    item.FinancialDate = item.FinancialDate || this.current.DeliveryDate || this.current.InvoiceDate;
                    item.Amount = this.current.TaxInclusiveAmount * -1;
                    item.Description = item.Description || (lang.headliner_invoice + ' ' + this.current.InvoiceNumber);
                    if (addToList) {
                         this.current.JournalEntry.DraftLines.push(item);                         
                    }
                    this.save().then(x => resolve(x)).catch( x => reject(x));
                } else {
                    resolve({ success: true });
                }
            };

            if (this.current.JournalEntry && this.current.JournalEntry.DraftLines) {
                var supplierId = safeInt(this.current.Supplier.SupplierNumber);
                var item: JournalEntryLineDraft;
                let items = this.current.JournalEntry.DraftLines;
                item = items.find( x => x.Account.AccountNumber === this.current.Supplier.SupplierNumber ); 
                if (!item) {
                    item = new JournalEntryLineDraft();
                    checkGuid(item); 
                    this.supplierInvoiceService.getStatQuery(`?model=account&select=ID as AccountID&filter=AccountNumber eq ${supplierId}`).subscribe( result => {
                        item.AccountID = result[0].AccountID;                         
                        completeAccount(item, true);
                        return;
                    }, (err) => {
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


    private hasValidDraftLines(showErrMsg: boolean): ILocalValidation {
        var msg: string;
        if (this.current.JournalEntry && this.current.JournalEntry.DraftLines) {
            let items = this.current.JournalEntry.DraftLines;
            var sum = 0, maxSum = 0, minSum = 0, itemSum = 0;
            items.forEach( x => {
                itemSum = x.Amount || 0;
                maxSum = itemSum > maxSum ? itemSum : maxSum;
                minSum = itemSum < minSum ? itemSum : minSum;
                sum += x.Amount;
            });
            if (sum === 0 && (maxSum || minSum)) {
                return { success: true };
            }
            if (sum !== 0) {
                msg = lang.err_diff;
            }
        }
        msg = msg || lang.err_missing_journalEntries;
        if (showErrMsg) {
            this.toast.addToast(msg, ToastType.bad);
        }
        return { success: false, errorMessage: msg };
    }

    public onTabClick(tab: ITab) {
        if (tab.isSelected) { return; }
        this.tabs.forEach((t: any) => {
            if (t.name !== tab.name) { t.isSelected = false; }
        });
        tab.isSelected = true;
        /*
        if (tab.activate) {
            tab.activate(this.timeSheet, this.currentFilter);
        } 
        */       
    }

    public onEntryChange(details: { rowIndex: number, item: JournalEntryLineDraft, extra: any }) {
        this.flagUnsavedChanged();
    }

    private getStatustrackConfig() {
        let statustrack: UniStatusTrack.IStatus[] = [];
        let activeStatus = this.current.StatusCode;

        this.supplierInvoiceService.statusTypes.forEach((s, i) => {
            let _state: UniStatusTrack.States;
            let _addIt = s.isPrimary;
            if (s.Code > activeStatus) {
                _state = UniStatusTrack.States.Future;
            } else if (s.Code < activeStatus) {
                _state = UniStatusTrack.States.Completed;
            } else if (s.Code === activeStatus) {
                _state = UniStatusTrack.States.Active;
                _addIt = true;
            }
            if (_addIt) {
                statustrack.push({
                    title: s.Text,
                    state: _state
                });
            }
        });
        return statustrack;
    }    

    private setupToolbar() {
        var doc: SupplierInvoice = this.current;
        var stConfig = this.getStatustrackConfig();
        this.toolbarConfig = {
            title: doc && doc.Supplier && doc.Supplier.Info ? `${doc.Supplier.Info.Name}` : lang.headliner_new, 
            subheads: [
                {title: doc && doc.InvoiceNumber ? `${lang.headliner_invoice} ${doc.InvoiceNumber}` : ''},
                {title: doc && doc.Supplier ? `${lang.headliner_supplier} ${doc.Supplier.SupplierNumber}` : ''},
                {title: doc && doc.JournalEntry && doc.JournalEntry.JournalEntryNumber ? `(${lang.headliner_journal} ${doc.JournalEntry.JournalEntryNumber})` : `(${lang.headliner_journal_not})` }
            ],
            statustrack: stConfig
        };        
    }

    private showErrMsg(msg: string, lookForMsg = false): string {
        var txt = msg;
        if (lookForMsg) {
            if (msg.indexOf('"Message":') > 0) {
                txt = msg.substr(msg.indexOf('"Message":') + 12, 80) + '..';
            }
        }
        this.toast.addToast(txt, ToastType.bad, 7);
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
                    this.supplierDetailsModal.open();
                });
                var dropDown = btn.nextSibling;
                btn.parentElement.insertBefore(sibling, dropDown);
            } else {
                this.toast.addToast('Autocomplete element not found', ToastType.warn, 2);
            }
            // Create keyboard-shortcut (F3) 
            el = frm.elementRef.nativeElement.getElementsByTagName('input');
            if (el && el.length > 0) {
                el[0].addEventListener('keydown', (event) => {
                    if (event.which === 114) {
                        this.supplierDetailsModal.open();
                        event.preventDefault();
                        event.stopPropagation();
                    }
                });
            }
        }

    }

}
