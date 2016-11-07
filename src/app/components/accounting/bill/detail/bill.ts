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

    btn_new_supplier: 'Ny'
};


enum actionBar {
    save = 0,
    delete = 1
};

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


    public actions: IUniSaveAction[] = [
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
                this.fetchInvoice(id);
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
        // this.busy = false;
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
    }

    private flagActionBar(index: actionBar, enable = true) {
        this.actions[index].disabled = !enable;
    }    

    private fetchInvoice(id: number | string) {
        this.busy = true;
        this.supplierInvoiceService.Get(id, ['Supplier.Info', 'JournalEntry.DraftLines.Account,JournalEntry.DraftLines.VatType']).subscribe(result => {
            this.busy = false;
            this.current = result;
            this.setupToolbar();
            this.tabService.currentActiveTab.name = trimLength(this.toolbarConfig.title, 12);
            this.flagActionBar(actionBar.delete, this.current.StatusCode <= StatusCodeSupplierInvoice.Draft);
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

    public onSaveDraftForImage() {
        this.save((msg) => {
            this.toast.addToast('Add image now!', ToastType.good, 3);
        });
    }

    public save(done) {
        this.preSave();
        return new Promise((resolve, reject) => {
            var obs: any;
            if (this.current.ID) {
                obs = this.supplierInvoiceService.Put(this.current.ID, this.current);                
            } else {
                obs = this.supplierInvoiceService.Post(this.current);
            }
            obs.subscribe((result) => {
                done(lang.save_success);
                // this.current = result;
                this.busy = true;
                this.fetchInvoice(result.ID);
                this.currentSupplierID = this.current.ID;
            }, (error) => {
                var msg = error.statusText;
                if (error._body) {
                    msg = error._body;
                    this.showErrMsg(msg, true);
                } else {
                    this.toast.addToast(lang.save_error, ToastType.bad, 7);
                }
                done(lang.save_error + ': ' + msg);
                reject(msg);
            });
        });
    }

    private preSave() {
        // Auto-set "paymentinformation" from invoicenumber (if kid not set): 
        if ((!this.current.PaymentID) && (!this.current.PaymentInformation)) {
            if (this.current.InvoiceNumber) {
                this.current.PaymentInformation = lang.headliner_invoice + this.current.InvoiceNumber;
            }
        }
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
            // shortcut (F3) ?
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
