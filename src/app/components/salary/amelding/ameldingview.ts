import {Component, OnInit, ViewChild} from '@angular/core';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {Observable} from 'rxjs/Rx';
import {AMeldingService} from '../../../services/Salary/AMelding/AMeldingService';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {AmeldingData, AmeldingSumUp} from '../../../unientities';
import {IContextMenuItem} from 'unitable-ng2/main';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {AmeldingControlView} from './ameldingControl/control';
import {AmeldingSummaryView} from './ameldingSummary/summary';
import {AmeldingAgaView} from './ameldingAga/aga';
import {AmeldingReceiptView} from './ameldingReceipt/receipt';
import {AmeldingPeriodSummaryView} from './ameldingPeriod/period';
import {AmeldingAvstemView} from './ameldingAvstem/avstem';
import {SelectAmeldingTypeModal} from './modals/selectAmeldingTypeModal';

declare var moment;

@Component({
    selector: 'amelding-view',
    templateUrl: 'app/components/salary/amelding/ameldingview.html',
    providers: [AMeldingService],
    directives: [UniSave, AmeldingControlView, AmeldingSummaryView, AmeldingAgaView,
        AmeldingReceiptView, AmeldingPeriodSummaryView, AmeldingAvstemView, SelectAmeldingTypeModal]
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
    private clarifiedDate: string;
    private submittedDate: string;
    private feedbackObtained: string;
    private totalAga: number = 0;
    private legalEntityNo: string;
    @ViewChild(SelectAmeldingTypeModal) private aMeldingTypeModal: SelectAmeldingTypeModal;
    public showView: string = '';
    

    constructor(
        private _tabService: TabService, 
        private _ameldingService: AMeldingService,
        private _toastService: ToastService
    ) {
        this._tabService.addTab({name: 'A-Melding', url: 'salary/amelding', moduleID: 21, active: true});
        
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

        this.currentPeriod = 1;
        this.currentMonth = moment.months()[this.currentPeriod - 1];
    }
    
    public ngOnInit() {
        this.getAMeldingForPeriod();
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
                    a['download'] = 'amelding.xml';

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
        this._ameldingService.postAMeldingforDebug(this.currentPeriod, ameldType)
        .subscribe(response => {
            this.updateAMeldingerInPeriod(response);
            this.setAMelding(response);
            // done('A-melding generert');
        });
    }

    public aMeldingTypeChange(newType: number) {
        this.createAMelding(newType);
    }

    public setAMelding(amelding: AmeldingData) {
        this.showView = '';
        this.currentAMelding =  amelding;
        this.getSumUpForAmelding();
        this.clarifiedDate = moment(this.currentAMelding.created).format('DD.MM.YYYY HH:mm');
        this.updateSaveActions();
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
        this.spinner(
            this._ameldingService.getAMeldingForPeriod(this.currentPeriod)
        )
            .subscribe((ameldinger: AmeldingData[]) => {
                this.aMeldingerInPeriod = ameldinger;
                if (this.aMeldingerInPeriod.length > 0) {
                    this.setAMelding(this.aMeldingerInPeriod[this.aMeldingerInPeriod.length - 1]);
                } else {
                    this.updateSaveActions();
                }
            }, error => {
                this.onError(error);
            });
    }
    
    private updateSaveActions() {
        this.actions = [];
        this.actions.push({
            label: 'Send inn',
            action: (done) => this.sendAmelding(done),
            disabled: false,
            main: this.currentAMelding !== undefined
        });

        this.actions.push({
            label: 'Generer A-melding',
            action: (done) => {
                if (this.aMeldingerInPeriod && this.aMeldingerInPeriod.length > 0) {
                    this.createAMelding();
                } else {
                    this.openAmeldingTypeModal(done);
                }
            },
            disabled: false,
            main: this.currentAMelding === undefined
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
            }
        });
        done('A-melding sendt inn');
    }

    private openAmeldingTypeModal(done) {
        this.aMeldingTypeModal.openModal();
        done('ferdig');
    }

    private clearAMelding() {
        this.currentAMelding = undefined;
        this.currentSumUp = {};
        this.clarifiedDate = '';
        this.submittedDate = '';
        this.feedbackObtained = '';
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
