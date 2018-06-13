import {ViewChild, Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTableColumn, UniTableColumnType, UniTableConfig, UniTable} from '../../../../framework/ui/unitable/index';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {URLSearchParams} from '@angular/http';
import {ActivatedRoute} from '@angular/router';
import {Router} from '@angular/router';
import {JournalEntryData} from '../../../models/models';
import {
    SupplierInvoice,
    StatusCodeSupplierInvoice,
    CompanySettings,
    ApprovalStatus
} from '../../../unientities';
import {safeInt} from '../../common/utils/utils';
import {UniAssignModal, AssignDetails} from './detail/assignmodal';
import {UniModalService, UniConfirmModalV2, ConfirmActions} from '../../../../framework/uni-modal';
import {
    ApprovalService,
    SupplierInvoiceService,
    IStatTotal,
    ErrorService,
    PageStateService,
    CompanySettingsService,
    UserService,
    JournalEntryService
} from '../../../services/services';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {ImageModal} from '../../common/modals/ImageModal';
import {
  UniImageSize,
  UniImage
} from '../../../../framework/uniImage/uniImage';
import * as moment from 'moment';
import { FieldType } from '../../../../framework/ui/uniform/field-type.enum';
import { Observable, BehaviorSubject } from 'rxjs';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../framework/save/save';

interface ILocalValidation {
    success: boolean;
    errorMessage?: string;
}

interface IFilter {
    name: string;
    label: string;
    count?: number;
    total?: number;
    filter?: string;
    showStatus?: boolean;
    showJournalID?: boolean;
    route?: string;
    onDataReady?: (data) => void;
    passiveCounter?: boolean;
    hotCounter?: boolean;
}

interface ISearchParams {
    userID?: number;
}

@Component({
    selector: 'uni-bills',
    templateUrl: './bills.html'
})
export class BillsView implements OnInit {
    @ViewChild(UniTable) private unitable: UniTable;
    @ViewChild(UniImage) public uniImage: UniImage;

    public searchControl: FormControl = new FormControl('');

    public tableConfig: UniTableConfig;
    public listOfInvoices: Array<any> = [];
    public busy: boolean = true;
    public loadingPreview: boolean = false;
    public totals: { grandTotal: number } = { grandTotal: 0 };
    public searchTotals: { grandTotal: number, count: number } = { grandTotal: 0, count: 0 };
    public currentFilter: IFilter;
    private preSearchFilter: IFilter;

    private hasQueriedInboxCount: boolean = false;
    private startupWithSearchText: string;
    private hasQueriedTotals: boolean = false;
    private startupPage: number = 0;

    private companySettings: CompanySettings;
    private baseCurrencyCode: string;
    public currentUserFilter: string;
    public selectedItems: SupplierInvoice[];
    private fileID: any;
    public currentFiles: any;

    public previewVisible: boolean;

    public searchParams$: BehaviorSubject<ISearchParams> = new BehaviorSubject({});
    public assigneeFilterField: any = {
        Property: 'ID',
        FieldType: FieldType.AUTOCOMPLETE,
        Placeholder: 'Tildelt til',
        Options: {
            displayProperty: 'DisplayName',
            valueProperty: 'ID',
            minLength: 0,
            debounceTime: 200,
            getDefaultData: () => {
                const params = this.pageStateService.getPageState();
                if (params && params.assignee) {
                    return this.userService.Get(params.assignee).map(user => [user]);
                }
                return Observable.of([]);
            },
            search: (query: string) => {
                return this.userService.GetAll(`filter=contains(DisplayName, '${query}')`);
            },
        }
    };

    public activeFilterIndex: number;
    public filters: Array<IFilter> = [
        {
            label: 'Innboks',
            name: 'Inbox',
            route: 'filetags/IncomingMail|IncomingEHF|IncomingTravel|IncomingExpense/0?action=get-supplierInvoice-inbox',
            onDataReady: (data) => this.onInboxDataReady(data),
            hotCounter: true
        },
        {
            label: 'Kladd', name: 'Draft',
            filter: 'isnull(statuscode,'
                + StatusCodeSupplierInvoice.Draft
                + ') eq '
                + StatusCodeSupplierInvoice.Draft,
            passiveCounter: true
        },
        {
            label: 'Avvist',
            name: 'Rejected',
            filter: 'isnull(statuscode,' +
            StatusCodeSupplierInvoice.Rejected + ') eq ' +
            StatusCodeSupplierInvoice.Rejected,
            passiveCounter: true
        },
        {
            label: 'Tildelt',
            name: 'ForApproval',
            filter: 'statuscode eq ' +
            StatusCodeSupplierInvoice.ForApproval,
            passiveCounter: true
        },
        {
            label: 'Godkjent',
            name: 'Approved',
            filter: 'statuscode eq ' + StatusCodeSupplierInvoice.Approved,
            passiveCounter: true
        },
        {
            label: 'Bokført',
            name: 'Journaled',
            filter: 'statuscode eq ' + StatusCodeSupplierInvoice.Journaled,
            showJournalID: true,
            passiveCounter: true
        },
        {
            label: 'Betalingsliste',
            name: 'ToPayment',
            filter: 'statuscode eq ' + StatusCodeSupplierInvoice.ToPayment,
            showJournalID: true,
            passiveCounter: true
        },
        {
            label: 'Betalt',
            name: 'Paid',
            filter: 'statuscode eq '
                + StatusCodeSupplierInvoice.Payed
                + ' or statuscode eq '
                + StatusCodeSupplierInvoice.PartlyPayed,
            showStatus: true,
            showJournalID: true,
            passiveCounter: true
        },
        {
            label: 'Alle',
            name: 'All',
            filter: '',
            showStatus: true,
            showJournalID: true,
            passiveCounter: true
        }
    ];

    public saveActions: IUniSaveAction[] = [{
        label: 'Nytt fakturamottak',
        action: (completeEvent) => setTimeout(this.onAddNew()),
        main: true,
        disabled: false
    }];

    public toolbarConfig: IToolbarConfig = {
        title: 'Fakturamottak'
    };

    constructor(
        private tabService: TabService,
        private supplierInvoiceService: SupplierInvoiceService,
        private toast: ToastService,
        private route: ActivatedRoute,
        private router: Router,
        private browserStorage: BrowserStorageService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private pageStateService: PageStateService,
        private modalService: UniModalService,
        private userService: UserService,
        private approvalService: ApprovalService,
        private journalEntryService: JournalEntryService
    ) {
        tabService.addTab({
            name: 'Fakturamottak',
            url: '/accounting/bills',
            moduleID: UniModules.Bills,
            active: true
        });

        this.checkPath();
    }

    public ngOnInit() {
        this.companySettingsService.Get(1).subscribe(settings => {
            this.companySettings = settings;
            if (this.companySettings && this.companySettings.BaseCurrencyCode) {
                this.baseCurrencyCode = this.companySettings.BaseCurrencyCode.Code;
            }
            if (this.startupWithSearchText) {
                this.refreshWihtSearchText(this.filterInput(this.startupWithSearchText));
            } else {
                this.refreshList(this.currentFilter, true);
            }
            this.updateSaveActions(0);

            this.searchControl.valueChanges
                .debounceTime(300)
                .subscribe((value: string) => {
                    const v = this.filterInput(value);
                    this.startupWithSearchText = v;
                    this.refreshWihtSearchText(v);
                });

        }, err => this.errorService.handle(err));
    }


    public onFormFilterChange(event) {
        console.log(event);
        this.currentUserFilter = event.ID.currentValue;
        this.refreshList(this.currentFilter, true, null, this.currentUserFilter);

        if (this.currentUserFilter) {
            this.pageStateService.setPageState('assignee', this.currentUserFilter);
        } else {
            this.pageStateService.deletePageState('assignee');
        }

    }

    public onRowSelectionChanged() {
        this.selectedItems = this.unitable.getSelectedRows();
        if (this.selectedItems && this.selectedItems.length > 0) {
            const status = this.selectedItems[0].StatusCode;
            let warn = false;
            this.selectedItems.forEach(inv => {
                if (inv.StatusCode !== status) {
                    warn = true;
                }
            });

            if (warn) {
                this.toast.addToast('Du kan bare massebehandle fakturaer med lik status', ToastType.warn, 4);
                this.updateSaveActions(0);
            } else {
                this.updateSaveActions(status);
            }
        } else {
            this.updateSaveActions(0);
        }
    }

    private updateSaveActions(supplierInvoiceStatusCode: number) {
        this.saveActions = [];

        this.saveActions.push ({
            label: 'Nytt fakturamottak',
            action: (completeEvent) => setTimeout(this.onAddNew()),
            main: false,
            disabled: false
        });

        if (supplierInvoiceStatusCode === StatusCodeSupplierInvoice.Draft) {
            this.saveActions.push({
                label: 'Tildel',
                action: (done) => setTimeout(this.assignSupplierInvoices(done)),
                main: true,
                disabled: false
            });
        }

        if (supplierInvoiceStatusCode === StatusCodeSupplierInvoice.ForApproval) {
            this.saveActions.push({
                label: 'Godkjenn',
                action: (done) => setTimeout(this.approveSupplierInvoices(done)),
                main: true,
                disabled: false
            });

            this.saveActions.push({
                label: 'Avvis',
                action: (done) => setTimeout(this.rejectSupplierInvoices(done)),
                main: false,
                disabled: false
            });
        }

        if (supplierInvoiceStatusCode === StatusCodeSupplierInvoice.Rejected) {
            this.saveActions.push({
                label: 'Tildel',
                action: (done) => setTimeout(this.assignSupplierInvoices(done)),
                main: true,
                disabled: false
            });
        }

        if (supplierInvoiceStatusCode === StatusCodeSupplierInvoice.Approved) {
            this.saveActions.push({
                label: 'Bokfør',
                action: (done) => setTimeout(this.journalSupplierInvoies(done)),
                main: true,
                disabled: false
            });
        }

        if (supplierInvoiceStatusCode === StatusCodeSupplierInvoice.Journaled) {
            this.saveActions.push({
                label: 'Til betalingsliste',
                action: (done) => setTimeout(this.sendForPaymentSupplierInvoices(done)),
                main: true,
                disabled: false
            });
        }

        if (supplierInvoiceStatusCode === StatusCodeSupplierInvoice.Journaled) {
            this.saveActions.push({
                label: 'Krediter',
                action: (done) => setTimeout(this.creditSupplierInvoice(done)),
                main: false,
                disabled: false
            });
        }
    }

    public onFileSplitCompleted() {
        // the previously selected file will be deleted after splitting it, so reset the file selection
        this.fileID = null;
        this.previewVisible = false;

        // also refresh the list, because we will most likely have multiple new files now
        this.refreshList(this.currentFilter);
    }

    public onImageClicked(file: any) {
        const data = {
            entity: 'SupplierInvoice',
            entityID: this.currentFiles[0].ID || 0,
            fileIDs: null,
            showFileID: file.ID,
            readonly: true,
            size: UniImageSize.large
        };

        if (this.currentFiles) {
            data.fileIDs = this.currentFiles.map(f => f.FileID);
        }
        this.modalService.open(ImageModal, { data: data });
    }

    public assignSupplierInvoices(done: any) {
        this.modalService.open(UniAssignModal).onClose.subscribe(details => {
            if (details) {
                this.onAssignSupplierInvoicesClickOk(details);
            }
        });
        done();
    }

    public onAssignSupplierInvoicesClickOk(details: AssignDetails) {
        const assignRequests = this.selectedItems.map(invoice =>
            this.supplierInvoiceService.assign(invoice.ID, details)
            .map(res => ({ ID: invoice.ID, success: true}))
            .catch(err => Observable.of({ID: invoice.ID, success: false}))
        );

        Observable.forkJoin(assignRequests).subscribe(
            res => {
                this.refreshList(this.currentFilter, true, null, this.currentUserFilter);
                const numberOfFailed = res.filter(r => !r.success).length;
                if (numberOfFailed > 0) {
                    this.toast.addToast(
                        this.selectedItems.length
                            - numberOfFailed + ' fakturaer ble tildelt'
                            + '<BR/>' + numberOfFailed + ' fakturaer feilet ved tildeling.',
                        ToastType.bad,
                        3
                    );
                    this.selectedItems = null;
                } else {
                    this.toast.addToast(
                        this.selectedItems.length - numberOfFailed + ' fakturaer ble tildelt', ToastType.good, 3
                    );
                }
                this.updateSaveActions(0);
            },
            err => {
                this.errorService.handle(err);
                this.updateSaveActions(0);
            }
        );
    }

    public approveSupplierInvoices(done: any) {


        // first of all - load approvals
        this.approvalService.invalidateCache();
        this.userService.getCurrentUser().subscribe(res => {
                let filterString = 'filter=UserID eq ' + res.ID;
                filterString += ' and StatusCode eq ' + ApprovalStatus.Active;

                if (this.selectedItems.length > 0) {
                    filterString += ' and (';
                    this.selectedItems.forEach(inv => {
                        filterString += ' Task.EntityID eq ' + inv.ID + ' or';
                    });
                    filterString = filterString.substr(0, filterString.length - 2) + ')';
                }

                this.approvalService.GetAll(filterString, ['Task.Model']).subscribe(

                    approvals => {
                        const approvalsRequests = approvals.map(app =>
                            this.approvalService.PostAction(app.ID, 'approve')
                                .map(res2 => ({ ID: app.ID, success: true}))
                                .catch(err => Observable.of({ID: app.ID, success: false}))
                            );

                        Observable.forkJoin(approvalsRequests).subscribe(
                            approvalResponses => {
                                this.refreshList(this.currentFilter, true, null, this.currentUserFilter);
                                const numberOfFailed = approvalResponses
                                    .filter((response: any) => !response.success).length;
                                if (numberOfFailed > 0) {
                                    this.toast.addToast(
                                        this.selectedItems.length
                                            - numberOfFailed + ' fakturaer ble godkjent. '
                                            +  numberOfFailed + ' fakturaer feilet ved godkjenning. '
                                            + 'Merk også at fakturaer du ikke const tildelt ble ignorert.',
                                        ToastType.bad,
                                        3
                                    );
                                    this.selectedItems = null;
                                } else {
                                    this.toast.addToast(
                                        this.selectedItems.length - numberOfFailed + ' fakturaer ble godkjent',
                                        ToastType.good,
                                        3
                                    );
                                }
                                this.updateSaveActions(0);
                            },
                            err => {
                                this.errorService.handle(err);
                                this.updateSaveActions(0);
                            }
                        );
                    });


                },

                err => this.errorService.handle(err)
            );

        done();
    }

    public rejectSupplierInvoices(done: any) {


                // first of all - load approvals
                this.approvalService.invalidateCache();
                this.userService.getCurrentUser().subscribe(res => {
                        let filterString = 'filter=UserID eq ' + res.ID;
                        filterString += ' and StatusCode eq ' + ApprovalStatus.Active;

                        if (this.selectedItems.length > 0) {
                            filterString += ' and (';
                            this.selectedItems.forEach(inv => {
                                filterString += ' Task.EntityID eq ' + inv.ID + ' or';
                            });
                            filterString = filterString.substr(0, filterString.length - 2) + ')';
                        }

                        this.approvalService.GetAll(filterString, ['Task.Model']).subscribe(

                            approvals => {
                                const approvalRequests = approvals.map(app =>
                                    this.approvalService.PostAction(app.ID, 'reject')
                                        .map(res2 => ({ ID: app.ID, success: true}))
                                        .catch(err => Observable.of({ID: app.ID, success: false}))
                                    );

                                Observable.forkJoin(approvalRequests).subscribe(
                                    approvalResponses => {
                                        this.refreshList(this.currentFilter, true, null, this.currentUserFilter);
                                        const numberOfFailed = approvalResponses
                                           .filter((response: any) => !response.success).length;
                                        if (numberOfFailed > 0) {
                                            this.toast.addToast(
                                                this.selectedItems.length
                                                    - numberOfFailed + ' fakturaer ble avvist. '
                                                    +  numberOfFailed + ' fakturaer feilet ved avvising. '
                                                    + 'Merk også at fakturaer du ikke const tildelt ble ignorert.',
                                                ToastType.bad,
                                                3
                                            );
                                            this.selectedItems = null;
                                        } else {
                                            this.toast.addToast(
                                                this.selectedItems.length - numberOfFailed + ' fakturaer ble avsist',
                                                ToastType.good,
                                                3
                                            );
                                        }
                                        this.updateSaveActions(0);
                                    },
                                    err => {
                                        this.errorService.handle(err);
                                        this.updateSaveActions(0);
                                    }
                                );
                            });
                        },
                        err => this.errorService.handle(err)
                    );
                done();
            }


    public creditSupplierInvoice(done: any) {

        const modal = this.modalService.open(UniConfirmModalV2, {
            header: 'Kreditere faktura?',
            message: 'Vil du kreditere bokføringen for fakturaen(e)? '
                + 'Fakturaen(e) vil settes tilbake til forrige status. '
        });

        modal.onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                const creditRequests = this.selectedItems.map(invoice =>
                    this.supplierInvoiceService.creditInvoiceJournalEntry(invoice.ID)
                    .map(res => ({ ID: invoice.ID, success: true}))
                    .catch(err => Observable.of({ID: invoice.ID, success: false}))
                );

                Observable.forkJoin(creditRequests).subscribe(
                    res => {
                        this.refreshList(this.currentFilter, true, null, this.currentUserFilter);
                        const numberOfFailed = res.filter(r => !r.success).length;
                        if (numberOfFailed > 0) {
                            this.toast.addToast(
                                this.selectedItems.length
                                    - numberOfFailed + ' fakturaer ble kreditert.'
                                    + '<BR/>' + numberOfFailed + ' fakturaer feilet.',
                                ToastType.bad,
                                3
                            );
                        } else {
                            this.toast.addToast(
                                this.selectedItems.length - numberOfFailed + ' fakturaer ble kreditert.',
                                ToastType.good,
                                3
                            );
                        }
                        this.selectedItems = null;
                        this.updateSaveActions(0);
                        done();
                    },
                    err => {
                        this.errorService.handle(err);
                        this.updateSaveActions(0);
                        done();
                    }
                );
            } else {
                this.refreshList(this.currentFilter);
                done();
            }
        });
    }

    public sendForPaymentSupplierInvoices(done: any) {
        const payRequests = this.selectedItems.map(invoice =>
            this.supplierInvoiceService.sendForPayment(invoice.ID)
            .map(res => ({ ID: invoice.ID, success: true}))
            .catch(err => Observable.of({ID: invoice.ID, success: false}))
        );

        Observable.forkJoin(payRequests).subscribe(
            res => {
                this.refreshList(this.currentFilter, true, null, this.currentUserFilter);
                const numberOfFailed = res.filter(r => !r.success).length;
                if (numberOfFailed > 0) {
                    this.toast.addToast(
                        this.selectedItems.length
                            - numberOfFailed + ' fakturaer ble sendt til betalingsliste.'
                            + '<BR/>' + numberOfFailed + ' fakturaer feilet.',
                        ToastType.bad,
                        3
                    );
                } else {
                    this.toast.addToast(
                        this.selectedItems.length - numberOfFailed + ' fakturaer ble sendt til betalingsliste.',
                        ToastType.good,
                        3
                    );
                }
                this.selectedItems = null;
                this.updateSaveActions(0);
                done();
            },
            err => {
                this.errorService.handle(err);
                this.updateSaveActions(0);
                done();
            }
        );
    }

    public journalSupplierInvoies(done: any) {
        const journalRequests = this.selectedItems.map(invoice =>
            this.supplierInvoiceService.journal(invoice.ID)
            .map(res => ({ ID: invoice.ID, success: true}))
            .catch(err => Observable.of({ID: invoice.ID, success: false}))
        );

        Observable.forkJoin(journalRequests).subscribe(
            res => {
                this.refreshList(this.currentFilter, true, null, this.currentUserFilter);
                const numberOfFailed = res.filter(r => !r.success).length;
                if (numberOfFailed > 0) {
                    this.toast.addToast(
                        this.selectedItems.length
                            - numberOfFailed + ' fakturaer ble bokført.' + '<BR/>'
                            + numberOfFailed + ' fakturaer feilet ved bokføring.',
                        ToastType.bad,
                        3
                    );
                    this.selectedItems = null;
                } else {
                    this.toast.addToast(
                        this.selectedItems.length - numberOfFailed + ' fakturaer ble bokført.', ToastType.good, 3
                    );
                }
                this.selectedItems = null;
                this.updateSaveActions(0);
                done();
            },
            err => {
                this.errorService.handle(err);
                this.updateSaveActions(0);
                done();
            }
        );
    }

    private refreshWihtSearchText(value: string) {
        const allFilter = this.filters.find(x => x.name === 'All');
        if (value || value === '') {
            const sFilter = this.createFilters(value, 'Info.Name', 'TaxInclusiveAmount', 'InvoiceNumber', 'ID');
            if (this.currentFilter.name !== allFilter.name) { this.preSearchFilter = this.currentFilter; }
            this.onFilterClick(allFilter, sFilter);
        } else {
            if (this.preSearchFilter) {
                this.onFilterClick(this.preSearchFilter);
            }
        }
    }

    private createFilters(value: string, ...args: any[]): string {
        let result = '';
        args.forEach((x, i) => {
            result += (i > 0 ? ' or ' : '') + `startswith(${x},'${value}')`;
        });
        return result;
    }

    private filterInput(v) {
        return v.replace(/[`~!@#$%^&*()_|+\=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    }

    private refreshList(
        filter?: IFilter,
        refreshTotals: boolean = false,
        searchFilter?: string,
        filterOnUserID?: string
    ) {
        this.busy = true;
        const params = new URLSearchParams();
        if (filter && filter.filter) {
            params.set('filter', filter.filter + ((searchFilter ? ' and ' : '') + (searchFilter || '')));
        } else if (searchFilter) {
            params.set('filter', searchFilter);
        }
        this.currentFilter = filter;
        if (filter.route) {
            this.hasQueriedInboxCount = filter.name === 'Inbox';
        }
        const obs = filter.route
            ?  this.supplierInvoiceService.fetch(filter.route)
            : this.supplierInvoiceService.getInvoiceList(params, this.currentUserFilter);
        obs.subscribe((result) => {
            if (filter.onDataReady) {
                filter.onDataReady(result);
            } else {
                this.listOfInvoices = result;
                this.makeSearchTotals();
                this.tableConfig = this.createTableConfig(filter);
                this.totals.grandTotal = filter.total || this.totals.grandTotal;
            }
            this.busy = false;

            this.QueryInboxTotals();
        }, err => this.errorService.handle(err));
        if (refreshTotals) {
            this.refreshTotals();
        }

        // Set initial page ?
        if (this.startupPage > 1) {
            setTimeout(() => {
                this.unitable.goToPage(this.startupPage);
                this.startupPage = 0;
            }, 200);
        }
    }

    private makeSearchTotals() {
        let sum = 0;
        if (this.listOfInvoices && this.listOfInvoices.length > 0) {
            this.listOfInvoices.forEach(x => {
                sum += x.TaxInclusiveAmount || 0;
            });
            this.searchTotals.grandTotal = sum;
            this.searchTotals.count = this.listOfInvoices.length;
        } else {
            this.searchTotals.grandTotal = 0;
            this.searchTotals.count = 0;
        }
    }

    private QueryInboxTotals(): boolean {
        if (this.hasQueriedInboxCount) {
            return false;
        }
        this.hasQueriedInboxCount = true;
        const route = '?model=filetag&select=count(id)&filter=(tagname eq \'IncomingMail\' '
            + 'or tagname eq \'IncomingEHF\' or tagname eq \'IncomingTravel\' '
            + 'or tagname eq \'IncomingExpense\') and status eq 0 '
            + 'and deleted eq 0 and file.deleted eq 0&join=filetag.fileid eq file.id';
        this.supplierInvoiceService.getStatQuery(route).subscribe(data => {
            const filter = this.getInboxFilter();
            if (filter && data && data.length > 0) {
                filter.count = data[0].countid;
            }
        }, err => this.errorService.handle(err));
    }

    private getInboxFilter(): IFilter {
        return this.filters.find(x => x.name === 'Inbox');
    }

    private removeNullItems(data: Array<any>) {
        const n = data ? data.length : 0;
        if (n > 0) {
            for (let i = n - 1; i--; i >= 0) {
                if (data[i] === null) {
                    data.splice(i, 1);
                }
            }
        }
    }

    public onInboxDataReady(data: Array<any>) {
        this.removeNullItems(data);
        this.listOfInvoices = data;
        const filter = this.getInboxFilter();
        if (filter) {
            filter.count = data ? data.length : 0;
            filter.total = 0;
        }
        if (this.totals) { this.totals.grandTotal = 0; }
        const cols = [
            new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number)
                .setWidth('4rem')
                .setFilterOperator('startswith'),
            new UniTableColumn('Name', 'Filnavn')
                .setWidth('18rem')
                .setFilterOperator('startswith'),
            new UniTableColumn('Description', 'Tekst')
                .setFilterOperator('contains'),
            new UniTableColumn('Size', 'Størrelse', UniTableColumnType.Number)
                .setVisible(false)
                .setWidth('6rem')
                .setFilterOperator('startswith'),
            new UniTableColumn('Source', 'Kilde', UniTableColumnType.Lookup)
                .setWidth('6rem')
                .setFilterOperator('startswith')
                .setTemplate((rowModel) => {
                    if (rowModel.FileTags) {
                        switch (rowModel.FileTags[0].TagName) {
                            case 'IncomingMail': return 'E-post';
                            case 'IncomingEHF': return 'EHF';
                            case 'IncomingTravel': return 'Reise';
                            case 'IncomingExpense': return 'Utlegg';
                        }
                    }
                    return '';
            }),
        ];
        const cfg = new UniTableConfig('accounting.bills.inboxTable', false, true)
            .setSearchable(true)
            .setMultiRowSelect(false)
            .setColumns(cols)
            .setPageSize(this.calculatePagesize())
            .setColumnMenuVisible(true)
            .setDeleteButton(true);
        this.tableConfig = cfg;
    }

    private refreshTotals() {
        this.supplierInvoiceService.getInvoiceListGroupedTotals(this.currentUserFilter)
            .subscribe((result: Array<IStatTotal>) => {
                this.hasQueriedTotals = true;
                this.filters.forEach(x => { if (x.name !== 'Inbox') { x.count = 0; x.total = 0; } });
                let count = 0;
                let total = 0;
                if (result) {
                    result.forEach(x => {
                        count += x.countid;
                        total += x.sumTaxInclusiveAmount;
                        const statusCode = x.SupplierInvoiceStatusCode ? x.SupplierInvoiceStatusCode.toString() : '0';
                        const ix = this.filters.findIndex(y => y.filter ? y.filter.indexOf(statusCode) > 0 : false);
                        if (ix >= 0) {
                            this.filters[ix].count += x.countid;
                            this.filters[ix].total += x.sumTaxInclusiveAmount;
                        }
                    });
                }
                const ixAll = this.filters.findIndex(x => x.name === 'All');
                this.filters[ixAll].count = count;
                this.filters[ixAll].total = total;
                this.totals.grandTotal = this.filters[this.activeFilterIndex].total;
            }, err => this.errorService.handle(err));
    }

    private createTableConfig(filter: IFilter): UniTableConfig {
        const cols = [
            new UniTableColumn('InvoiceNumber', 'Fakturanr.').setWidth('8%'),
            new UniTableColumn('SupplierSupplierNumber', 'Lev.nr.').setVisible(false).setWidth('5em'),
            new UniTableColumn('InfoName', 'Leverandør', UniTableColumnType.Text)
                .setFilterOperator('startswith')
                .setWidth('15em'),
            new UniTableColumn('InvoiceDate', 'Fakturadato', UniTableColumnType.LocalDate)
                .setWidth('10%')
                .setFilterOperator('eq'),
            new UniTableColumn('PaymentDueDate', 'Forfall', UniTableColumnType.LocalDate).setWidth('10%')
                .setFilterOperator('eq')
                .setConditionalCls((item) => {
                    const paid = item.StatusCode === StatusCodeSupplierInvoice.Payed;
                    return (paid || moment(item.PaymentDueDate).isBefore(moment()))
                        ? 'supplier-invoice-table-payment-overdue' : 'supplier-invoice-table-payment-ok';
                }),
            new UniTableColumn('BankAccountAccountNumber', 'Bankgiro').setWidth('10%'),
            new UniTableColumn('PaymentID', 'KID/Melding').setWidth('10%')
                .setTemplate((item) => item.PaymentInformation || item.PaymentID),
            new UniTableColumn('JournalEntryJournalEntryNumber', 'Bilagsnr.')
                .setWidth('8%')
                .setVisible(!!filter.showJournalID)
                .setFilterOperator('startswith')
                .setLinkResolver(row => `/accounting/transquery;JournalEntryNumber=${row.JournalEntryJournalEntryNumber}`),

            new UniTableColumn('CurrencyCodeCode', 'Valuta', UniTableColumnType.Text)
                .setWidth('5%')
                .setFilterOperator('eq')
                .setVisible(false),
            new UniTableColumn('TaxInclusiveAmountCurrency', 'Beløp', UniTableColumnType.Money).setWidth('7em')
                .setFilterOperator('contains')
                .setConditionalCls(item =>
                    item.TaxInclusiveAmountCurrency >= 0
                        ? 'supplier-invoice-table-plus'
                        : 'supplier-invoice-table-minus'
                ),
            new UniTableColumn('Assignees', 'Tildelt/Godkjent av').setVisible(true),
            new UniTableColumn('ProjectName', 'Prosjektnavn').setVisible(false),
            new UniTableColumn('ProjectProjectNumber', 'Prosjektnr.').setVisible(false),
            new UniTableColumn('DepartmentName', 'Avdelingsnavn').setVisible(false),
            new UniTableColumn('DepartmentDepartmentNumber', 'Avd.nr.').setVisible(false),
            new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number)
                .setVisible(!!filter.showStatus)
                .setAlignment('center')
                .setTemplate((dataItem) => {
                    return this.supplierInvoiceService.getStatusText(dataItem.StatusCode);
                }).setWidth('8%'),
        ];
        return new UniTableConfig('accounting.bills.mainTable', false, true)
            .setSearchable(true)
            .setMultiRowSelect(true)
            .setColumns(cols)
            .setPageSize(this.calculatePagesize())
            .setColumnMenuVisible(true);
    }

    public onRowSelected(event) {
        const item = event.rowModel;
        this.currentFiles = item.FileTags ? item.FileTags : null;
        if (item) {
            if (this.currentFilter.name === 'Inbox') {
                this.previewDocument(item);
            } else {
                this.router.navigateByUrl('/accounting/bills/' + item.ID);
            }
        }
    }

    public onPageChange(page) {
        this.pageStateService.setPageState('page', page);
    }

    public onRowDeleted(row) {
        if (this.currentFilter.name === 'Inbox') {
            this.currentFilter.count--;
            const fileId = row.ID;
            if (fileId) {
                const modal = this.modalService.open(UniConfirmModalV2, {
                    header: 'Bekreft sletting',
                    message: 'Slett aktuell fil: ' + row.Name
                });

                modal.onClose.subscribe(response => {
                    if (response === ConfirmActions.ACCEPT) {
                        if (this.fileID && this.fileID[0] === fileId) {
                            this.previewVisible = false;
                            this.fileID = null;
                        }
                        this.supplierInvoiceService.send('files/' + fileId, undefined, 'DELETE').subscribe(
                            res => {
                                this.toast.addToast('Filen er slettet', ToastType.good, 2);
                            },
                            err => {
                                this.errorService.handle(err);
                                this.refreshList(this.currentFilter);
                            }
                        );
                    } else {
                        this.refreshList(this.currentFilter);
                    }
                });
            }
        }
    }

    public onAddNew() {
        this.router.navigateByUrl('/accounting/bills/0');
    }

    public onAssignBillsTo() {

    }

    public onFilterClick(filter: IFilter, searchFilter?: string) {
        if (filter.name !== 'Inbox') {
            this.previewVisible = false;
            this.fileID = null;
        }

        this.refreshList(filter, !this.hasQueriedTotals, searchFilter);
        if (searchFilter) {
            this.pageStateService.setPageState('search', this.startupWithSearchText);
        } else {
            this.pageStateService.setPageState('filter', filter.name);
            const index = this.filters.findIndex(f => f.name === filter.name);
            if (index >= 0) {
                this.activeFilterIndex = index;
                this.browserStorage.setItem('bills.defaultFilterIndex', index);
            }
        }
    }



    private checkPath() {
        const params = this.pageStateService.getPageState();
        if (params.filter) {
            const filterIndex = this.filters.findIndex(f => f.name === params.filter);
            if (filterIndex >= 0) {
                this.activeFilterIndex = filterIndex;
                this.currentFilter = this.filters[filterIndex];
            }
        }

        if (params.assignee) {

            if (params.assigneename) {

                // this.searchParams$.next({ID:+params.assignee});

                // this.searchControl.setValue(params.assigneename);

            }
            this.currentUserFilter = params.assignee;
           // this.searchParams$.next({userID:+this.currentUserFilter});

        }

        if (params.search) {
            this.startupWithSearchText = params.search;
            this.searchControl.setValue(this.startupWithSearchText, { emitEvent: false });
        }
        if (params.page) {
            this.startupPage = safeInt(params.page);
        }

        // Default-filter?
        if (this.currentFilter === undefined) {
            const filterIndex = this.browserStorage.getItem('bills.defaultFilterIndex') || 0;
            this.activeFilterIndex = filterIndex;
            this.currentFilter = this.filters[filterIndex] || this.filters[0];
        }
    }

    private previewDocument(item) {
        // document.getElementById('preview_container_id').style.display = 'block';
        this.previewVisible = true;
        this.loadingPreview = true;
        this.fileID = [item.ID];
    }

    public onFileListReady(event) {
        this.loadingPreview = false;
    }

    public documentSelected(useWithSupplierInvoice: boolean) {
        if (useWithSupplierInvoice) {
            this.router.navigateByUrl('/accounting/bills/0?fileid=' + this.fileID);
        } else {
            // add a journalentry with the selected file as the first item and redirect
            let journalentries = this.journalEntryService.getSessionData(0);
            if (!journalentries) {
                journalentries = [];
            }
            const newEntry = new JournalEntryData();
            newEntry.FileIDs = this.fileID;
            journalentries.push(newEntry);
            this.journalEntryService.setSessionData(0, journalentries);

            this.router.navigateByUrl('/accounting/journalentry/manual');
        }
    }

    private calculatePagesize(): number {
        let pageSize = window.innerHeight // Window size
        - 76 // Navbar + margin
        - 208 // Body margin and padding
        - 32 // Application class margin
        - 88; // Unitable pagination and sum

        pageSize = pageSize <= 33 ? 10 : Math.floor(pageSize / 34); // 34 = heigth of a single row

        return pageSize;
    }
}
