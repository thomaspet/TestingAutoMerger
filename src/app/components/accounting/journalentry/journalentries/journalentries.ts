import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {JournalEntryManual} from '../journalentrymanual/journalentrymanual';
import {Router, ActivatedRoute} from '@angular/router';
import {
    JournalEntryService,
    ErrorService,
    JournalEntryLineService,
    NumberSeriesService,
} from '../../../../services/services';
import {IContextMenuItem} from '../../../../../framework/ui/unitable/index';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {NumberSeriesTask, NumberSeries} from '../../../../unientities';
import {
    UniModalService,
    UniConfirmModalV2,
    ConfirmActions
} from '../../../../../framework/uniModal/barrel';
import {Observable} from 'rxjs/Observable';
import {SelectDraftLineModal} from './selectDraftLineModal';

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
    ) {
        this.tabService.addTab({
            name: 'Bilagsregistrering', url: '/accounting/journalentry/manual',
            moduleID: UniModules.Accounting, active: true
        });

        this.route.params.subscribe(params => {
            if (params['journalEntryNumber'] && params['journalEntryID']) {
                this.tabService.addTab({
                    name: 'Bilagsregistrering',
                    url: `/accounting/journalentry/manual;journalEntryNumber=${params['journalEntryNumber']};`
                        + `journalEntryID=${params['journalEntryID']}`,
                    moduleID: UniModules.Accounting,
                    active: true
                });

                this.editmode = false;
                if (params['editmode']) {
                    this.editmode = params['editmode'];
                }

                this.currentJournalEntryNumber = params['journalEntryNumber'];
                this.currentJournalEntryID = params['journalEntryID'];
            } else if (params['journalEntryID'] && params['journalEntryID'] !== '0') {
                this.journalEntryService.Get(params['journalEntryID'])
                    .subscribe(journalEntry => {
                        let journalEntryNumber = journalEntry.JournalEntryNumber;
                        this.tabService.addTab({
                            name: 'Bilagsregistrering',
                            url: `/accounting/journalentry/manual;journalEntryNumber=${journalEntryNumber};`
                                + `journalEntryID=${params['journalEntryID']}`,
                            moduleID: UniModules.Accounting,
                            active: true
                        });

                        this.editmode = false;
                        if (params['editmode']) {
                            this.editmode = params['editmode'];
                        }

                        this.currentJournalEntryNumber = journalEntryNumber;
                        this.currentJournalEntryID = params['journalEntryID'];
                    });
            } else if (params['journalEntryLineID'] && params['journalEntryLineID'] !== '0') {
                this.journalEntryLineService.Get(params['journalEntryLineID'])
                    .subscribe(journalEntryLine => {
                        let journalEntryNumber = journalEntryLine.JournalEntryNumber;
                        this.tabService.addTab({
                            name: 'Bilagsregistrering',
                            url: `/accounting/journalentry/manual;journalEntryNumber=${journalEntryNumber};`
                                + `journalEntryID=${params['journalEntryLineID']}`,
                            moduleID: UniModules.Accounting,
                            active: true
                        });

                        this.editmode = false;
                        if (params['editmode']) {
                            this.editmode = params['editmode'];
                        }

                        this.currentJournalEntryNumber = journalEntryNumber;
                        this.currentJournalEntryID = journalEntryLine.JournalEntryID;
                    });
            } else {
                this.tabService.addTab({
                    name: 'Bilagsregistrering',
                    url: '/accounting/journalentry/manual',
                    moduleID: UniModules.Accounting,
                    active: true
                });

                this.editmode = false;
                this.currentJournalEntryNumber = null;
                this.currentJournalEntryID = 0;
            }
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
                label: 'Rediger',
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

        let toolbarConfig: IToolbarConfig = {
            title: 'Bilagsregistrering',
            navigation: {
                prev: () => this.showPrevious(),
                next: () => this.showNext(),
                add:  () => this.add()
            },
            contextmenu: this.contextMenuItems
        };

        let selectConfig = this.journalEntryManual
            && !this.currentJournalEntryID
            && this.journalEntryManual.numberSeries.length > 1 ?
                {
                    items: this.numberSeriesService.CreateAndSet_DisplayNameAttributeOnSeries(this.journalEntryManual.numberSeries),
                    label: 'Nummerserie:',
                    selectedItem: this.selectedNumberSeries
                }
                : null;

        this.selectConfig = selectConfig;
        this.toolbarConfig = toolbarConfig;
    }

    public numberSeriesChanged(selectedNumberSerie) {
        if (this.journalEntryManual) {
            if (selectedNumberSerie && selectedNumberSerie.ID !== this.selectedNumberSeriesID) {
                let currentData = this.journalEntryManual.getJournalEntryData();

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

                    this.router.navigateByUrl(url);
                },
                err => this.errorService.handle(err)
            );
        });
    }

    private getDrafts() {
        this.journalEntryService.GetAll('filter=JournalEntryNumberNumeric eq null', ['DraftLines'])
            .subscribe(data => {
                const draftLines = data.map((x) => x.DraftLines[0]);
                const lines = draftLines.filter(x => x !== undefined);
                const totalAmount = data.map(x => x.DraftLines.filter(y => y.Amount > 0).map(z => z.Amount))
                    .map(x => x.reduce((a, c) => a + c, 0));
                draftLines.map((x, i) => x.Amount = totalAmount[i]);

                this.modalService.open(SelectDraftLineModal, {data: {draftLines: lines}})
                    .onClose
                    .subscribe(selectedLine => {
                        if (!selectedLine) {
                            return;
                        }
                        this.journalEntryManual.clear();
                        this.journalEntryManual.currentJournalEntryID = selectedLine.JournalEntryID;
                        this.currentJournalEntryID = selectedLine.JournalEntryID;
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

            this.router.navigateByUrl(`/accounting/journalentry/manual`);
        });
    }

    private editJournalEntry() {
        if (!this.journalEntryManual.isDirty) {
            this.editmode = true;
        }
    }

     private creditJournalEntry() {
        this.modalService.open(UniConfirmModalV2, {
            header: `Kreditere bilag ${this.currentJournalEntryNumber}?`,
            message: 'Vil du kreditere hele dette bilaget?',
            buttonLabels: {
                accept: 'Krediter',
                cancel: 'Avbryt'
            }
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                this.journalEntryService.creditJournalEntry(this.currentJournalEntryNumber)
                    .subscribe(
                        res => {
                            this.toastService.addToast(
                                'Kreditering utført',
                                ToastType.good,
                                5
                            );

                            this.journalEntryManual.loadData();
                        },
                        err => this.errorService.handle(err)
                    );
            }
        });
    }

    public onDataCleared() {

        this.journalEntryService.setSessionData(this.journalEntryManual.mode, []);

        if (this.currentJournalEntryID || this.currentJournalEntryNumber) {
            this.router.navigateByUrl(`/accounting/journalentry/manual`);
        }
    }
}
