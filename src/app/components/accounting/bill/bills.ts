import {ViewChild, Component, OnInit} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from '../../../../framework/ui/unitable/index';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {HttpParams} from '@angular/common/http';
import {Router} from '@angular/router';
import {JournalEntryData} from '@app/models';
import {
    SupplierInvoice,
    StatusCodeSupplierInvoice,
    ApprovalStatus,
    StatusCodeReInvoice
} from '../../../unientities';
import {BillAssignmentModal} from './assignment-modal/assignment-modal';
import {UniModalService, UniConfirmModalV2, ConfirmActions, UniReinvoiceModal} from '../../../../framework/uni-modal';
import {
    ApprovalService,
    SupplierInvoiceService,
    AssignmentDetails,
    IStatTotal,
    ErrorService,
    PageStateService,
    UserService,
    JournalEntryService,
    FileService,
    ReInvoicingService,
    BrowserStorageService
} from '../../../services/services';
import {UniImage} from '../../../../framework/uniImage/uniImage';
import * as moment from 'moment';
import {FieldType} from '../../../../framework/ui/uniform/field-type.enum';
import {Observable, BehaviorSubject, Subject, of as observableOf} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../framework/save/save';
import { BillTransitionModal, BillMassTransition } from './bill-transition-modal/bill-transition-modal';
import {ReInvoiceInfoModal} from './reinvoice-info-modal/reinvoice-info-modal';
import {environment} from 'src/environments/environment';

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
    statusCode?: number;
}

interface ISearchParams {
    userID?: number;
}

@Component({
    selector: 'uni-bills',
    templateUrl: './bills.html'
})
export class BillsView implements OnInit {
    @ViewChild(UniImage) public uniImage: UniImage;

    public loading$: Subject<boolean> = new Subject();

    public tableConfig: UniTableConfig;
    public listOfInvoices: any[] = [];
    public totals: { grandTotal: number } = { grandTotal: 0 };
    public currentFilter: IFilter;

    private hasQueriedInboxCount: boolean = false;
    private hasQueriedTotals: boolean = false;

    public currentUserFilter: string;
    public selectedItems: SupplierInvoice[];
    private fileID: any;

    public previewVisible: boolean;
    private inboxTagNames = ['IncomingMail', 'IncomingEHF', 'IncomingTravel', 'IncomingExpense'];
    private inboxTagNamesFilter = '(' + this.inboxTagNames.map(tag => 'tagname eq \'' + tag + '\'').join(' or ') + ')';
    unpaidQuickFilters = [{
        field: 'StatusCode',
        operator: 'eq',
        value: StatusCodeSupplierInvoice.Journaled,
        selectConfig: {options: [{ ID: 30104, Name: 'Bokført' }], valueField: 'ID', displayField: 'Name'},
        label: 'Se bare bokførte'
    }];
    quickFilters = [];


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
            route: 'filetags/' + this.inboxTagNames.join('|') + '/0?action=get-supplierInvoice-inbox',
            onDataReady: (data) => this.onInboxDataReady(data),
            hotCounter: true
        },
        {
            label: 'Opprettet', name: 'Draft',
            filter: 'isnull(statuscode,'
                + StatusCodeSupplierInvoice.Draft
                + ') eq ' + StatusCodeSupplierInvoice.Draft
                + ' OR statuscode eq ' + StatusCodeSupplierInvoice.Rejected,
            passiveCounter: true,
            statusCode: StatusCodeSupplierInvoice.Draft
        },
        {
            label: 'Tildelt',
            name: 'ForApproval',
            filter: 'statuscode eq ' +
            StatusCodeSupplierInvoice.ForApproval,
            passiveCounter: true,
            statusCode: StatusCodeSupplierInvoice.ForApproval
        },
        {
            label: 'Godkjent',
            name: 'Approved',
            filter: 'statuscode eq ' + StatusCodeSupplierInvoice.Approved,
            passiveCounter: true,
            statusCode: StatusCodeSupplierInvoice.Approved
        },
        {
            label: 'Bokført',
            name: 'Journaled',
            filter: 'statuscode eq ' + StatusCodeSupplierInvoice.Journaled,
            showJournalID: true,
            passiveCounter: true,
            statusCode: StatusCodeSupplierInvoice.Journaled
        },
        {
            label: 'Ubetalt',
            name: 'unpaid',
            filter: 'PaymentStatus eq 30109',
            passiveCounter: true
        },
        {
            label: 'Betalingsliste',
            name: 'issenttopayment',
            filter: 'PaymentStatus eq 30110 OR PaymentStatus eq 30111',
            passiveCounter: true
        },
        {
            label: 'Betalt',
            name: 'paid',
            filter: 'PaymentStatus eq 30112',
            passiveCounter: true
        },
        {
            label: 'Alle',
            name: 'All',
            filter: '',
            showStatus: true,
            showJournalID: true,
            passiveCounter: true,
            statusCode: 0
        }
    ];

    public saveActions: IUniSaveAction[] = [];

    public toolbarConfig: IToolbarConfig = {
        title: 'NAVBAR.SUPPLIER_INVOICE',
        omitFinalCrumb: true,
        buttons: [
            {
                label: 'ACCOUNTING.SUPPLIER_INVOICE.NEW',
                action: () => setTimeout(() => this.onAddNew())
            }
        ]
    };

    isSrEnvironment = environment.isSrEnvironment;

    constructor(
        private tabService: TabService,
        private supplierInvoiceService: SupplierInvoiceService,
        private toast: ToastService,
        private router: Router,
        private errorService: ErrorService,
        private pageStateService: PageStateService,
        private modalService: UniModalService,
        private userService: UserService,
        private approvalService: ApprovalService,
        private journalEntryService: JournalEntryService,
        private fileService: FileService,
        private reInvoicingService: ReInvoicingService,
        private browserStorage: BrowserStorageService
    ) {
        this.tabService.addTab({
            name: 'NAVBAR.SUPPLIER_INVOICE',
            url: this.pageStateService.getUrl(),
            moduleID: UniModules.Bills,
            active: true
        });
    }

    public ngOnInit() {
        // Remove inbox from filters if SR-environment
        if (this.isSrEnvironment) {
            this.filters.shift();
        }

        this.checkPath();
        this.refreshList(this.currentFilter, true);
        this.updateSaveActions();
    }

    public onFormFilterChange(event) {
        this.currentUserFilter = event.ID.currentValue;
        this.refreshList(this.currentFilter, true, null, this.currentUserFilter);

        if (this.currentUserFilter) {
            this.pageStateService.setPageState('assignee', this.currentUserFilter);
        } else {
            this.pageStateService.deletePageState('assignee');
        }

    }

    public onRowClick(item) {
        if (item) {
            if (this.currentFilter.name === 'Inbox') {
                this.previewVisible = true;
                this.fileID = [item.ID];
            } else {
                this.router.navigateByUrl('/accounting/bills/' + item.ID);
            }
        }
    }

    public onRowSelectionChange(selectedItems) {
        this.selectedItems = selectedItems;
        this.updateSaveActions();
    }

    public onRowDelete(row) {
        if (this.currentFilter.name === 'Inbox') {

            const fileId = row.ID;
            if (fileId) {
                this.currentFilter.count--;

                // Check if file is already linked to an entity
                this.fileService.getLinkedEntityID(fileId).subscribe(links => {
                    let modalMessage = 'Vennligst bekreft sletting av fil';

                    if (links.length) {
                        modalMessage = 'ACCOUNTING.SUPPLIER_INVOICE.FILE_IN_USE_MSG';
                    }

                    this.modalService.confirm({
                        header: 'Slett fil',
                        message: modalMessage
                    }).onClose.subscribe(res => {
                        if (res !== ConfirmActions.ACCEPT) {
                            this.refreshList();
                            return;
                        }

                        this.supplierInvoiceService.send('files/' + fileId, undefined, 'DELETE').subscribe(
                            () => this.toast.addToast('Fil slettet', ToastType.good, 2),
                            () => {
                                // tslint:disable-next-line:max-line-length
                                this.fileService.getStatistics('model=filetag&select=id,tagname as tagname&top=1&orderby=ID asc&filter=deleted eq 0 and fileid eq ' + fileId  + ' and ' + this.inboxTagNamesFilter).subscribe(
                                    tags => {
                                        this.fileService.tag(fileId, tags.Data[0].tagname, 90000).subscribe(() => {
                                            this.toast.addToast('Fil fjernet fra innboks', ToastType.good, 2);
                                        }, err => {
                                            this.errorService.handle(err);
                                            this.refreshList(this.currentFilter);
                                        });
                                    }, err => {
                                        this.errorService.handle(err);
                                        this.refreshList(this.currentFilter);
                                    }
                                );
                            }
                        );
                    });
                });
            }
        }
    }

    private updateSaveActions() {
        const selectedRowCount = this.selectedItems && this.selectedItems.length || 0;
        this.saveActions = [];

        let showToPaymentMenu = true;
        if (this.selectedItems && Array.isArray(this.selectedItems)) {
            this.selectedItems.forEach(invoice => {
                if (invoice.PaymentStatus === 30110 || invoice.PaymentStatus === 30112) {
                    showToPaymentMenu = false;
                }
            });
        }

        if ( this.currentFilter.statusCode === StatusCodeSupplierInvoice.Draft ) {
            this.saveActions.push({
                label: `Bokfør (${selectedRowCount} stk.)`,
                action: (done) => this.massTransition(BillMassTransition.Journal, done),
                main: true,
                disabled: selectedRowCount === 0
            });

            this.saveActions.push({
                label: 'Tildel',
                action: (done) => setTimeout(() => this.assignSupplierInvoices(done)),
                main: false,
                disabled: selectedRowCount === 0
            });
        }

        if (this.currentFilter.statusCode === StatusCodeSupplierInvoice.Rejected) {
            this.saveActions.push({
                label: 'Tildel',
                action: (done) => setTimeout(() => this.assignSupplierInvoices(done)),
                main: false,
                disabled: selectedRowCount === 0
            });
        }

        if (this.currentFilter.statusCode === StatusCodeSupplierInvoice.ForApproval) {
            this.saveActions.push({
                label: 'Godkjenn',
                action: (done) => setTimeout(() => this.approveSupplierInvoices(done)),
                main: true,
                disabled: selectedRowCount === 0
            });

            this.saveActions.push({
                label: 'Avvis',
                action: (done) => setTimeout(() => this.rejectSupplierInvoices(done)),
                main: false,
                disabled: selectedRowCount === 0
            });
        }

        if (this.currentFilter.statusCode === StatusCodeSupplierInvoice.Approved) {
            this.saveActions.push({
                label: `Bokfør (${selectedRowCount} stk.)`,
                action: (done) => this.massTransition(BillMassTransition.Journal, done),
                main: true,
                disabled: selectedRowCount === 0
            });
            if (showToPaymentMenu) {
                this.saveActions.push({
                    label: `Bokfør og til betaling (${selectedRowCount} stk.)`,
                    action: (done) => this.massTransition(BillMassTransition.JournalAndToPayment, done),
                    disabled: selectedRowCount === 0
                });
            }
        }

        if (this.currentFilter.statusCode === StatusCodeSupplierInvoice.Journaled || this.currentFilter.name === 'unpaid') {
            if (showToPaymentMenu) {
                this.saveActions.push({
                    label: `Til betalingsliste (${selectedRowCount} stk)`,
                    action: (done) => this.massTransition(BillMassTransition.ToPayment, done),
                    main: true,
                    disabled: selectedRowCount === 0
                });
            }
        }

        if (this.currentFilter.statusCode === StatusCodeSupplierInvoice.Journaled) {
            this.saveActions.push({
                label: 'Krediter',
                action: (done) => setTimeout(() => this.creditSupplierInvoice(done)),
                main: false,
                disabled: selectedRowCount === 0
            });
        }
    }

    private massTransition(transition: BillMassTransition, doneCallback) {
        this.modalService.open(BillTransitionModal, {
            hideCloseButton: true,
            closeOnClickOutside: false,
            closeOnEscape: false,
            data: {
                transition: transition,
                invoices: this.selectedItems
            }
        }).onClose.subscribe(() => {
            this.refreshList(this.currentFilter, true, null, this.currentUserFilter);
            this.selectedItems = null;
            this.updateSaveActions();
            doneCallback();
        });
    }

    public onFileSplitCompleted() {
        // the previously selected file will be deleted after splitting it, so reset the file selection
        this.fileID = null;
        this.previewVisible = false;

        // also refresh the list, because we will most likely have multiple new files now
        this.refreshList(this.currentFilter);
    }

    public assignSupplierInvoices(done: any) {
        this.modalService.open(BillAssignmentModal).onClose.subscribe(details => {
            if (details) {
                this.assignInvoices(details);
            }
        });

        done();
    }

    public assignInvoices(details: AssignmentDetails) {
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
                        this.selectedItems.length - numberOfFailed + ' fakturaer ble tildelt',
                        ToastType.bad,
                        3,
                        numberOfFailed + ' fakturaer feilet ved tildeling.'
                    );
                    this.selectedItems = null;
                } else {
                    this.toast.addToast(
                        this.selectedItems.length - numberOfFailed + ' fakturaer ble tildelt', ToastType.good, 3
                    );
                }
                this.updateSaveActions();
            },
            err => {
                this.errorService.handle(err);
                this.updateSaveActions();
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
                                this.updateSaveActions();
                            },
                            err => {
                                this.errorService.handle(err);
                                this.updateSaveActions();
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
                                        this.updateSaveActions();
                                    },
                                    err => {
                                        this.errorService.handle(err);
                                        this.updateSaveActions();
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
                                this.selectedItems.length - numberOfFailed + ' fakturaer ble kreditert.',
                                ToastType.bad,
                                3,
                                numberOfFailed + ' fakturaer feilet.'
                            );
                        } else {
                            this.toast.addToast(
                                this.selectedItems.length - numberOfFailed + ' fakturaer ble kreditert.',
                                ToastType.good,
                                3
                            );
                        }
                        this.selectedItems = null;
                        this.updateSaveActions();
                        done();
                    },
                    err => {
                        this.errorService.handle(err);
                        this.updateSaveActions();
                        done();
                    }
                );
            } else {
                this.refreshList(this.currentFilter);
                done();
            }
        });
    }

    public onRefreshClicked() {
        this.refreshList(this.currentFilter, true, undefined, undefined, true);
    }

    private refreshList(
        filter?: IFilter,
        refreshTotals: boolean = false,
        searchFilter?: string,
        filterOnUserID?: string,
        useProgressBar = false
    ) {
        this.loading$.next(useProgressBar);
        let params = new HttpParams();
        if (filter && filter.filter) {
            params = params.set('filter', filter.filter + ((searchFilter ? ' and ' : '') + (searchFilter || '')));
        } else if (searchFilter) {
            params = params.set('filter', searchFilter);
        }
        this.currentFilter = filter;
        if (filter.route) {
            this.hasQueriedInboxCount = filter.name === 'Inbox';
        }

        if (this.currentFilter.name === 'unpaid') {
            this.quickFilters = this.unpaidQuickFilters;
        } else {
            this.quickFilters = [];
        }

        const obs = filter.route
            ? this.supplierInvoiceService.fetch(filter.route)
            : this.supplierInvoiceService.getInvoiceList(params, this.currentUserFilter);

            obs.subscribe((result) => {
            if (filter.onDataReady) {
                filter.onDataReady(result);
            } else {
                this.listOfInvoices = result;
                this.tableConfig = this.createTableConfig(filter);
                this.totals.grandTotal = filter.total || this.totals.grandTotal;
            }

            this.tableConfig.setMultiRowSelect(!(
                this.currentFilter.name === 'paid' || this.currentFilter.name === 'issenttopayment'
            ));

            this.loading$.next(false);

            this.QueryInboxTotals();
        }, err => this.errorService.handle(err));
        if (refreshTotals) {
            this.refreshTotals();
        }
    }

    private QueryInboxTotals(): boolean {
        if (this.hasQueriedInboxCount) {
            return false;
        }
        this.hasQueriedInboxCount = true;
        const route = '?model=filetag&select=count(id)&filter=' + this.inboxTagNamesFilter + ' and status eq 0 '
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

    getFileComments(): Observable<{FileID: number; Comment: string}[]> {
        const route = `?model=filetag&select=fileid as FileID,comment.ID as CommentID`
            + `,comment.Text as Comment,CreatedAt as CreatedAt&filter=` + this.inboxTagNamesFilter
            + ` and (isnull(Status,0) eq 0 or (status eq 30 and datediff('hour',createdat,getdate()) gt 1 ))`
            + ` and comment.entitytype eq 'file'&join=filetag.fileid eq comment.entityid`;

        return this.supplierInvoiceService.getStatQuery(route).pipe(
            catchError(err => {
                this.errorService.handle(err);
                return observableOf([]);
            })
        );
    }

    public onInboxDataReady(data: Array<any>) {
        const inboxItems = (data || []).filter(item => !!item);
        this.getFileComments().subscribe(comments => {
            this.listOfInvoices = inboxItems.map(item => {
                const comment = comments.find(c => c.FileID === item.ID);
                if (comment) {
                    item._comment = comment.Comment;
                }
                return item;
            });
        });

        const filter = this.getInboxFilter();
        if (filter) {
            filter.count = data ? data.length : 0;
            filter.total = 0;
        }
        if (this.totals) { this.totals.grandTotal = 0; }
        const cols = [
            new UniTableColumn('ID', 'Nr.')
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
            new UniTableColumn('_comment', 'Kommentar', UniTableColumnType.Text).setWidth('9rem'),
            new UniTableColumn('CreatedAt', 'Opprettet', UniTableColumnType.LocalDate)
                .setWidth('6rem', false)
        ];

        this.tableConfig = new UniTableConfig('accounting.bills.inboxTable', false, true)
            .setSearchable(true)
            .setMultiRowSelect(false)
            .setColumns(cols)
            .setPageSize(this.calculatePagesize())
            .setColumnMenuVisible(true)
            .setDeleteButton(true)
            .setConditionalRowCls(row => {
                return row._comment ? 'hascomments' : '';
            });
    }

    private refreshTotals() {
        Observable.forkJoin(
            this.supplierInvoiceService.getInvoiceListGroupedTotals(this.currentUserFilter),
            this.supplierInvoiceService.getInvoiceListGroupedPaymentTotals('ubetalt'),
            this.supplierInvoiceService.getInvoiceListGroupedPaymentTotals('betalingsliste'),
            this.supplierInvoiceService.getInvoiceListGroupedPaymentTotals('betalt'))
            .subscribe((data: Array<any>) => {
                this.hasQueriedTotals = true;
                this.filters.forEach(x => { if (x.name !== 'Inbox') { x.count = 0; x.total = 0; } });
                let count = 0;
                let total = 0;
                if (data[0]) {
                    data[0].forEach(x => {
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

                if (data[1]) {
                    const ix = this.filters.findIndex(y => y.name === 'unpaid');
                    if (ix >= 0) { this.filters[ix].count += data[1][0].countid; }
                }

                if (data[2]) {
                    const ix = this.filters.findIndex(y => y.name === 'issenttopayment');
                    if (ix >= 0) { this.filters[ix].count += data[2][0].countid; }
                }

                if (data[3]) {
                    const ix = this.filters.findIndex(y => y.name === 'paid');
                    if (ix >= 0) { this.filters[ix].count += data[3][0].countid; }
                }
                const ixAll = this.filters.findIndex(x => x.name === 'All');
                this.filters[ixAll].count = count;
                this.filters[ixAll].total = total;
                this.totals.grandTotal = this.currentFilter && this.currentFilter.total; //  this.filters[this.activeFilterIndex].total;
            }, err => this.errorService.handle(err));
    }

    private createTableConfig(filter: IFilter): UniTableConfig {
        const cols = [
            new UniTableColumn('InvoiceNumber', 'Fakturanr.'),
            new UniTableColumn('SupplierSupplierNumber', 'Lev.nr.').setVisible(false).setWidth('5rem'),
            new UniTableColumn('InfoName', 'Leverandør', UniTableColumnType.Text)
                .setFilterOperator('startswith')
                .setWidth('15rem'),
            new UniTableColumn('InvoiceDate', 'Fakturadato', UniTableColumnType.LocalDate)
                .setFilterOperator('eq'),
            new UniTableColumn('PaymentDueDate', 'Forfall', UniTableColumnType.LocalDate)
                .setFilterOperator('eq')
                .setConditionalCls((item) => {
                    const paid = item.RestAmount === 0;
                    return (paid || moment(item.PaymentDueDate).isBefore(moment()))
                        ? 'supplier-invoice-table-payment-overdue' : 'supplier-invoice-table-payment-ok';
                }),
            new UniTableColumn('BankAccountAccountNumber', 'Bankgiro'),
            new UniTableColumn('PaymentID', 'KID/Melding')
                .setTemplate((item) => item.PaymentInformation || item.PaymentID),
            new UniTableColumn('FreeTxt', 'Fritekst').setVisible(true),
            new UniTableColumn('JournalEntryJournalEntryNumber', 'Bilagsnr.')
                .setVisible(!!filter.showJournalID)
                .setFilterOperator('startswith')
                .setLinkResolver(row => {
                    const numberAndYear = row.JournalEntryJournalEntryNumber.split('-');
                    if (numberAndYear.length > 1) {
                        return `/accounting/transquery?JournalEntryNumber=${numberAndYear[0]}&AccountYear=${numberAndYear[1]}`;
                    } else {
                        const year = row.InvoiceDate ? new Date(row.InvoiceDate).getFullYear() : new Date().getFullYear();
                        return `/accounting/transquery?JournalEntryNumber=${row.JournalEntryJournalEntryNumber}&AccountYear=${year}`;
                    }
                }),

            new UniTableColumn('CurrencyCodeCode', 'Valuta', UniTableColumnType.Text)
                .setFilterOperator('eq')
                .setVisible(false),
            new UniTableColumn('TaxInclusiveAmountCurrency', 'Beløp', UniTableColumnType.Money).setWidth('7rem')
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
            new UniTableColumn('PaymentStatus', 'Betalingsstatus', UniTableColumnType.Number)
                .setTemplate((invoice) => {
                    return this.supplierInvoiceService.getPaymentStatusText(invoice.PaymentStatus);
                })
                .setFilterSelectConfig({
                    options: this.supplierInvoiceService.paymentStatusCodes,
                    displayField: 'Text',
                    valueField: 'Code'
                }),
            new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number)
                .setAlignment('center')
                .setTemplate((dataItem) => {
                    return this.supplierInvoiceService.getStatusText(dataItem.StatusCode);
                })
                .setFilterSelectConfig({
                    options: this.supplierInvoiceService.statusTypes,
                    displayField: 'Text',
                    valueField: 'Code'
                }),
            new UniTableColumn('CreatedAt', 'Opprettet', UniTableColumnType.DateTime).setVisible(false),
            new UniTableColumn('ReInvoiceStatusCode', 'Viderefakturert', UniTableColumnType.Link)
                .setVisible(!!filter.showStatus)
                .setHasLink(row => row.ReInvoiceStatusCode === StatusCodeReInvoice.ReInvoiced)
                .setLinkClick(row => {
                    this.modalService.open(ReInvoiceInfoModal, {data: row.ReInvoiceID});
                })
                .setTemplate((dataItem) => {
                    return this.reInvoicingService.getStatusText(dataItem.ReInvoiceStatusCode);
                })

        ];

        return new UniTableConfig('accounting.bills.mainTable', false, true)
            .setSearchable(true)
            .setMultiRowSelect(true, false, true)
            .setColumns(cols)
            .setPageSize(this.calculatePagesize())
            .setColumnMenuVisible(true);
    }

    public reInvoice(row) {
        this.supplierInvoiceService.Get(row.ID).subscribe(invoice => {
            this.modalService.open(UniReinvoiceModal, {
                data: {
                    supplierInvoice: invoice
                }
            });
        });
    }

    public onAddNew() {
        if (this.isSrEnvironment) {
            this.router.navigateByUrl('/accounting/inbox');
        } else {
            this.router.navigateByUrl('/accounting/bills/0');
        }
    }

    public onFilterClick(filter: IFilter) {
        if (filter.name !== 'Inbox') {
            this.previewVisible = false;
            this.fileID = null;
        }

        this.currentFilter = filter;

        if (this.currentFilter.name === 'unpaid') {
            this.quickFilters = this.unpaidQuickFilters;
        } else {
            this.quickFilters = [];
        }

        this.refreshList(filter, !this.hasQueriedTotals);
        this.pageStateService.setPageState('filter', filter.name);
        const index = this.filters.findIndex(f => f.name === filter.name);
        if (index >= 0) {
            this.activeFilterIndex = index;
            this.browserStorage.setItem('bills.lastUsedFilterIndex', index);
        }

        this.tabService.currentActiveTab.url = this.pageStateService.getUrl();
        this.updateSaveActions();
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


        if (!this.currentFilter) {
            const filterIndex = this.browserStorage.getItem('bills.lastUsedFilterIndex') || 0;
            this.activeFilterIndex = filterIndex;
            this.currentFilter = this.filters[filterIndex];
        }
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
        let pageSize = window.innerHeight
        - 80 // navbar
        - 88 // toolbar
        - 64 // tabs
        - 100 // Margin/padding
        - 100; // Table search & pagination

        pageSize = pageSize <= 100 ? 10 : Math.floor(pageSize / 45) - 1;

        return pageSize;
    }
}
