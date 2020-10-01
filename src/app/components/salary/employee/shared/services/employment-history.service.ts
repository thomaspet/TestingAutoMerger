import { Injectable } from '@angular/core';
import { EmploymentService } from '@app/services/services';
import { EmploymentHistoryRecord } from '@uni-entities';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class EmploymentHistoryService {

    private historySubject$: BehaviorSubject<EmploymentHistoryRecord[]> = new BehaviorSubject([]);
    public history$ = this.historySubject$.asObservable();

    constructor(private employmentService: EmploymentService) { }

    public fetchHistory(employmentID) {
        this.employmentService
            .getHistory(employmentID)
            .subscribe(history => this.historySubject$.next(history));
    }

    public clearHistory() {
        this.historySubject$.next([]);
    }
}
