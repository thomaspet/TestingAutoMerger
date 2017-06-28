import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {JournalEntryManual} from '../journalentrymanual/journalentrymanual';
import {Router, ActivatedRoute} from '@angular/router';
import {JournalEntryService, ErrorService, JournalEntryLineService} from '../../../../services/services';
import {UniConfirmModal, ConfirmActions} from '../../../../../framework/modals/confirm';
import {IContextMenuItem} from '../../../../../framework/ui/unitable/index';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {NumberSeriesTask} from '../../../../unientities';

@Component({
    selector: 'journalentries',
    templateUrl: './journalentries.html'
})
export class JournalEntries {
    @ViewChild(JournalEntryManual) private journalEntryManual: JournalEntryManual;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;

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
    private selectedNumberSeriesTask: NumberSeriesTask;
    private selectedNumberSeriesTaskID: number;
    private selectConfig: any;

    constructor(
        private route: ActivatedRoute,
        private tabService: TabService,
        private router: Router,
        private toastService: ToastService,
        private errorService: ErrorService,
        private journalEntryService: JournalEntryService,
        private journalEntryLineService: JournalEntryLineService) {
        this.tabService.addTab({ name: 'Bilagsregistrering', url: '/accounting/journalentry/manual', moduleID: UniModules.Accounting, active: true });

        this.route.params.subscribe(params => {
            if (params['journalEntryNumber'] && params['journalEntryID']) {
                this.tabService.addTab({
                    name: 'Bilagsregistrering',
                    url: `/accounting/journalentry/manual;journalEntryNumber=${params['journalEntryNumber']};journalEntryID=${params['journalEntryID']}`,
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
                            url: `/accounting/journalentry/manual;journalEntryNumber=${journalEntryNumber};journalEntryID=${params['journalEntryID']}`,
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
                            url: `/accounting/journalentry/manual;journalEntryNumber=${journalEntryNumber};journalEntryID=${params['journalEntryLineID']}`,
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

    private journalEntryManualInitialized() {
        // set selected numberseriestask to 1 by default (Journal)
        this.selectedNumberSeriesTaskID = 1;
        this.selectedNumberSeriesTask =
            this.journalEntryManual.numberSeriesTasks.find(x => x.ID === 1);

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

        let selectConfig = this.journalEntryManual && !this.currentJournalEntryID && this.journalEntryManual.numberSeriesTasks.length > 1 ?
            {
                items: this.journalEntryManual.numberSeriesTasks,
                selectedItem: this.selectedNumberSeriesTask,
                label: 'Nummerserie:'
            }
            : null;

        this.selectConfig = selectConfig;
        this.toolbarConfig = toolbarConfig;
    }

    private numberSeriesTaskChanged(selectedTask) {
        if (this.journalEntryManual) {
            if (selectedTask && selectedTask.ID !== this.selectedNumberSeriesTaskID) {
                let currentData = this.journalEntryManual.getJournalEntryData();

                if (currentData.length > 0) {
                    this.confirmModal.confirm(
                        'Du har allerede lagt til bilag - endring av nummerserie kan kunne oppdatere bilagsnr for alle bilagene',
                        'Bekreft endring',
                        false,
                        { accept: 'Fortsett', reject: 'Avbryt' }
                    ).then((response: ConfirmActions) => {
                        if (response === ConfirmActions.ACCEPT) {
                            // set the selectedNumberSeriesTaskID based on the selected numberseriestask,
                            // this will be databound to the journalentrymanual and journalentryprofessional
                            this.selectedNumberSeriesTaskID = selectedTask.ID;
                        } else {
                            // reset the selected task object to the previous task because
                            // the user doesnt want to change it anyway
                            this.selectedNumberSeriesTask =
                                this.journalEntryManual.numberSeriesTasks.find(x => x.ID === this.selectedNumberSeriesTaskID);

                            this.setupToolBarconfig();
                        }
                    });
                } else {
                    this.selectedNumberSeriesTaskID = selectedTask.ID;
                }
            }

            this.selectedNumberSeriesTask = selectedTask;
        }
    }
    private openPredefinedDescriptions() {
        this.router.navigate(['./predefined-descriptions']);
    }

    private showPrevious() {
        new Promise((resolve) => {
            if (this.journalEntryManual.isDirty) {
                this.confirmModal.confirm(
                        'Du har endringer som ikke er lagret, disse vil forkastes hvis du fortsetter - vil du fortsette?',
                        'Fortsette uten å lagre?')
                    .then(confirmDialogResponse => {
                        if (confirmDialogResponse === ConfirmActions.ACCEPT) {
                            this.journalEntryService.setSessionData(this.journalEntryManual.mode, []);
                            resolve();
                        }
                    });
            }else {
                resolve();
            }
        }).then(() => {
            if (this.currentJournalEntryNumber) {
                let journalEntryYear = this.currentJournalEntryNumber.split('-')[1];
                if (!journalEntryYear) {
                    journalEntryYear = this.journalEntryManual && this.journalEntryManual.currentFinancialYear ?
                        this.journalEntryManual.currentFinancialYear.Year.toString()
                        : '';
                }
                let journalEntryNumber = this.currentJournalEntryNumber.split('-')[0];

                this.journalEntryService.getPreviousJournalEntry(journalEntryYear, journalEntryNumber)
                    .subscribe(data => {
                        if (data && data.length > 0) {
                            this.router.navigateByUrl(`/accounting/journalentry/manual;journalEntryNumber=${data[0].JournalEntryNumber};journalEntryID=${data[0].JournalEntryID}`)
                        } else {
                            this.router.navigateByUrl(`/accounting/journalentry/manual`);
                        }
                    });
            } else {
                // no current number is set - go to the last number generated this year
                if (this.journalEntryManual.currentFinancialYear) {
                    this.journalEntryService.getPreviousJournalEntry(this.journalEntryManual.currentFinancialYear.Year, null)
                        .subscribe(data => {
                            if (data && data.length > 0) {
                                this.router.navigateByUrl(`/accounting/journalentry/manual;journalEntryNumber=${data[0].JournalEntryNumber};journalEntryID=${data[0].JournalEntryID}`)
                            } else {
                                this.router.navigateByUrl(`/accounting/journalentry/manual`);
                            }
                        });
                }
            }
        });
    }

    private showNext() {

        new Promise((resolve) => {
            if (this.journalEntryManual.isDirty) {
                this.confirmModal.confirm(
                        'Du har endringer som ikke er lagret, disse vil forkastes hvis du fortsetter - vil du fortsette?',
                        'Fortsette uten å lagre?')
                    .then(confirmDialogResponse => {
                        if (confirmDialogResponse === ConfirmActions.ACCEPT) {
                            this.journalEntryService.setSessionData(this.journalEntryManual.mode, []);
                            resolve();
                        }
                    });
            } else {
                resolve();
            }
        }).then(() => {
            if (this.currentJournalEntryNumber) {
                let journalEntryYear = this.currentJournalEntryNumber.split('-')[1];
                if (!journalEntryYear) {
                    journalEntryYear = this.journalEntryManual && this.journalEntryManual.currentFinancialYear ?
                        this.journalEntryManual.currentFinancialYear.Year.toString()
                        : '';
                }
                let journalEntryNumber = this.currentJournalEntryNumber.split('-')[0];

                this.journalEntryService.getNextJournalEntry(journalEntryYear, journalEntryNumber)
                    .subscribe(data => {
                        if (data && data.length > 0) {
                            this.router.navigateByUrl(`/accounting/journalentry/manual;journalEntryNumber=${data[0].JournalEntryNumber};journalEntryID=${data[0].JournalEntryID}`)
                        } else {
                            this.router.navigateByUrl(`/accounting/journalentry/manual`);
                        }
                    });
            } else {
                // no current number is set - go to the first number generated this year
                if (this.journalEntryManual.currentFinancialYear) {
                    this.journalEntryService.getNextJournalEntry(this.journalEntryManual.currentFinancialYear.Year, null)
                        .subscribe(data => {
                            if (data && data.length > 0) {
                                this.router.navigateByUrl(`/accounting/journalentry/manual;journalEntryNumber=${data[0].JournalEntryNumber};journalEntryID=${data[0].JournalEntryID}`)
                            } else {
                                this.router.navigateByUrl(`/accounting/journalentry/manual`);
                            }
                        });
                }
            }
        });
    }

    private add() {
        if (this.journalEntryManual.isDirty) {
            this.confirmModal.confirm(
                    'Du har endringer som ikke er lagret, disse vil forkastes hvis du fortsetter - vil du fortsette?',
                    'Fortsette uten å lagre?')
                .then(confirmDialogResponse => {
                    if (confirmDialogResponse === ConfirmActions.ACCEPT) {
                        this.journalEntryService.setSessionData(this.journalEntryManual.mode, []);
                        this.journalEntryManual.setJournalEntryData([]);
                        this.journalEntryManual.clearJournalEntryInfo();

                        this.router.navigateByUrl(`/accounting/journalentry/manual`);
                    }
                });
        } else {
            this.journalEntryService.setSessionData(this.journalEntryManual.mode, []);
            this.journalEntryManual.setJournalEntryData([]);
            this.journalEntryManual.clearJournalEntryInfo();

            this.router.navigateByUrl(`/accounting/journalentry/manual`);
        }
    }

    private editJournalEntry() {
        if (!this.journalEntryManual.isDirty) {
            this.editmode = true;
        }
    }

     private creditJournalEntry() {
        this.confirmModal.confirm('Vil du kreditere hele dette bilaget?', `Kreditere bilag ${this.currentJournalEntryNumber}?`, false, { accept: 'Krediter', reject: 'Avbryt'}, ).then( (userChoice: ConfirmActions) => {
            if (userChoice === ConfirmActions.ACCEPT) {
                this.journalEntryService.creditJournalEntry(this.currentJournalEntryNumber)
                    .subscribe((res) => {
                        this.toastService.addToast('Kreditering utført', ToastType.good, 5);
                        this.journalEntryManual.loadData();
                    },
                    err => this.errorService.handle(err)
                );
            }
        });
    }


    private onDataCleared() {

        this.journalEntryService.setSessionData(this.journalEntryManual.mode, []);

        if (this.currentJournalEntryID || this.currentJournalEntryNumber) {
            this.router.navigateByUrl(`/accounting/journalentry/manual`);
        }
    }
}
