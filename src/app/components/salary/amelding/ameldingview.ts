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
    private aMeldingerInPeriod: AmeldingData[];
    private contextMenuItems: IContextMenuItem[] = [];
    private actions: IUniSaveAction[];
    private clarifiedDate: string;
    private submittedDate: string;
    private feedbackObtained: Date;
    private totalAga: number;
    private totalForskuddstrekk: number;
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
            this.currentAMelding = undefined;
            this.getAMeldingForPeriod();
        }
    }

    public nextPeriod() {
        if (this.currentPeriod !== 12) {
            if (this.currentPeriod < 12) {
                this.currentPeriod += 1;
                this.currentMonth = moment.months()[this.currentPeriod - 1];
            }
            this.currentAMelding = undefined;
            this.getAMeldingForPeriod();
        }
    }

    public getAMeldingFile() {
        this._ameldingService.getAMeldingFile(this.currentAMelding.ID)
            .subscribe(amldfile => {
            }, err => {
                this.onError(err);
            });
    }

    public createAMelding(done, ameldType: number = 0) {
        this._ameldingService.postAMeldingforDebug(this.currentPeriod, ameldType)
        .subscribe(response => {
            this.aMeldingerInPeriod.push(response);
            this.setAMelding(response);
            done('A-melding generert');
        });
    }

    public aMeldingTypeChange(newType: number) {
        this.submittedDate = moment(new Date(Date.now())).format('DD.MM.YYYY HH:mm');
        // this.createAMelding(, newType);
    }

    public updateTotals(valueObj) {
        this.totalAga = valueObj.totalAga;
        this.totalForskuddstrekk = valueObj.totalForskuddstrekk;
        this.legalEntityNo = valueObj.legalEntityNo;
    }

    public setAMelding(amelding: AmeldingData) {
        this.showView = '';
        this.currentAMelding =  amelding;
        this.clarifiedDate = moment(this.currentAMelding.created).format('DD.MM.YYYY HH:mm');
        this.updateSaveActions();
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
            action: (done) => this.openAmeldingTypeModal(done),
            disabled: false,
            main: this.currentAMelding !== undefined
        });

        this.actions.push({
            label: 'Generer A-melding',
            action: (done) => this.createAMelding(done),
            disabled: false,
            main: this.currentAMelding === undefined
        });
    }

    private openAmeldingTypeModal(done) {
        this.aMeldingTypeModal.openModal();
        done('ferdig');
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
