import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {JournalEntryManual} from '../journalentrymanual/journalentrymanual';
import {Router, ActivatedRoute} from '@angular/router';
import {
    JournalEntryService,
    ErrorService,
    JournalEntryLineService,
    NumberSeriesService,
    StatisticsService,
} from '../../../../services/services';
import {IContextMenuItem} from '../../../../../framework/ui/unitable/index';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';
import {NumberSeriesTask, NumberSeries, JournalEntry, JournalEntryLineDraft} from '../../../../unientities';
import {
    UniModalService,
    UniConfirmModalV2,
    ConfirmActions
} from '../../../../../framework/uni-modal';
import {Observable} from 'rxjs/Observable';
import {SelectDraftLineModal} from './selectDraftLineModal';
import {ConfirmCreditedJournalEntryWithDate} from '../../modals/confirmCreditedJournalEntryWithDate';
import { JournalEntryData } from '@app/models/models';

@Component({
    selector: 'journalentries',
    templateUrl: './journalentries.html'
})
export class JournalEntries {
    @ViewChild(JournalEntryManual)
    private journalEntryManual: JournalEntryManual;
    private contextMenuItems: IContextMenuItem[] = [];

    private toolbarConfig: IToolbarConfig = {
        title: 'Bilagsregistrering',
        navigation: {
            prev: () => this.showPrevious(),
            next: () => this.showNext(),
            add:  () => this.add()
        },
        contextmenu: this.contextMenuItems
    };

    private currentJournalEntryNumber: string;
    private currentJournalEntryID: number;
    public editmode: boolean = false;
    private selectedNumberSeries: NumberSeries;
    private selectedNumberSeriesID: number;
    private selectedNumberSeriesTaskID: number;
    private selectConfig: any;

    constructor(
        private route: ActivatedRoute,
        private tabService: TabService,
        private router: Router,
        private toastService: ToastService,
        private errorService: ErrorService,
        private journalEntryService: JournalEntryService,
        private journalEntryLineService: JournalEntryLineService,
        private modalService: UniModalService,
        private numberSeriesService: NumberSeriesService,
        private statisticsService: StatisticsService
    ) {
        this.tabService.addTab({
            name: 'Bilagsregistrering',
            url: '/accounting/journalentry/manual',
            moduleID: UniModules.Accounting,
            active: true
        });

        this.route.params.subscribe(params => {
            const journalEntryID = params['journalEntryID'];
            const journalEntryNumber = params['journalEntryNumber'];

            if (journalEntryID) {
                this.currentJournalEntryID = journalEntryID;
                let tabUrl = `/accounting/journalentry/manual;journalEntryID=${journalEntryID}`;

                if (journalEntryNumber) {
                    this.currentJournalEntryNumber = journalEntryNumber;
                    tabUrl += `;journalEntryNumber=${journalEntryNumber}`;
                    this.tabService.addTab({
                        name: 'Bilagsregistrering',
                        url: tabUrl,
                        moduleID: UniModules.Accounting,
                        active: true
                    });
                }

                this.editmode = false;
                if (params['editmode'] || !journalEntryNumber) {
                    this.journalEntryService.Get(params['journalEntryID'], ['DraftLines'])
                        .subscribe(journalEntry => {
                            this.currentJournalEntryNumber = journalEntry.JournalEntryNumber;
                            tabUrl += `;journalEntryNumber=${journalEntry.JournalEntryNumber}`;
                            this.tabService.addTab({
                                name: 'Bilagsregistrering',
                                url: tabUrl,
                                moduleID: UniModules.Accounting,
                                active: true
                            });

                            if (params['editmode']) {
                                this.editJournalEntry(journalEntry);
                            }
                        });
                }
            } else {
                this.editmode = false;
                this.currentJournalEntryNumber = null;
                this.currentJournalEntryID = 0;
            }


            // if (params['journalEntryNumber'] && params['journalEntryID']) {
            //     this.tabService.addTab({
            //         name: 'Bilagsregistrering',
            //         url: `/accounting/journalentry/manual;journalEntryNumber=${params['journalEntryNumber']};`
            //             + `journalEntryID=${params['journalEntryID']}`,
            //         moduleID: UniModules.Accounting,
            //         active: true
            //     });

            //     this.editmode = false;
            //     if (params['editmode']) {
            //         this.journalEntryService.Get(params['journalEntryID'], ['DraftLines'])
            //             .subscribe(journalEntry => {
            //                 this.editmode = params['editmode'];
            //                 this.editJournalEntry(journalEntry);
            //             }
            //         );
            //     }

            //     this.currentJournalEntryNumber = params['journalEntryNumber'];
            //     this.currentJournalEntryID = params['journalEntryID'];
            // } else if (params['journalEntryID'] && params['journalEntryID'] !== '0') {
            //     this.currentJournalEntryID = params['journalEntryID'];
            //     this.journalEntryService.Get(params['journalEntryID'])
            //         .subscribe(journalEntry => {
            //             const journalEntryNumber = journalEntry.JournalEntryNumber;
            //             this.tabService.addTab({
            //                 name: 'Bilagsregistrering',
            //                 url: `/accounting/journalentry/manual;journalEntryNumber=${journalEntryNumber};`
            //                     + `journalEntryID=${params['journalEntryID']}`,
            //                 moduleID: UniModules.Accounting,
            //                 active: true
            //             });

            //             this.editmode = false;
            //             if (params['editmode']) {
            //                 this.editmode = params['editmode'];
            //                 setTimeout(() => this.editJournalEntry(journalEntry));
            //             }

            //             this.currentJournalEntryNumber = journalEntryNumber;

            //         });
            // }
            // } else if (params['journalEntryLineID'] && params['journalEntryLineID'] !== '0') {
            //     this.journalEntryLineService.Get(params['journalEntryLineID'])
            //         .subscribe(journalEntryLine => {
            //             const journalEntryNumber = journalEntryLine.JournalEntryNumber;
            //             this.tabService.addTab({
            //                 name: 'Bilagsregistrering',
            //                 url: `/accounting/journalentry/manual;journalEntryNumber=${journalEntryNumber};`
            //                     + `journalEntryID=${params['journalEntryLineID']}`,
            //                 moduleID: UniModules.Accounting,
            //                 active: true
            //             });

            //             this.editmode = false;
            //             if (params['editmode']) {
            //                 this.editmode = params['editmode'];
            //                 setTimeout(() => this.editJournalEntry());
            //             }

            //             this.currentJournalEntryNumber = journalEntryNumber;
            //             this.currentJournalEntryID = journalEntryLine.JournalEntryID;
            //         });
            // } else {
            //     this.tabService.addTab({
            //         name: 'Bilagsregistrering',
            //         url: '/accounting/journalentry/manual',
            //         moduleID: UniModules.Accounting,
            //         active: true
            //     });

            //     this.editmode = false;
            //     this.currentJournalEntryNumber = null;
            //     this.currentJournalEntryID = 0;
            // }
            this.setupToolBarconfig();
        });
    }

    public journalEntryManualInitialized() {
        this.selectedNumberSeries = this.journalEntryManual.numberSeries[0];
        this.selectedNumberSeriesID =  this.selectedNumberSeries ? this.selectedNumberSeries.ID : null;
        this.selectedNumberSeriesTaskID = this.selectedNumberSeries !== null ? this.selectedNumberSeries.NumberSeriesTaskID : 0;

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
            title: 'Bilagsregistrering',
            navigation: {
                prev: () => this.showPrevious(),
                next: () => this.showNext(),
                add:  () => this.add()
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

    public numberSeriesChanged(selectedNumberSerie) {
        if (this.journalEntryManual) {
            if (selectedNumberSerie && selectedNumberSerie.ID !== this.selectedNumberSeriesID) {
                const currentData = this.journalEntryManual.getJournalEntryData();

                if (currentData.length > 0) {
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
                            // set the selectedNumberSeriesID based on the selected numberseries,
                            // this will be databound to the journalentrymanual and journalentryprofessional
                            this.selectedNumberSeriesID = selectedNumberSerie.ID;
                            currentData.forEach(data => { data.NumberSeriesID = this.selectedNumberSeriesID; });
                        } else {
                            // reset the selected task object to the previous task because
                            // the user doesnt want to change it anyway
                            this.selectedNumberSeries = this.journalEntryManual.numberSeries
                                .find(ns => ns.ID === this.selectedNumberSeriesID);

                            this.setupToolBarconfig();
                        }
                    });
                } else {
                    this.selectedNumberSeriesID = selectedNumberSerie.ID;
                }
            }

            this.selectedNumberSeries = selectedNumberSerie;
            this.selectedNumberSeriesTaskID = selectedNumberSerie.NumberSeriesTaskID;
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
                year = split[1];
            }

            if (!year) {
                year = this.journalEntryManual && this.journalEntryManual.currentFinancialYear
                    ? this.journalEntryManual.currentFinancialYear.Year.toString()
                    : '';
            }

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
            'select=min(JournalEntry.CreatedAt,) as MinJournalEntryCreatedAt,JournalEntry.JournalEntryDraftGroup as JournalEntryDraftGroup,JournalEntry.Description,user.DisplayName&' +
            'filter=isnull(JournalEntryNumberNumeric,-1) eq -1 and isnull(SupplierInvoice.Id,0) eq 0 and isnull(JournalEntry.JournalEntryDraftGroup,\'00000000-0000-0000-0000-000000000000\') ne \'00000000-0000-0000-0000-000000000000\'&' +
            'join=JournalEntry.CreatedBy eq User.GlobalIdentity and JournalEntry.Id eq SupplierInvoice.JournalEntryId'
        )
            .subscribe(journalEntries => {
                this.modalService.open(SelectDraftLineModal, {data: {draftLines: journalEntries.Data}})
                    .onClose
                    .subscribe(selectedLine => {
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
            err => this.errorService.handle(err));
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
                year = split[1];
            }

            if (!year) {
                year = this.journalEntryManual && this.journalEntryManual.currentFinancialYear
                    ? this.journalEntryManual.currentFinancialYear.Year.toString()
                    : '';
            }

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

    private add() {
        this.canDeactivate().subscribe(canDeactivate => {
            if (!canDeactivate) {
                return;
            }

            this.journalEntryService.setSessionData(this.journalEntryManual.mode, []);
            this.journalEntryManual.setJournalEntryData([]);
            this.journalEntryManual.clearJournalEntryInfo();
            this.journalEntryManual.currentJournalEntryID = '';
            this.currentJournalEntryID = 0;

            this.router.navigateByUrl(`/accounting/journalentry/manual`);
        });
    }

    private editJournalEntry(data?: JournalEntry) {
        this.modalService.open(ConfirmCreditedJournalEntryWithDate, {
            header: `Bilag ${this.currentJournalEntryNumber} blir kreditert før du korrigerer.`,
            message: 'Vil du kreditere hele dette bilaget?',
            buttonLabels: {
                accept: 'Krediter',
                cancel: 'Avbryt'
            },
            data: {JournalEntryID: data ? data.ID : null, JournalEntryAccrualID: data ? data.JournalEntryAccrualID : null}
        }).onClose.subscribe(response => {
            if (response && response.action === ConfirmActions.ACCEPT) {
                this.journalEntryService.creditJournalEntry(this.currentJournalEntryNumber, response.creditDate)
                    .subscribe(
                        res => {
                            this.toastService.addToast(
                                'Kreditering utført',
                                ToastType.good,
                                ToastTime.short
                            );

                            this.editmode = true;
                        },
                        err => {
                            this.errorService.handle(err);
                            this.editmode = false;
                        }
                    );
            } else if (response && response.action === ConfirmActions.CANCEL) {
                this.editmode = false;
            } else {
                this.editmode = false;
            }
        });
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
                JournalEntryID: this.currentJournalEntryID,
                JournalEntryAccrualID: this.journalEntryManual.currentJournalEntryData ?
                    this.journalEntryManual.currentJournalEntryData.JournalEntryDataAccrualID
                    : null
            }
        }).onClose.subscribe(response => {
            if (response.action === ConfirmActions.ACCEPT) {
                this.journalEntryService.creditJournalEntry(this.currentJournalEntryNumber, response.creditDate)
                    .subscribe(
                        res => {
                            this.toastService.addToast(
                                'Kreditering utført',
                                ToastType.good,
                                ToastTime.short
                            );

                            this.journalEntryManual.loadData();
                        },
                        err => this.errorService.handle(err)
                    );
            }
        });
    }

    public onDataCleared() {

        this.currentJournalEntryID = null;
        this.journalEntryService.setSessionData(this.journalEntryManual.mode, []);

        if (this.currentJournalEntryID || this.currentJournalEntryNumber) {
            this.router.navigateByUrl(`/accounting/journalentry/manual`);
        }
    }
}
