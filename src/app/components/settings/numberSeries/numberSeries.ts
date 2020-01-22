import {Component, ViewChildren, QueryList} from '@angular/core';
import {SettingsService} from '../settings-service';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {UniHttp} from '../../../../framework/core/http/http';
import {UniModalService, ConfirmActions, UniConfirmModalV2} from '../../../../framework/uni-modal';
import {Observable} from 'rxjs';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {IUniSaveAction} from '../../../../framework/save/save';
import {
    UniTableConfig,
    UniTableColumn,
    UniTableColumnType,
    UniTable,
} from '../../../../framework/ui/unitable/index';
import {
    ErrorService,
    GuidService,
    StatisticsService,
    FinancialYearService,
    NumberSeriesService,
    NumberSeriesTypeService,
    NumberSeriesTaskService,
    AccountService
} from '../../../services/services';
import {Account, NumberSeriesType} from '../../../unientities';

declare var _;
const MAXNUMBER = 2147483647;
const MININVOICENUMBER = 100000;

@Component({
    selector: 'uni-number-series',
    templateUrl: './numberSeries.html'
})
export class NumberSeries {
    @ViewChildren(UniTable)
    private uniTables: QueryList<UniTable>;

    public series: any[] = [];
    public current: any[] = [];
    public currentNumberSeriesType: NumberSeriesType;

    private numberseries: any[] = [];
    private types: any[] = [];
    private tasks: any[] = [];
    public currentYear: number;
    public currentSerie: any = this.numberSeriesService.series.find(x => x.ID === 'JournalEntry');
    private asinvoicenumberserie: number = null;
    private customerAccount: Account = null;
    private supplierAccount: Account = null;

    public hasUnsavedChanges: boolean = false;
    public busy: boolean = false;
    public allYears: boolean = false;

    public seriesTableConfig: UniTableConfig;
    public listTableConfig: UniTableConfig;

    public saveactions: IUniSaveAction[] = [];

    constructor(
        private settingService: SettingsService,
        private http: UniHttp,
        private tabService: TabService,
        private errorService: ErrorService,
        private guidService: GuidService,
        private statisticsService: StatisticsService,
        private financialYearService: FinancialYearService,
        private toastService: ToastService,
        private numberSeriesService: NumberSeriesService,
        private numberSeriesTypeService: NumberSeriesTypeService,
        private numberSeriesTaskService: NumberSeriesTaskService,
        private modalService: UniModalService,
        private accountService: AccountService
    ) {
        this.series = this.numberSeriesService.series;
        this.initTableConfigs();
        this.initAccountingTableConfig();
        this.updateSaveActions();

        this.financialYearService.lastSelectedFinancialYear$.subscribe(year => {
            this.currentYear = year.Year;
            this.checkSave(true).then(ok => { if (ok) {
               this.requestNumberSerie();
            }});
        });
    }

    public onSerieSelected(event) {
        if (!event) { return; }

        this.checkSave(true).then( ok => { if (ok) {
            this.currentSerie = event;
            this.setCurrent(event);
        }});
    }

    public updateSaveActions() {
        this.settingService.setSaveActions([
            {
                label: 'Lagre nummerserier',
                action: (done) => this.onSaveClicked(done),
                main: true,
                disabled: false
            },
            {
                label: 'Finn neste nr på alle nummerserier',
                action: (done) => this.findAndSetNextNumberOnAllSeries(done),
                main: false,
                disabled: false
            }
        ]);
    }

    public onSaveClicked(done) {
        this.busy = true;
        this.Save().then(x => {
            this.busy = false;
            done('Lagring fullført');
        })
        .catch(err => {
            this.errorService.handle(err);
            done('En feil oppstod!');
        });
    }

    findAndSetNextNumberOnAllSeries(done) {
        this.modalService.open(UniConfirmModalV2,
        {
            buttonLabels: { accept: 'Ja', reject: 'Nei' },
            header: 'Resette neste nummer i alle nummerserier?',
            message: 'Vil du sette neste ledige nummer på alle nummserier? ' +
                'Alle nummerserier vil får neste nummer som det neste etter det høyeste brukte nummer i serien'
        }).onClose.subscribe(res => {
            if (res === ConfirmActions.ACCEPT) {
                this.busy = true;
                this.numberSeriesService.findAndSetNextNumber(null).subscribe(
                    () => {
                        this.busy = false;
                        this.toastService.addToast('Neste nummer er oppdatert på nummerserier', ToastType.good, 5);
                        done('Neste nummer er oppdatert på nummerserier');
                        this.requestNumberSerie();
                    },
                    err => {
                        this.busy = false;
                        this.errorService.handle(err);
                        done('En feil oppstod ved oppdatering av neste nummer');
                    }
                );
            } else {
                done('');
            }
        });
    }

    findAndSetNextNumberOnNumberSeries(done, seriesID: number) {
        this.modalService.open(UniConfirmModalV2,
        {
            buttonLabels: { accept: 'Ja', reject: 'Nei' },
            header: 'Resette neste nummer på denne nummerserien?',
            message: 'Vil du sette neste ledige nummer på denne nummserien? ' +
                'Nummerserien vil får neste nummer som er det neste etter det høyeste brukte nummer i serien'
        }).onClose.subscribe(res => {
            if (res === ConfirmActions.ACCEPT) {
                this.busy = true;
                this.numberSeriesService.findAndSetNextNumber(seriesID).subscribe(
                    () => {
                        this.busy = false;
                        this.toastService.addToast('Neste nummer er oppdatert på nummerserien', ToastType.good, 5);
                        done('Neste nummer er oppdatert på nummerserier');
                        this.requestNumberSerie();
                    },
                    err => {
                        this.busy = false;
                        this.errorService.handle(err);
                        done('En feil oppstod ved oppdatering av neste nummer');
                    }
                );
            } else {
                done('');
            }
        });
    }

    private setCurrent(t: any) {
        if (this.uniTables) {
            this.uniTables.last.blur();
        }

        let current = [];

        switch (t.ID) {
            case 'JournalEntry':
                current = this.numberseries.filter(
                    x => x.NumberSeriesType.EntityType === 'JournalEntry'
                    && (this.allYears || x.AccountYear === this.currentYear || !x.AccountYear)
                );
                // filter ions first, remove allready added to db
                const journalEntryType = this.types.find(x => x.Name === 'JournalEntry number series type yearly');
                current = current.concat(this.numberSeriesService.suggestions.map(x => {
                    x.AccountYear = this.currentYear;

                    x.NumberSeriesTask = this.tasks.find(y => y.Name === x._Task);
                    x.NumberSeriesTaskID = x.NumberSeriesTask.ID;

                    x.NumberSeriesType = journalEntryType;
                    x.NumberSeriesTypeID = x.NumberSeriesType.ID;

                    x._AsInvoiceNumber = this.numberSeriesService.asinvoicenumber[0];
                    x._Register = this.numberSeriesService.registers.find(a => a.EntityType === 'JournalEntry');

                    return x;
                }).filter(x => { // filter allready added suggestions
                    return !current.find(y => x.NumberSeriesTaskID === y.NumberSeriesTaskID);
                }));

                this.initAccountingTableConfig();
                break;
            case 'Sale':
                current = this.numberseries.filter(
                    x => ['CustomerQuote', 'CustomerOrder', 'CustomerInvoice', 'CustomerInvoiceReminder']
                        .indexOf(x.NumberSeriesType.EntityType) >= 0
                );
                this.initSaleTableConfig();
                break;
            case 'Accounts':
                current = this.numberseries.filter(
                    x => ['Customer', 'Supplier'].indexOf(x.NumberSeriesType.EntityType) >= 0
                );
                this.initAccountsTableConfig();
                break;
            case 'Others':
                current = this.numberseries.filter(
                    x => ['JournalEntry', 'CustomerQuote', 'CustomerOrder', 'CustomerInvoice', 'Customer', 'Supplier']
                        .indexOf(x.NumberSeriesType.EntityType) < 0
                );
                this.initOtherSeriesTableConfig();
                break;
        }

        this.current = _.cloneDeep(current);
        this.uniTables.last.refreshTableData();
        this.hasUnsavedChanges = false;
    }

    public canDeactivate() {
        return new Promise((resolve, reject) => {
            this.checkSave(true).then( ok => resolve(ok) );
        });
    }

    private checkSave(confirmBeforeSave: boolean): Promise<boolean> {
        return new Promise((resolve, reject) => {
            // Allow changes to reach the component
            setTimeout(() => {
                if (!this.hasUnsavedChanges) {
                    resolve(true);
                    return;
                }

                if (confirmBeforeSave) {
                    this.modalService.confirm({
                        header: 'Lagre endringer?',
                        message: 'Ønsker du å lagre endringene før vi fortsetter?',
                        buttonLabels: {
                            accept: 'Lagre',
                            reject: 'Forkast',
                            cancel: 'Avbryt'
                        },
                        activateClickOutside: false
                    }).onClose.subscribe(response => {
                        switch (response) {
                            case ConfirmActions.ACCEPT:
                                this.Save()
                                    .then(saveResult => resolve(saveResult))
                                    .catch(err => this.errorService.handle(err));
                            break;
                            case ConfirmActions.REJECT:
                                resolve(true);
                            break;
                            default:
                                resolve(false);
                            break;
                        }
                    });

                } else {
                    this.Save()
                        .then(x => resolve(x))
                        .catch(err => this.errorService.handle(err));
                }
            });
        });
    }

    private Save(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const all = this.uniTables.last.getVisibleTableData();

            const numberSeriesTypeToPUTToServer: NumberSeriesType [] = [];

            all
                .filter(uniTableNumberSeriesRow => uniTableNumberSeriesRow._isDirty)
                .forEach(uniTableNumberSeriesDirtyRow => {
                    if (!uniTableNumberSeriesDirtyRow.AccountYear) {
                        uniTableNumberSeriesDirtyRow.AccountYear = 0;
                    }
                    if (!numberSeriesTypeToPUTToServer
                        .some(nstype => nstype.ID === uniTableNumberSeriesDirtyRow.NumberSeriesTypeID)) {
                            numberSeriesTypeToPUTToServer.push(uniTableNumberSeriesDirtyRow.NumberSeriesType);
                    }
                });

            // add numberseries to type
            all.forEach(uniTableNumberSeriesRow => {
                numberSeriesTypeToPUTToServer.forEach(numberSeriesType => {

                    if (numberSeriesType.ID === uniTableNumberSeriesRow.NumberSeriesTypeID) {

                        if (this.currentSerie &&
                            this.currentSerie.ID === 'JournalEntry' &&
                            !uniTableNumberSeriesRow._rowSelected) {
                            return;
                        }

                        numberSeriesType.Series = numberSeriesType.Series || [];
                        if (uniTableNumberSeriesRow._isDirty) {
                            uniTableNumberSeriesRow.NumberSeriesType = null;
                            if (this.currentSerie.ID === 'JournalEntry' || this.currentSerie.ID === 'Accounts') {
                                uniTableNumberSeriesRow.MainAccount = null;
                            }
                        }

                        if (!uniTableNumberSeriesRow.ID) {
                            uniTableNumberSeriesRow['_createguid'] = this.numberSeriesService.getNewGuid();
                        }

                        numberSeriesType.Series.push(uniTableNumberSeriesRow);
                    }
                });
            });

            const saveTypeObservables: Observable<any>[] = numberSeriesTypeToPUTToServer.map(numberSeriesType => {
                return this.numberSeriesTypeService.save(numberSeriesType);

            });
            if (saveTypeObservables.length === 0) {
                resolve(true);
            } else {

                Observable.forkJoin(saveTypeObservables).subscribe(allSaved => {
                    this.toastService.addToast('Lagret', ToastType.good, 7, 'Nummerserier lagret.');
                    this.requestNumberSerie(); // Reload all
                    resolve(true);
                }, error => {
                    resolve(false);
                    this.errorService.handle(error);
                });
            }
        });
    }

    public onFormChange(event) {
        this.hasUnsavedChanges = true;
    }

    public onRowChanged(event) {
        this.hasUnsavedChanges = true;


        const row = event.rowModel;
        const index = this.current.findIndex(x => x._originalIndex === row._originalIndex);

        row._isDirty = true;
        if (index >= 0) {

            if (!row.ID && !row.Name) {
                row.Name = row.DisplayName;
            }

            if (!row.ID && row.FromNumber && (!row.NextNumber || row.NextNumber < row.FromNumber)) {
                row.NextNumber = row.FromNumber;
            }

            if (row.MainAccount) {
                row.MainAccountID = row.MainAccount.ID;
            }

            if (row._AsInvoiceNumber.ID
                && (row.UseNumbersFromNumberSeriesID === null || row.UseNumbersFromNumberSeriesID === 0)
            ) {
                this.modalService.confirm({
                    header: 'Advarsel',
                    warning: 'Denne endringen kan ikke omgjøres etter lagring',
                    message: 'Vennligst bekreft at at bilag skal bruke nummerserie for faktura',
                    buttonLabels: {
                        accept: 'Bekreft',
                        cancel: 'Angre'
                    }
                }).onClose.subscribe(response => {
                    if (response === ConfirmActions.ACCEPT) {
                        row.UseNumbersFromNumberSeriesID = this.asinvoicenumberserie;
                        row.NumberSeriesType = this.types.find(
                            x => x.Name === 'JournalEntry number series type NOT yearly'
                        );
                        row.AccountYear = 0;

                        row.FromNumber = MININVOICENUMBER;
                        row.NextNumber = MININVOICENUMBER;
                        row.ToNumber = MAXNUMBER;
                    } else {
                        row.UseNumbersFromNumberSerieID = null;
                        row.NumberSeriesType = this.types.find(
                            x => x.Name === 'JournalEntry number series type yearly'
                        );

                        row._AsInvoiceNumber = this.numberSeriesService.asinvoicenumber.find(x => !x.ID);
                    }

                    row.NumberSeriesTypeID = row.NumberSeriesType ? row.NumberSeriesType.ID : 0;
                    this.current[index] = row;
                    this.current = _.cloneDeep(this.current);
                });

            } else {
                if (row._Register) {
                    if (row._Register.EntityType !== 'JournalEntry') {
                        row.NumberSeriesType = this.types.find(x => x.EntityType === row._Register.EntityType);
                        row.NumberSeriesTypeID = row.NumberSeriesType ? row.NumberSeriesType.ID : 0;
                    } else {
                        row.NumberSeriesType = this.types.find(
                            x => x.Name === (row.AccountYear > 0
                                ? 'JournalEntry number series type yearly'
                                : 'JournalEntry number series type NOT yearly')
                        );
                        row.NumberSeriesTypeID = row.NumberSeriesType ? row.NumberSeriesType.ID : 0;
                    }
                }

                row.UseNumbersFromNumberSeriesID = null;

                this.current[index] = row;
                this.current = _.cloneDeep(this.current);
            }
        } else {
            this.current.push(row);
            this.current = _.cloneDeep(this.current);
        }
    }

    private initTableConfigs() {
        this.seriesTableConfig = new UniTableConfig('settings.numberSeries.series', false, true, 15)
            .setSearchable(false)
            .setSortable(false)
            .setColumns([
                new UniTableColumn('Name', '')
            ]);

        this.initOtherSeriesTableConfig();
    }

    private initAccountingTableConfig() {
        this.listTableConfig = new UniTableConfig('settings.numberSeries.accountingList', true, true, 15)
            .setSearchable(false)
            .setAutoAddNewRow(true)
            .setMultiRowSelect(true)
            .setColumns([
                new UniTableColumn('DisplayName', 'Navn', UniTableColumnType.Text)
                    .setEditable(row => {
                        return  !row._rowSelected ? false : (row.Disabled ? false : true) ;
                    })
                    .setWidth('14rem'),
                new UniTableColumn('AccountYear', 'År', UniTableColumnType.Text)
                    .setEditable(row => row._rowSelected && !row.ID)
                    .setWidth('4rem'),
                new UniTableColumn('Comment', 'Kommentar', UniTableColumnType.Text)
                    .setEditable(row => {
                        return  !row._rowSelected ? false : (row.Disabled ? false : true) ;
                    }),
                new UniTableColumn('FromNumber', 'Fra nr', UniTableColumnType.Number)
                    .setWidth('7rem')
                    .setEditable(row => {
                        return  !row._rowSelected ? false : (row.Disabled ? false : true) ;
                    }),
                new UniTableColumn('ToNumber', 'Til nr', UniTableColumnType.Number)
                .setWidth('7rem')
                .setEditable(row => {
                        return  !row._rowSelected ? false : (row.Disabled ? false : true) ;
                    })
                    .setTemplate(row => `${row.ToNumber === MAXNUMBER ? 'max' : row.ToNumber ? row.ToNumber : ''}`),
                new UniTableColumn('NextNumber', 'Neste nr', UniTableColumnType.Number)
                    .setWidth('7rem')
                    .setEditable(row => {
                        return  !row._rowSelected ? false : (row.Disabled ? false : true) ;
                    }),
                new UniTableColumn('NumberSeriesTask', 'Oppgave', UniTableColumnType.Select)
                    .setEditable(row => {
                        return  !row._rowSelected ? false : (row.Disabled ? false : true) ;
                    })
                    .setTemplate(row => {
                        if (!row.NumberSeriesTask) {
                            return 'Bokføring'; // Missing NumberSeriesTask
                        }
                        return row.NumberSeriesTask._DisplayName;
                    })
                    .setOptions({
                        hideNotChosenOption: true,
                        field: 'ID',
                        displayField: '_DisplayName',
                        resource: this.tasks.filter(x => x.EntityType === 'JournalEntry')
                    }),
                new UniTableColumn('_AsInvoiceNumber', 'Lik fakturanr.', UniTableColumnType.Select)
                    .setWidth('4rem')
                    .setEditable(row => {
                        return !row.ID && row._rowSelected
                        && row.Name === 'JournalEntry invoice number series type';
                    })
                    .setTemplate(row => {
                        return row.Name === 'JournalEntry invoice number series type'
                            ? row._AsInvoiceNumber.DisplayName
                            : '';
                    })
                    .setOptions({
                        hideNotChosenOption: true,
                        field: 'ID',
                        displayField: 'DisplayName',
                        resource: this.numberSeriesService.asinvoicenumber
                    }),
                    new UniTableColumn('Disabled', 'Aktiv', UniTableColumnType.Select)
                    .setTemplate(row => row.Disabled ? 'Nei' : 'Ja')
                    .setVisible(true)
                    .setWidth('4rem')
                    .setOptions({
                        resource: [true, false],
                        itemTemplate: item => item ? 'Nei' : 'Ja'
                    })
            ])
            .setChangeCallback(event => this.onRowChanged(event))
            .setContextMenu([
                {
                    label: 'Sett som standard for angitt oppgave',
                    disabled: (serie) => !serie.NumberSeriesTask || serie.IsDefaultForTask,
                    action: (serie) => {
                        this.current.filter(
                            x => x.IsDefaultForTask && x.AccountYear === serie.AccountYear
                            && x.NumberSeriesTaskID === serie.NumberSeriesTaskID
                        ).map(x => {
                            x.IsDefaultForTask = false;
                        });

                        serie.IsDefaultForTask = true;
                        serie._isDirty = true;
                        this.current[serie._originalIndex] = serie;
                        this.hasUnsavedChanges = true;
                        this.current = _.cloneDeep(this.current);
                    }
                },
                {
                    label: 'Vis ledige numre i serien',
                    action: (serie) => {
                        this.numberSeriesService.getAvailableNumbersInNumberSeries(serie.ID)
                            .subscribe(
                                numberIntervals =>
                                    this.modalService.open(UniConfirmModalV2,
                                        {
                                            buttonLabels: { accept: 'OK' },
                                            header: 'Ledige nummer i nummerserie',
                                            message: numberIntervals.join(', '),
                                        }),
                                err => this.errorService.handle(err),
                        );
                    }
                },
                {
                    label: 'Finn neste ledige nr',
                    action: (serie) => {
                        this.numberSeriesService.findAndSetNextNumber(serie.ID)
                            .subscribe(() => {
                                    this.toastService.addToast('Neste nr', ToastType.good, 7, 'Neste nummer satt på nummerserie.');
                                    this.requestNumberSerie();
                                }
                            );
                    }
                }
            ])
            .setConditionalRowCls(
                (serie) =>
                    serie.Disabled ? 'numberseries-disabled-row' : serie.IsDefaultForTask ? 'numberseries-isdefaultfortask-row' : '')
            .setDefaultRowData({
                NumberSeriesTask: this.tasks.find(x => x.Name === 'Journal'),
                _Register: this.numberSeriesService.registers.find(x => x.EntityType === 'JournalEntry'),
                AccountYear: this.currentYear,
                _AsInvoiceNumber: this.numberSeriesService.asinvoicenumber[0],
                _rowSelected: false
            });
    }

    private initSaleTableConfig() {
        this.listTableConfig = new UniTableConfig('settings.numberSeries.salesList', true, true, 15)
            .setSearchable(false)
            .setAutoAddNewRow(true)
            .setColumns([

                new UniTableColumn('DisplayName', 'Navn', UniTableColumnType.Text)
                    .setEditable(row => !row.ID || row.Disabled)
                    .setWidth('14rem'),
                new UniTableColumn('Comment', 'Kommentar', UniTableColumnType.Text)
                    .setEditable(true),
                new UniTableColumn('FromNumber', 'Fra nr', UniTableColumnType.Number)
                    .setEditable(true)
                    .setWidth('7rem'),
                new UniTableColumn('ToNumber', 'Til nr', UniTableColumnType.Number)
                    .setEditable(true)
                    .setTemplate(row => `${row.ToNumber === MAXNUMBER ? 'max' : row.ToNumber ? row.ToNumber : ''}`)
                    .setWidth('7rem'),
                new UniTableColumn('NextNumber', 'Neste nr', UniTableColumnType.Number)
                    .setEditable(true)
                    .setWidth('7rem'),
                new UniTableColumn('NumberSeriesTask', 'Oppgave', UniTableColumnType.Select)
                    .setVisible(false) // Hidden because we haven't defined any tasks for sales numberseries yet
                    .setEditable(row => !row.ID || row.Disabled)
                    .setTemplate(row => row.NumberSeriesTask ? row.NumberSeriesTask.DisplayName : '')
                    .setOptions({
                        hideNotChosenOption: false,
                        field: 'ID',
                        displayField: 'DisplayName',
                        resource: this.tasks.filter(x => x.EntityType !== 'JournalEntry')
                    }),
                new UniTableColumn('_Register', 'Oppgave', UniTableColumnType.Select)
                    .setEditable(row => !row.ID)
                    .setTemplate(row => row._Register ? row._Register.DisplayName : '')
                    .setOptions({
                        hideNotChosenOption: true,
                        displayField: 'DisplayName',
                        resource: this.numberSeriesService.registers.filter(x => x.Sale)
                    }),
                    new UniTableColumn('Disabled', 'Aktiv', UniTableColumnType.Select)
                    .setTemplate(row => row.Disabled ? 'Nei' : 'Ja')
                    .setVisible(true)
                    .setWidth('4rem')
                    .setOptions({
                        resource: [true, false],
                        itemTemplate: item => item ? 'Nei' : 'Ja'
                    })
            ])
            .setContextMenu([
                {
                    label: 'Sett som standard for angitt oppgave',
                    disabled: (serie) => serie.IsDefaultForTask || !serie.ID,
                    action: (serie) => {
                        this.current.filter(
                            x => x.IsDefaultForTask && x.AccountYear === serie.AccountYear
                            && x.NumberSeriesTaskID === serie.NumberSeriesTaskID
                        ).map(x => {
                            x.IsDefaultForTask = false;
                        });

                        serie.IsDefaultForTask = true;
                        serie._isDirty = true;
                        this.current[serie._originalIndex] = serie;
                        this.hasUnsavedChanges = true;
                        this.current = _.cloneDeep(this.current);
                    }
                },
                {
                    label: 'Vis ledige numre i serien',
                    action: (serie) => {
                        this.numberSeriesService.getAvailableNumbersInNumberSeries(serie.ID)
                            .subscribe(
                                numberIntervals =>
                                    this.modalService.open(UniConfirmModalV2,
                                        {
                                            buttonLabels: { accept: 'OK' },
                                            header: 'Ledige nummer i nummerserie',
                                            message: numberIntervals.join(', '),
                                        }),
                                err => this.errorService.handle(err),
                        );
                    }
                },
                {
                    label: 'Finn neste ledige nr',
                    action: (serie) => {
                        this.numberSeriesService.findAndSetNextNumber(serie.ID)
                            .subscribe(() => {
                                    this.toastService.addToast('Neste nr', ToastType.good, 7, 'Neste nummer satt på nummerserie.');
                                    this.requestNumberSerie();
                                }
                            );
                    }
                }
            ])
            .setConditionalRowCls((serie) =>  serie.Disabled ? 'numberseries-disabled-row' : '')
            .setChangeCallback(event => this.onRowChanged(event))
            .setDefaultRowData({
                DisplayName: '',
                _Register: null,
                _AsInvoiceNumber: this.numberSeriesService.asinvoicenumber[0],
                _rowSelected: false
            });
    }

    private initAccountsTableConfig() {
        this.listTableConfig = new UniTableConfig('settings.numberSeries.accountList', true, true, 15)
            .setSearchable(false)
            .setAutoAddNewRow(true)
            .setColumns([
                new UniTableColumn('DisplayName', 'Navn', UniTableColumnType.Text)
                    .setEditable(row => !row.ID)
                    .setWidth('14rem'),
                new UniTableColumn('Comment', 'Kommentar', UniTableColumnType.Text)
                    .setEditable(true),
                new UniTableColumn('FromNumber', 'Fra nr', UniTableColumnType.Number)
                    .setEditable(true)
                    .setWidth('7rem'),
                new UniTableColumn('ToNumber', 'Til nr', UniTableColumnType.Number)
                    .setEditable(true)
                    .setWidth('7rem')
                    .setTemplate(row => `${row.ToNumber === MAXNUMBER ? 'max' : row.ToNumber ? row.ToNumber : ''}`),
                new UniTableColumn('NextNumber', 'Neste nr', UniTableColumnType.Number)
                    .setEditable(true)
                    .setWidth('7rem'),
                new UniTableColumn('_Register', 'Oppgave', UniTableColumnType.Select)
                    .setEditable(row => !row.ID)
                    .setTemplate(row => row._Register ? row._Register.DisplayName : '')
                    .setOptions({
                        hideNotChosenOption: true,
                        displayField: 'DisplayName',
                        resource: this.numberSeriesService.registers.filter(
                            x => x.EntityType === 'Customer' || x.EntityType === 'Supplier'
                        )
                    }),
                new UniTableColumn('MainAccount', 'Samlekonto', UniTableColumnType.Lookup)
                    .setEditable(row => !row.ID)
                    .setTemplate(row => {
                        let account;
                        if (row.MainAccount) {
                            account = row.MainAccount;
                        } else if (row.ID) {
                            switch (row._Register.EntityType) {
                                case 'Customer':
                                    account = this.customerAccount;
                                    break;
                                case 'Supplier':
                                    account = this.supplierAccount;
                            }
                        }

                        return account
                            ? account.AccountNumber + ': ' + account.AccountName
                            : '';
                    })
                    .setOptions({
                        itemTemplate: (selectedItem) => {
                            return (selectedItem.AccountNumber + ' - ' + selectedItem.AccountName);
                        },
                        lookupFunction: (searchValue) => {
                            return this.accountSearch(searchValue);
                        }
                    }),
                    new UniTableColumn('Disabled', 'Aktiv', UniTableColumnType.Select)
                    .setTemplate(row => row.Disabled ? 'Nei' : 'Ja')
                    .setVisible(true)
                    .setWidth('4rem')
                    .setOptions({
                        resource: [true, false],
                        itemTemplate: item => item ? 'Nei' : 'Ja'
                    })
                ])
                .setContextMenu([
                    {
                        label: 'Vis ledige numre i serien',
                        action: (serie) => {
                            this.numberSeriesService.getAvailableNumbersInNumberSeries(serie.ID)
                                .subscribe(
                                    numberIntervals =>
                                        this.modalService.open(UniConfirmModalV2,
                                            {
                                                buttonLabels: { accept: 'OK' },
                                                header: 'Ledige nummer i nummerserie',
                                                message: numberIntervals.join(', '),
                                            }),
                                    err => this.errorService.handle(err),
                            );
                        }
                    },
                    {
                        label: 'Finn neste ledige nr',
                        action: (serie) => {
                            this.numberSeriesService.findAndSetNextNumber(serie.ID)
                            .subscribe(() => {
                                    this.toastService.addToast('Neste nr', ToastType.good, 7, 'Neste nummer satt på nummerserie.');
                                    this.requestNumberSerie();
                                }
                            );
                        }
                    }
                ])
            .setChangeCallback(event => this.onRowChanged(event))
            .setConditionalRowCls((serie) =>  serie.Disabled ? 'numberseries-disabled-row' : '')
            .setDefaultRowData({
                _Register: this.numberSeriesService.registers.find(x => x.EntityType === 'Customer'),
                _AsInvoiceNumber: this.numberSeriesService.asinvoicenumber[0],
                _rowSelected: false
            });
    }

    private initOtherSeriesTableConfig() {
        this.listTableConfig = new UniTableConfig('settings.numberSeries.othersList', true, true, 15)
            .setSearchable(false)
            .setAutoAddNewRow(false)
            .setColumns([
                new UniTableColumn('DisplayName', 'Navn', UniTableColumnType.Text)
                    .setEditable(false)
                    .setWidth('14rem'),
                new UniTableColumn('Comment', 'Kommentar', UniTableColumnType.Text)
                    .setEditable(true),
                new UniTableColumn('NextNumber', 'Neste nr', UniTableColumnType.Number)
                    .setEditable(true)
                    .setWidth('7rem'),
                new UniTableColumn('_Register', 'Oppgave', UniTableColumnType.Select)
                    .setEditable(false)
                    .setTemplate(row => row._Register && row._Register.DisplayName)
                    .setOptions({
                        hideNotChosenOption: true,
                        displayField: 'DisplayName',
                        resource: this.numberSeriesService.registers
                    }),
                    new UniTableColumn('Disabled', 'Aktiv', UniTableColumnType.Select)
                    .setTemplate(row => row.Disabled ? 'Nei' : 'Ja')
                    .setVisible(true)
                    .setWidth('4rem')
                    .setOptions({
                        resource: [true, false],
                        itemTemplate: item => item ? 'Nei' : 'Ja'
                    })
            ])
            .setContextMenu([
                {
                    label: 'Vis ledige numre i serien',
                    action: (serie) => {
                        this.numberSeriesService.getAvailableNumbersInNumberSeries(serie.ID)
                            .subscribe(
                                numberIntervals =>
                                    this.modalService.open(UniConfirmModalV2,
                                        {
                                            buttonLabels: { accept: 'OK' },
                                            header: 'Ledige nummer i nummerserie',
                                            message: numberIntervals.join(', '),
                                        }),
                                err => this.errorService.handle(err),
                        );
                    }
                },
                {
                    label: 'Finn neste ledige nr',
                    action: (serie) => {
                        this.numberSeriesService.findAndSetNextNumber(serie.ID)
                        .subscribe(() => {
                                this.toastService.addToast('Neste nr', ToastType.good, 7, 'Neste nummer satt på nummerserie.');
                                this.requestNumberSerie();
                            }
                        );
                    }
                }
            ])
            .setChangeCallback(event => this.onRowChanged(event))
            .setConditionalRowCls((serie) =>  serie.Disabled ? 'numberseries-disabled-row' : '')
            .setDefaultRowData({
                _AsInvoiceNumber: this.numberSeriesService.asinvoicenumber[0],
            });
    }

    private accountSearch(searchValue: string): Observable<any> {

        let filter = '';
        if (searchValue === '') {
            filter = `Visible eq 'true' and isnull(AccountID,0) eq 0`;
        } else {
            let copyPasteFilter = '';

            if (searchValue.indexOf(':') > 0) {
                const accountNumberPart = searchValue.split(':')[0].trim();
                const accountNamePart = searchValue.split(':')[1].trim();

                copyPasteFilter = ` or (AccountNumber eq '${accountNumberPart}' `
                    + `and AccountName eq '${accountNamePart}')`;
            }

            filter = `Visible eq 'true' and (startswith(AccountNumber\,'${searchValue}') `
                + `or contains(AccountName\,'${searchValue}')${copyPasteFilter} )`;
        }

        return this.accountService.searchAccounts(filter, searchValue !== '' ? 100 : 500);
    }

    public onRowSelectionChange(event) {
        if (!event) {
            const tableRows = this.uniTables && this.uniTables.last.getTableData();
            if (tableRows) {
                this.current = tableRows.map(chosen => {
                    return this.setPredefinedOrNot(chosen);
                });
            }
        } else {
            const chosen = this.setPredefinedOrNot(event.rowModel);
            this.current[chosen._originalIndex] = chosen;
        }

        this.current = _.cloneDeep(this.current);
    }

    private setPredefinedOrNot(chosen) {
        if (chosen.ID) {
            chosen._rowSelected = true;
        } else if (chosen._rowSelected) {
            chosen.FromNumber = chosen._FromNumber;
            chosen.ToNumber = chosen._ToNumber;
            chosen.NextNumber = chosen._NextNumber;
            chosen._isDirty = true;
            this.hasUnsavedChanges = true;
        } else {
            chosen.FromNumber = null;
            chosen.ToNumber = null;
            chosen.NextNumber = null;
        }

        return chosen;
    }

    public onEditChange(event) {
        const value = event.rowModel[event.field];

        if (!value) {
            return event.rowModel;
        }

        this.hasUnsavedChanges = true;
    }

    public toggleAllYears(event) {
        this.allYears = event.checked;
        this.setCurrent(this.currentSerie);
    }

    private requestNumberSerie() {
        Observable.forkJoin([
            this.numberSeriesTypeService.GetAll(''),
            this.numberSeriesService.getNumberSeriesList(),
            this.numberSeriesTaskService.GetAll(''),
            this.http.asGET()
                .usingBusinessDomain()
                .withEndPoint('companysettings?hateoas=false&expand=SupplierAccount,CustomerAccount')
                .send().map(response => response.body),
            this.numberSeriesService.getNumberSeriesAsInvoice()
        ]).subscribe(data => {
            const types = data[0];
            const numberseries = data[1];
            const tasks = data[2];
            const settings = data[3][0];

            this.types = types;
            this.tasks = tasks.map(x => this.numberSeriesTaskService.translateTask(x));
            this.customerAccount = settings.CustomerAccount;
            this.supplierAccount = settings.SupplierAccount;

            if (data[4] !== null ) {
                this.asinvoicenumberserie = data[4].ID;
            } else {
                this.asinvoicenumberserie = null;
                this.toastService
                    .addToast('Finner ikke faktura nummerserie å bruke til duplisering for bilagsnummer.'
                    , ToastType.bad, 7, 'Nummerserie for faktura mangler.');
            }

            this.numberseries = this.addCustomFields(numberseries).map(x => {
                if (x.NumberSeriesTask && x.NumberSeriesTask.Name) {
                    x.NumberSeriesTask = this.numberSeriesTaskService.translateTask(x.NumberSeriesTask);
                }

                if (x.NumberSeriesType && x.NumberSeriesType.EntityType !== 'JournalEntry') {
                    x._Register = this.numberSeriesService.registers.find(
                        r => r.EntityType === x.NumberSeriesType.EntityType
                    );
                }

                x._AsInvoiceNumber = this.numberSeriesService.asinvoicenumber[
                    this.asinvoicenumberserie === x.UseNumbersFromNumberSeriesID ? 1 : 0
                ];

                return x;
            });
            // Remove system series from UI
            this.numberseries = this.numberseries.filter(x =>
                ['JournalEntry batch number series', 'Integration test order number series'].indexOf(x.Name) === -1
            );

            this.setCurrent(this.currentSerie);
        }, error => this.errorService.handle(error));
    }

    private addCustomFields(result) {
        return result.map(x => {
            x._Register = this.numberSeriesService.registers.find(a => a.EntityType === 'JournalEntry');

            switch (x.Name) {
                case 'JournalEntry number series Yearly':
                case 'JournalEntry number series type yearly':
                    x._Task = 'Journal';
                    break;
                case 'JournalEntry number series type NOT yearly':
                    x._Task = 'Journal';
                    break;
                case 'JournalEntry invoice number series type':
                    x._Task = 'CustomerInvoice';
                    break;
                case 'JournalEntry supplierinvoice number series type':
                    x._Task = 'SupplierInvoice';
                    break;
                case 'JournalEntry salary number series type':
                    x._Task = 'Salary';
                    break;
                case 'JournalEntry bank number series type':
                    x._Task = 'Bank';
                    break;
                case 'JournalEntry vatreport number series type':
                    x._Task = 'VatReport';
                    break;
                case 'Customer Invoice number series':
                    x._Task = 'CustomerInvoice';
                    x._Register = this.numberSeriesService.registers.find(a => a.EntityType === 'CustomerInvoice');
                    break;
                case 'Customer Order number series':
                    x._Task = 'Order';
                    x._Register = this.numberSeriesService.registers.find(a => a.EntityType === 'CustomerOrder');
                    break;
                case 'Customer Quote number series':
                    x._Task = 'Quote';
                    x._Register = this.numberSeriesService.registers.find(a => a.EntityType === 'CustomerQuote');
                    break;
                case 'Customer Invoice Reminder number series':
                    x._Task = 'Reminder';
                    x._Register = this.numberSeriesService.registers.find(a => a.EntityType === 'Reminder');
                    break;
                case 'Department number series':
                    x._Register = this.numberSeriesService.registers.find(a => a.EntityType === 'Department');
                    break;
                case 'Project number series':
                    x._Register = this.numberSeriesService.registers.find(a => a.EntityType === 'Project');
                    break;
                case 'Customer number series':
                    x._Register = this.numberSeriesService.registers.find(a => a.EntityType === 'Customer');
                    break;
                case 'Supplier number series':
                    x._Register = this.numberSeriesService.registers.find(a => a.EntityType === 'Supplier');
                    break;
            }

            x._rowSelected = true;
            if (!x.Name) {
                x.Name = x.DisplayName;
            }

            return x;
        });
    }
}
