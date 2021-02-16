import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IncomeReportData, StatusCodeIncomeReport } from '@uni-entities';

export interface IIncomeReportState {
    currentIncomeReport: IncomeReportData | null;
    incomeReportIsDirty: boolean;
}

@Injectable()
export class IncomeReportStore {

    private _state = new BehaviorSubject<IIncomeReportState>({
        currentIncomeReport: null,
        incomeReportIsDirty: false
    });
    readonly state$ = this._state.asObservable();

    constructor() {
    }
    emit() {
        this._state.next({ ...this.state });
    }
    get state(): IIncomeReportState {
        return this._state.getValue();
    }
    set state(val: IIncomeReportState) {
        this._state.next(val);
    }

    set currentIncomeReport(val: IncomeReportData) {
        const state = this.state;
        this.state = { ...state, currentIncomeReport: val };
    }
    get currentIncomeReport(): IncomeReportData {
        return this._state.getValue().currentIncomeReport;
    }

    set incomeReportIsDirty(val: boolean) {
        const state = this.state;
        this.state = { ...state, incomeReportIsDirty: val };
    }
    get incomeReportIsDirty(): boolean {
        return this._state.getValue().incomeReportIsDirty;
    }

    get incomeReportIsReadOnly(): boolean {
        const currentStatusCode = this.state.currentIncomeReport?.StatusCode ?? StatusCodeIncomeReport.Created;
        return currentStatusCode === StatusCodeIncomeReport.Deleted || currentStatusCode === StatusCodeIncomeReport.Sent;
    }

    public updateStore(incomeReport: IncomeReportData) {
        if (this.incomeReportIsReadOnly) {
            return;
        }
        this.state = {
            ...this.state,
            incomeReportIsDirty: true,
            currentIncomeReport: incomeReport,
        }
    }
}
