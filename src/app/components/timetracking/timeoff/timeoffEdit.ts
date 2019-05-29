import {Component, Input, Output, OnChanges, EventEmitter} from '@angular/core';
import {WorkerService} from '@app/services/services';
import {Subject} from 'rxjs';
import * as moment from 'moment';

@Component({
    selector: 'uni-timeoff-edit',
    templateUrl: './timeoffEdit.html'
})

export class UniTimeOffEdit implements OnChanges {

    @Input()
    public currentDay: any = {};

    @Output()
    public dataChanged: EventEmitter<any> = new EventEmitter();

    loading$: Subject<boolean> = new Subject();
    timeOff: any = {};
    showEndDate: boolean = false;
    errorMsg: string = '';

    constructor (private workerService: WorkerService) { }

    ngOnChanges(change) {
        if (change['currentDay'] && change['currentDay'].currentValue) {
            this.timeOff = change['currentDay'].currentValue.TimeOff || this.getEmptyTimeOff();
        }
    }

    saveTimeOff() {
        this.errorMsg = '';
        if (!this.timeOff.Description) {
            this.errorMsg = 'Feltet "Beskrivelse" kan ikke være tomt';
            return;
        }
        this.loading$.next(true);
        this.workerService.saveTimeOff(this.timeOff).subscribe(() => {
            this.loading$.next(false);
            this.dataChanged.emit(true);
        }, err => {
            this.errorMsg = 'Noe gikk galt når vi prøvde å lagre fridag. Prøv igjen.';
            this.loading$.next(false);
        });
    }

    deleteTimeOff() {
        this.loading$.next(true);
        this.workerService.deleteTimeOff(this.timeOff.ID).subscribe(() => {
            this.loading$.next(false);
            this.dataChanged.emit(true);
        }, err => {
            this.errorMsg = 'Noe gikk galt når vi prøvde å fjerne fridag. Prøv igjen.';
            this.loading$.next(false);
        });
    }

    getButtonText() {
        const text = `Fjern ${this.currentDay.dateText} som fridag`;
        if (!this.currentDay.TimeOff) {
            return text;
        } else {
            if (moment(this.currentDay.TimeOff.ToDate).isSame(moment(this.currentDay.TimeOff.FromDate), 'day')) {
                return text;
            } else {
                return 'Fjern ' + moment(this.currentDay.TimeOff.FromDate).format('DD.MMM')
                + ' - ' + moment(this.currentDay.TimeOff.ToDate).format('DD.MMM') + ' som fridager';
            }
        }
    }

    getEmptyTimeOff() {
        return {
            FromDate: this.currentDay.Date,
            ToDate: this.currentDay.Date,
            Description: '',
            ID: 0,
            TimeoffType: 1,
            _guid: 'fewgh34y_weheherh34yreh_959rgregerg'
        };
    }
}
