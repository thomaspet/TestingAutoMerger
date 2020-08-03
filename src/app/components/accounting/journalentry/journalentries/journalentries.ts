import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {JournalEntryManual} from '../journalentrymanual/journalentrymanual';
import {Router, ActivatedRoute} from '@angular/router';
import {
    JournalEntryService,
    ErrorService,
    NumberSeriesService,
    StatisticsService,
} from '../../../../services/services';
import {IContextMenuItem} from '../../../../../framework/ui/unitable/index';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';
import {NumberSeries, JournalEntry, LocalDate} from '../../../../unientities';
import {
    UniModalService,
    UniConfirmModalV2,
    ConfirmActions
} from '../../../../../framework/uni-modal';
import {Observable} from 'rxjs';
import {SelectDraftLineModal} from './selectDraftLineModal';
import {ConfirmCreditedJournalEntryWithDate} from '../../../common/modals/confirmCreditedJournalEntryWithDate';

@Component({
    selector: 'journalentries',
    templateUrl: './journalentries.html'
})
export class JournalEntries {
    @ViewChild(JournalEntryManual, { static: true }) journalEntryManual: JournalEntryManual;
    public contextMenuItems: IContextMenuItem[] = [];

    public toolbarConfig: IToolbarConfig = {
        title: 'Bilagsføring',
        omitFinalCrumb: true,
        navigation: {
            prev: () => this.showPrevious(),
            next: () => this.showNext(),
        },
        contextmenu: this.contextMenuItems
    };

    public currentJournalEntryNumber: string;
    public currentJournalEntryID: number;
    public editmode: boolean = false;
    public creditDate: LocalDate = null;
    public numberSeriesIDFromParam = null;
    public selectedNumberSeries: NumberSeries;
    public selectConfig: any;
    private tab = {
        name: 'Bilagsføring',
        url: '',
        moduleID: UniModules.Accounting,
        active: true
    };

    constructor(
        private route: ActivatedRoute,
        private tabService: TabService,
        private router: Router,
        private toastService: ToastService,
        private errorService: ErrorService,
        private journalEntryService: JournalEntryService,
        private modalService: UniModalService,
        private numberSeriesService: NumberSeriesService,
        private statisticsService: StatisticsService
    ) {
        this.route.params.subscribe(params => {
            const journalEntryID = +params['journalEntryID'];
            const journalEntryNumber = params['journalEntryNumber'];
            this.numberSeriesIDFromParam = +params['numberseriesID'];
            this.tab.url = this.router.url;

            if (journalEntryID) {
                this.currentJournalEntryID = journalEntryID;

                if (journalEntryNumber) {
                    this.currentJournalEntryNumber = journalEntryNumber;
                    this.tabService.addTab(this.tab);
                }

                this.editmode = false;
                if (params['editmode'] || !journalEntryNumber) {
                    this.journalEntryService.Get(params['journalEntryID'], ['DraftLines'])
                        .subscribe(journalEntry => {
                            this.currentJournalEntryNumber = journalEntry.JournalEntryNumber;
                            this.tabService.addTab(this.tab);

                            if (params['editmode']) {
                                this.editJournalEntry(journalEntry);
                            }
                        });
                }
            } else {
                this.editmode = false;
                this.currentJournalEntryNumber = null;
                this.currentJournalEntryID = 0;
                this.tabService.addTab(this.tab);
            }
            this.setupToolBarconfig();
        });
    }

    public journalEntryManualInitialized() {
        const id = this.numberSeriesIDFromParam || this.journalEntryService.getSessionNumberSeries();

        this.selectedNumberSeries = id
            ? this.journalEntryManual.numberSeries.find(serie => serie.ID === id)
            : this.journalEntryManual.numberSeries[0];

        if (!this.selectedNumberSeries) {
            // the numberseries that was used is not found - this indicates that the user
            // has changed year, so the previsous used numberseries is not valid anymore.
            // Set the first available numberseries - this will ask the user to update
            // existing journalentries if any
            if (id) {
                // get the numberseries based on the id, and find the corresponding
                // numberseries for this year
                this.numberSeriesService.Get(id)
                    .subscribe(currentNumberSeries => {
                        if (currentNumberSeries) {
                            // try to find a valid numberseries based on the type and taskid
                            const validNumberSeries =
                                this.journalEntryManual.numberSeries
                                    .find(x => x.NumberSeriesTypeID === currentNumberSeries.NumberSeriesTypeID
                                        && x.NumberSeriesTaskID === currentNumberSeries.NumberSeriesTaskID);

                            if (validNumberSeries) {
                                // we found one with the same type/task, use that one
                                this.numberSeriesChanged(validNumberSeries, false);
                            } else {
                                // no valid found, just use the first in the list then..
                                this.numberSeriesChanged(this.journalEntryManual.numberSeries[0], false);
                            }
                        }
                    }, err => {
                        // we couldnt find any numberseries based on the set id, it has probably
                        // been deleted, so just set the first one we have..
                        this.numberSeriesChanged(this.journalEntryManual.numberSeries[0], false);
                    });
            }
        }

        this.setupToolBarconfig();
    }

    private setupToolBarconfig() {

        this.contextMenuItems = [
            {
                label: 'Korriger',
                action: () => this.editJournalEntry(),
                disabled: () => this.editmode === true || !this.currentJournalEntryID
            },
            {
                label: 'Krediter',
                action: () => this.creditJournalEntry(),
                disabled: () => this.editmode === true || !this.currentJournalEntryID
            },
            {
                label: 'Tøm listen',
                action: () => this.journalEntryManual.removeJournalEntryData(),
                disabled: () => false
            },
            {
                action: (item) => this.openPredefinedDescriptions(),
                disabled: (item) => false,
                label: 'Faste tekster'
            },
            {
                label: 'Hent kladd',
                action: () => this.getDrafts(),
                disabled: () => false
            }
        ];

        const toolbarConfig: IToolbarConfig = {
            title: 'Bilagsføring',
            omitFinalCrumb: true,
            navigation: {
                prev: () => this.showPrevious(),
                next: () => this.showNext()
            },
            contextmenu: this.contextMenuItems
        };

        const selectConfig = this.journalEntryManual
            && !this.currentJournalEntryID
            && this.journalEntryManual.numberSeries.length > 1 ?
                {
                    items: this.numberSeriesService.CreateAndSet_DisplayNameAttributeOnSeries(this.journalEntryManual.numberSeries),
                    label: 'Nummerserie',
                    selectedItem: this.selectedNumberSeries
                }
                : null;

        this.selectConfig = selectConfig;
        this.toolbarConfig = toolbarConfig;
    }

    public numberSeriesChanged(selectedNumberSerie, askBeforeChanging: boolean) {
        if (this.journalEntryManual) {
            if (selectedNumberSerie && (!this.selectedNumberSeries || selectedNumberSerie.ID !== this.selectedNumberSeries.ID)) {
                const currentData = this.journalEntryManual.getJournalEntryData();

                if (askBeforeChanging && currentData && currentData.length > 0) {
                    this.modalService.open(UniConfirmModalV2, {
                        header: 'Bekreft endring',
                        message: 'Du har allerede lagt til bilag - '
                            + 'endring av nummerserie kan kunne oppdatere bilagsnr for alle bilagene',
                        buttonLabels: {
                            accept: 'Fortsett',
                            cancel: 'Avbryt'
                        }
                    }).onClose.subscribe(response => {
                        if (response === ConfirmActions.ACCEPT) {
                            // Update current selected numberseries. Set to data, tab and sessionstorage
                            this.selectedNumberSeries = selectedNumberSerie;

                            currentData.forEach(data => { data.NumberSeriesID = selectedNumberSerie.ID; });
                            const url = this.router.url;
                            this.tabService.currentActiveTab.url = url + ';numberseriesID=' + this.selectedNumberSeries.ID;
                            this.journalEntryService.setSessionNumberSeries(this.selectedNumberSeries.ID);
                        }
                        this.setupToolBarconfig();
                    });
                } else {
                    // Update current selected numberseries. Set to tab and sessionstorage
                    this.selectedNumberSeries = selectedNumberSerie;
                    const url = this.router.url;
                    this.tabService.currentActiveTab.url = url + ';numberseriesID=' + this.selectedNumberSeries.ID;
                    this.journalEntryService.setSessionNumberSeries(this.selectedNumberSeries.ID);
                    this.setupToolBarconfig();
                }
            }
        }
    }

    private openPredefinedDescriptions() {
        this.router.navigate(['./predefined-descriptions']);
    }

    public canDeactivate(): Observable<boolean> {
        return !this.journalEntryManual.isDirty
            ? Observable.of(true)
            : this.modalService.openRejectChangesModal()
                .onClose
                .map(result => {
                    return result !== ConfirmActions.CANCEL;
                });
    }

    private showPrevious() {
        this.canDeactivate().subscribe(canDeactivate => {
            if (!canDeactivate) {
                return;
            }

            let journalEntryNumber, year;
            if (this.currentJournalEntryNumber) {
                const split = this.currentJournalEntryNumber.split('-');
                journalEntryNumber = split[0];
            }

            year = this.journalEntryManual && this.journalEntryManual.currentFinancialYear
                ? this.journalEntryManual.currentFinancialYear.Year.toString()
                : '';

            this.journalEntryService.getPreviousJournalEntry(year, journalEntryNumber || null).subscribe(
                res => {
                    let url = '/accounting/journalentry/manual';
                    if (res.length) {
                        url += `;journalEntryNumber=${res[0].JournalEntryNumber}`;
                        url += `;journalEntryID=${res[0].JournalEntryID}`;
                    }

                    this.editmode = false;
                    this.router.navigateByUrl(url);
                },
                err => this.errorService.handle(err)
            );
        });
    }

    private getDrafts() {
        // get drafts - this can contain multiple journalentries, grouped by JournalEntryDraftGroup
        this.statisticsService.GetAll(
            'model=JournalEntry&' +
            'distinct=true&' +
            'select=min(JournalEntry.CreatedAt,) as MinJournalEntryCreatedAt,JournalEntry.JournalEntryDraftGroup' +
            ' as JournalEntryDraftGroup,JournalEntry.Description,user.DisplayName&' +
            'filter=isnull(JournalEntryNumberNumeric,-1) eq -1 and isnull(SupplierInvoice.Id,0) eq 0 and ' +
            'isnull(JournalEntry.JournalEntryDraftGroup,\'00000000-0000-0000-0000-000000000000\') ne' +
            ' \'00000000-0000-0000-0000-000000000000\'&' +
            'join=JournalEntry.CreatedBy eq User.GlobalIdentity and JournalEntry.Id eq SupplierInvoice.JournalEntryId'
        ).subscribe(
            (journalEntries) => {
                this.modalService.open(SelectDraftLineModal, {
                    data: journalEntries.Data
                }).onClose.subscribe(selectedLine => {
                    if (!selectedLine) {
                        return;
                    }

                    // get data based on the JournalEntryDraftGroup - finding relevant data is done by the API
                    this.journalEntryService.getJournalEntryDataByJournalEntryDraftGroup(selectedLine.JournalEntryDraftGroup)
                        .subscribe(journalEntryData => {




                            this.editmode = false;
                            this.journalEntryManual.currentJournalEntryID = null;
                            this.currentJournalEntryID = 0;

                            setTimeout(() => {
                                this.journalEntryManual.setJournalEntryData(journalEntryData);
                                this.journalEntryManual.isDirty = true;

                            });
                        }, err => this.errorService.handle(err)
                    );
                });
            },
            err => this.errorService.handle(err)
        );
    }

    private showNext() {
        this.canDeactivate().subscribe(canDeactivate => {
            if (!canDeactivate) {
                return;
            }

            let journalEntryNumber, year;
            if (this.currentJournalEntryNumber) {
                const split = this.currentJournalEntryNumber.split('-');
                journalEntryNumber = split[0];
            }

            year = this.journalEntryManual && this.journalEntryManual.currentFinancialYear
                ? this.journalEntryManual.currentFinancialYear.Year.toString()
                : '';

            this.journalEntryService.getNextJournalEntry(year, journalEntryNumber || null).subscribe(
                res => {
                    let url = '/accounting/journalentry/manual';
                    if (res.length) {
                        url += `;journalEntryNumber=${res[0].JournalEntryNumber}`;
                        url += `;journalEntryID=${res[0].JournalEntryID}`;
                    }
                    this.editmode = false;
                    this.router.navigateByUrl(url);
                },
                err => this.errorService.handle(err)
            );
        });
    }

    private editJournalEntry(data?: JournalEntry) {
        this.editmode = true;
    }

     private creditJournalEntry() {
        this.modalService.open(ConfirmCreditedJournalEntryWithDate, {
            header: `Kreditere bilag ${this.currentJournalEntryNumber}?`,
            message: 'Vil du kreditere hele dette bilaget?',
            buttonLabels: {
                accept: 'Krediter',
                cancel: 'Avbryt'
            },
            data: {
                JournalEntryID: this.currentJournalEntryID
            }
        }).onClose.subscribe(response => {
            if (response && response.action === ConfirmActions.ACCEPT) {
                this.journalEntryService.creditJournalEntry(this.currentJournalEntryNumber, response.creditDate)
                    .subscribe(res => {
                        if (res?.ProgressUrl) {
                            this.toastService.addToast(
                                'Kreditering startet', ToastType.good, ToastTime.long,
                                'Det opprettes en jobb for krediteringen av bilaget. ' +
                                'Avhengig av antall linjer kan dette ta litt tid. Vennligst vent.'
                            );

                            this.journalEntryService.waitUntilJobCompleted(res.ID).subscribe(() => {
                                this.displayCreditJournalEntryDoneToast();
                            },
                            err => this.errorService.handle(err)
                            );
                        } else {
                            this.displayCreditJournalEntryDoneToast();
                        }
                    },
                    err => this.errorService.handle(err)
                    );
            }
        });
    }

    private displayCreditJournalEntryDoneToast() {
        this.toastService.addToast(
            'Kreditering utført',
            ToastType.good,
            ToastTime.short
            );

        this.journalEntryManual.loadData();
    }

    public onDataCleared() {

        this.currentJournalEntryID = null;
        this.journalEntryService.setSessionData(this.journalEntryManual.mode, []);

        if (this.currentJournalEntryID || this.currentJournalEntryNumber) {
            this.router.navigateByUrl(`/accounting/journalentry/manual`);
        }
    }
}
