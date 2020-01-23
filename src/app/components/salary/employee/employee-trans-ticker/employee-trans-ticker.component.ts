import {Component, OnInit} from '@angular/core';
import {Ticker, UniTickerService} from '@app/services/services';
import {ActivatedRoute} from '@angular/router';
import {Observable, BehaviorSubject} from 'rxjs';
import * as _ from 'lodash';

@Component({
    selector: 'uni-employee-trans-ticker',
    templateUrl: './employee-trans-ticker.component.html',
    styleUrls: ['./employee-trans-ticker.component.sass']
})
export class EmployeeTransTickerComponent implements OnInit {
    public ticker$: BehaviorSubject<Ticker> = new BehaviorSubject(null);
    constructor(
        private uniTickerService: UniTickerService,
        private route: ActivatedRoute,
    ) {}

    public ngOnInit() {
        this.route
            .parent
            .params
            .switchMap(params => Observable.forkJoin(
                this.uniTickerService.getTicker('salarytransaction_list').map(ticker => <Ticker>_.cloneDeep(ticker)),
                Observable.of(params['id'])))
            .map(result => {
                const [ticker, empID] = result;
                ticker.Code = ticker.Code + empID; // forcing update if we go to next/prev emp
                ticker.Columns = ticker.Columns.filter(col => col.Field !== 'EmployeeNumber');
                ticker.Filters = [{
                    Code: 'all_emp_transes',
                    Name: 'Alle',
                    Filter: ``,
                    IsActive: true,
                    FilterGroups: [{
                        UseAllCriterias: true,
                        FieldFilters: [{
                            Field: 'EmployeeID',
                            Operator: 'eq',
                            Value: empID,
                            Path: '',
                            Value2: null,
                            QueryGroup: null,
                        },
                        {
                            Field: 'PayrollRunID',
                            Operator: 'gt',
                            Value: '0',
                            Path: '',
                            Value2: null,
                            QueryGroup: null,
                        }],
                        QueryGroup: 0,
                    }],
                    UseAllCriterias: false,
                    IsMultiRowSelect: false,
                }];
                return ticker;
            })
            .subscribe(ticker => this.ticker$.next(ticker));
    }

}
