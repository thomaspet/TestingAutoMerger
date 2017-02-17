import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {JournalEntryManual} from '../journalentrymanual/journalentrymanual';
import {Router, ActivatedRoute} from '@angular/router';
import {JournalEntryService} from '../../../../services/services';
import {UniConfirmModal, ConfirmActions} from '../../../../../framework/modals/confirm';


@Component({
    selector: 'journalentries',
    templateUrl: 'app/components/accounting/journalentry/journalentries/journalentries.html'
})
export class JournalEntries {
    @ViewChild(JournalEntryManual) private journalEntryManual;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;

    private toolbarConfig = {
        title: 'Bilagsregistrering',
        navigation: {
            prev: () => this.showPrevious(),
            next: () => this.showNext(),
            add:  () => this.add()
        }
    };

    private currentJournalEntryNumber: string;
    private currentJournalEntryID: number;
    public editmode: boolean = false;

    constructor(private route: ActivatedRoute, private tabService: TabService, private router: Router, private journalEntryService: JournalEntryService) {
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
        });
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

    private onDataCleared() {

        this.journalEntryService.setSessionData(this.journalEntryManual.mode, []);

        if (this.currentJournalEntryID || this.currentJournalEntryNumber) {
            this.router.navigateByUrl(`/accounting/journalentry/manual`);
        }
    }
}
