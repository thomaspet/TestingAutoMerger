import {Component, OnInit, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {Observable} from 'rxjs/Rx';
import {AMeldingService} from '../../../services/Salary/AMelding/AMeldingService';
import {PayrollrunService} from '../../../services/Salary/Payrollrun/PayrollrunService';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {AmeldingData} from '../../../unientities';
import {IContextMenuItem} from 'unitable-ng2/main';
import {IUniSaveAction} from '../../../../framework/save/save';
import {SelectAmeldingTypeModal} from './modals/selectAmeldingTypeModal';
import {AltinnAuthenticationDataModal} from '../../common/modals/AltinnAuthenticationDataModal';
import {UniSave} from '../../../../framework/save/save';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {UniStatusTrack} from '../../common/toolbar/statustrack';

declare var moment;

@Component({
    selector: 'amelding-view',
    templateUrl: 'app/components/salary/amelding/ameldingview.html'
})

export class AMeldingView implements OnInit {
    private busy: boolean = true;
    private currentPeriod: number;
    private currentMonth: string;
    private currentAMelding: AmeldingData;
    private currentSumUp: any;
    private aMeldingerInPeriod: AmeldingData[];
    private contextMenuItems: IContextMenuItem[] = [];
    private actions: IUniSaveAction[];
    private clarifiedDate: string = '';
    private submittedDate: string = '';
    private feedbackObtained: boolean = false;
    private totalAga: number = 0;
    private legalEntityNo: string;
    @ViewChild(SelectAmeldingTypeModal) private aMeldingTypeModal: SelectAmeldingTypeModal;
    @ViewChild(AltinnAuthenticationDataModal) private altinnAuthModal: AltinnAuthenticationDataModal;
    @ViewChild(UniSave) private saveComponent: UniSave;
    private saveStatus: {numberOfRequests: number, completeCount: number, hasErrors: boolean};
    public showView: string = '';
    private toolbarConfig: IToolbarConfig;
    private periodStatus: string;

    constructor(
        private _tabService: TabService,
        private _ameldingService: AMeldingService,
        private _toastService: ToastService,
        private _payrollService: PayrollrunService
    ) {
        this._tabService.addTab({name: 'A-Melding', url: 'salary/amelding', moduleID: UniModules.Amelding, active: true});

        this.contextMenuItems = [
            {
                label: 'Hent a-meldingsfil',
                action: () => {
                    this.getAMeldingFile();
                },
                disabled: () => {
                    if (!this.currentAMelding) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        ];

        this.updateToolbar();
    }

    public ngOnInit() {
        // REVISIT TODO: get correct year (as param 2) when settled from core how to use years
        this._payrollService.getLatestSettledPeriod(1, 2016)
            .subscribe((period) => {
                this.currentPeriod = period;
                this.currentMonth = moment.months()[this.currentPeriod - 1];
                this.getAMeldingForPeriod();
            });
    }

    public prevPeriod() {
        if (this.currentPeriod !== 1) {
            if (this.currentPeriod > 1) {
                this.currentPeriod -= 1;
                this.currentMonth = moment.months()[this.currentPeriod - 1];
            }
            this.clearAMelding();
            this.getAMeldingForPeriod();
        }
    }

    public nextPeriod() {
        if (this.currentPeriod !== 12) {
            if (this.currentPeriod < 12) {
                this.currentPeriod += 1;
                this.currentMonth = moment.months()[this.currentPeriod - 1];
            }
            this.clearAMelding();
            this.getAMeldingForPeriod();
        }
    }

    public getAMeldingFile() {
        if (this.currentAMelding) {
            this._ameldingService.getAMeldingFile(this.currentAMelding.ID)
                .subscribe(amldfile => {
                    var a = document.createElement('a');
                    var dataURI = 'data:text/xml;base64,' + btoa(amldfile);
                    a.href = dataURI;
                    let prd: string = this.currentPeriod < 10 ? '0' + this.currentPeriod.toString() : this.currentPeriod.toString();
                    a['download'] = `amelding_${prd}_${this.currentAMelding.ID}.xml`;

                    var e = document.createEvent('MouseEvents');
                    e.initMouseEvent('click', true, false, document.defaultView, 0, 0, 0, 0, 0, false, false, false, false, 0 , null);

                    a.dispatchEvent(e);
                    a.remove();

                }, err => {
                    this.onError(err);
                });
        }
    }

    public createAMelding(ameldType: number = 0) {
        this.saveComponent.manualSaveStart();
        this._ameldingService.postAMeldingforDebug(this.currentPeriod, ameldType)
        .subscribe(response => {
            this.saveStatus.completeCount++;
            this.updateAMeldingerInPeriod(response);
            this.setAMelding(response);
            this.checkForSaveDone();
        },
        (err) => {
            this.saveStatus.completeCount++;
            this.saveStatus.hasErrors = true;
        });
    }

    public aMeldingTypeChange(newType: number) {
        this.saveStatus.numberOfRequests++;
        this.createAMelding(newType);
    }

    public setAMelding(amelding: AmeldingData) {
        this.showView = '';
        this._ameldingService.getAMeldingWithFeedback(amelding.ID)
        .subscribe((ameldingAndFeedback) => {
            this.currentAMelding =  ameldingAndFeedback;
            this.getSumUpForAmelding();
            this.clarifiedDate = moment(this.currentAMelding.created).format('DD.MM.YYYY HH:mm');
            if (this.currentAMelding.sent) {
                this.submittedDate = moment(this.currentAMelding.sent).format('DD.MM.YYYY HH:mm');
            } else {
                this.submittedDate = '';
            }
            if (this.currentAMelding.feedbackFileID) {
                this.feedbackObtained = true;
            } else {
                this.feedbackObtained = false;
            }
            this.updateToolbar();
            this.updateSaveActions();
            this.setStatusForPeriod();
        });
    }

    private updateToolbar() {
        this.toolbarConfig = {
            title: `Periode ${this.currentPeriod}`,
            subheads: [{
                title: this.currentMonth
            },
            {
                title: this.currentAMelding ? 'A-melding ' + this.currentAMelding.ID : null
            }],
            statustrack: this.getStatusTrackConfig(),
            navigation: {
                prev: this.prevPeriod.bind(this),
                next: this.nextPeriod.bind(this)
            },
            contextmenu: this.contextMenuItems
        };
    }

    private getStatusTrackConfig() {
        let statustrack: UniStatusTrack.IStatus[] = [];
        let activeStatus = this.currentAMelding ? (this.currentAMelding.status ? this.currentAMelding.status : 1) : 0;

        this._ameldingService.internalAmeldingStatus.forEach((amldStatus, indx) => {
            let _state: UniStatusTrack.States;
            let _substatuses: UniStatusTrack.IStatus[] = [];

            if (amldStatus.Code > activeStatus) {
                _state = UniStatusTrack.States.Future;
            } else if (amldStatus.Code < activeStatus) {
                _state = UniStatusTrack.States.Completed;
            } else if (amldStatus.Code === activeStatus) {

                if (this.currentAMelding === this.aMeldingerInPeriod[this.aMeldingerInPeriod.length - 1]) {
                    _state = UniStatusTrack.States.Active;
                } else {
                    // If we're not on the last of the A-meldings in the period, we'll assume the data is obsolete.
                    _state = UniStatusTrack.States.Obsolete;
                }

                this.aMeldingerInPeriod.forEach(amelding => {
                    _substatuses.push({
                        title: 'A-melding ' + amelding.ID,
                        state: amelding.ID === this.currentAMelding.ID ? UniStatusTrack.States.Active : UniStatusTrack.States.Obsolete,
                        timestamp: amelding.UpdatedAt ? new Date(amelding.UpdatedAt) : new Date(amelding.CreatedAt),
                        data: amelding
                    });
                });
            }

            statustrack[indx] = {
                title: amldStatus.Text,
                state: _state,
                badge: (_state === UniStatusTrack.States.Active || _state === UniStatusTrack.States.Obsolete) && this.aMeldingerInPeriod.length > 1 ? this.aMeldingerInPeriod.length + '' : null,
                substatusList: _substatuses
            };
        });

        return statustrack;
    }

    private setAmeldingFromEvent(event) {
        if (!event[0] || !event[0].data) { return; }
        this.setAMelding(event[0].data);
    }

    private updateAMeldingerInPeriod(newAMelding) {
        let regenerated: boolean;

        this.aMeldingerInPeriod.forEach(amelding => {
            if (amelding.ID === newAMelding.ID) {
                amelding = newAMelding;
                regenerated = true;
            }
        });

        if (!regenerated) {
            this.aMeldingerInPeriod.push(newAMelding);
        }
    }

    private getSumUpForAmelding() {
        this._ameldingService.getAmeldingSumUp(this.currentAMelding.ID)
            .subscribe((response) => {
                this.currentSumUp = response;
                this.legalEntityNo = response.LegalEntityNo;

                if (this.currentSumUp.entities) {
                    this.currentSumUp.entities.forEach(virksomhet => {
                        virksomhet.collapsed = true;
                        this.totalAga += virksomhet.sums.aga;
                    });
                }
            });
    }

    private getAMeldingForPeriod() {
        this.spinner(this._ameldingService.getAMeldingForPeriod(this.currentPeriod))
            .subscribe((ameldinger: AmeldingData[]) => {
                this.aMeldingerInPeriod = ameldinger;
                if (this.aMeldingerInPeriod.length > 0) {
                    this.setAMelding(this.aMeldingerInPeriod[this.aMeldingerInPeriod.length - 1]);
                } else {
                    this.updateToolbar();
                    this.updateSaveActions();
                    this.setStatusForPeriod();
                }
            }, error => {
                this.onError(error);
            });
    }

    private setStatusForPeriod() {
        let ameldingerReplaced: any[] = [];
        let periodStatus: string = 'Venter på tilbakemelding';
        
        this.aMeldingerInPeriod.forEach(ameld => {
            if (ameld.replacesID > 0) {
                ameldingerReplaced.push(ameld.replacesID);
            }
        });

        this.aMeldingerInPeriod.forEach(amelding => {
            if ((amelding.altinnStatus && amelding.altinnStatus !== 'avvist') && (ameldingerReplaced.indexOf(amelding.ID) < 0)) {
                periodStatus = amelding.altinnStatus;
            }
        });
        
        this.periodStatus = periodStatus;
    }

    private checkForSaveDone() {
        if (this.saveStatus.completeCount === this.saveStatus.numberOfRequests) {
            if (this.saveStatus.hasErrors) {
                this.saveComponent.manualSaveComplete('Kunne ikke generere A-melding');
            } else {
                this.saveComponent.manualSaveComplete('A-melding generert');
            }
        }
    }

    private updateSaveActions() {
        this.actions = [];

        this.actions.push({
            label: 'Generer A-melding',
            action: (done) => {
                this.saveStatus = {
                    numberOfRequests: 0,
                    completeCount: 0,
                    hasErrors: false,
                };
                this.openAmeldingTypeModal(done);
            },
            disabled: false,
            main: this.currentAMelding === undefined
        });

        this.actions.push({
            label: 'Send inn',
            action: (done) => this.sendAmelding(done),
            disabled: this.currentAMelding ? (this.currentAMelding.status >= 1 ? true : false) : true,
            main: this.currentAMelding !== undefined && this.submittedDate === ''
        });

        this.actions.push({
            label: 'Hent tilbakemelding',
            action: (done) => {
                if (this.currentAMelding) {
                    this.getFeedback(done);
                }
            },
            disabled: this.currentAMelding ? (this.currentAMelding.status === 2 ? false : true) : true,
            main: this.submittedDate !== ''
        });
    }

    private getFeedback(done) {
        this.altinnAuthModal.getUserAltinnAuthorizationData()
            .then(authData => {
                this._ameldingService.getAmeldingFeedback(this.currentAMelding.ID, authData)
                    .subscribe((response: AmeldingData) => {
                        if (response) {
                            this.setAMelding(response);
                            done('tilbakemelding hentet');
                        }
                    });
            });

    }

    private sendAmelding(done) {
        this._ameldingService.sendAMelding(this.currentAMelding.ID)
        .subscribe((response: AmeldingData) => {
            if (response) {
                this.setAMelding(response);
                if (this.currentAMelding.sent) {
                    this.submittedDate = moment(this.currentAMelding.sent).format('DD.MM.YYYY HH:mm');
                }
                done('A-melding sendt inn');
            }
        });
    }

    private openAmeldingTypeModal(done) {
        this.aMeldingTypeModal.openModal();
    }

    private clearAMelding() {
        this.currentAMelding = undefined;
        this.currentSumUp = {};
        this.clarifiedDate = '';
        this.submittedDate = '';
        this.feedbackObtained = false;
    }

    private spinner<T>(source: Observable<T>): Observable<T> {
        this.busy = true;
        return <Observable<T>>source.finally(() => this.busy = false);
    }

    private onError(error, optionalDoneHandler?: (error) => void) {
        let errorMsg = 'Det har oppstått en feil';
        let errorBody = error.json();
        if (errorBody && errorBody.Message) {
            errorMsg += ': ' + errorBody.Message;
        }
        this._toastService.addToast('Error', ToastType.bad, 0, errorMsg);

        if (optionalDoneHandler) {
            optionalDoneHandler('Det har oppstått en feil, forsøk igjen senere');
        }
    }
}
