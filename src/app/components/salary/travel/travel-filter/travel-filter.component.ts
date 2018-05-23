import {Component, OnInit, EventEmitter, Output, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Travel, PayrollRun, state, costtype} from '@uni-entities';
import {PayrollrunService} from '@app/services/services';
import {IUniTab} from '@app/components/layout/uniTabs/uniTabs';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ISelectConfig} from '@uni-framework/ui/uniform';

export interface ITravelFilter {
    filter: (travel: Travel) => boolean;
    run: PayrollRun;
}

interface ITravelFilterInfo {
    filter: (travel: Travel) => boolean;
    amount: number;
    code: number;
    name: string;
}

@Component({
    selector: 'uni-travel-filter',
    templateUrl: './travel-filter.component.html',
    styleUrls: ['./travel-filter.component.sass']
})
export class TravelFilterComponent implements OnInit, OnChanges {

    @Output() public selectedFilterChange: EventEmitter<ITravelFilter> = new EventEmitter();
    @Input() public travels: Travel[];
    public selectConfig$: BehaviorSubject<ISelectConfig> = new BehaviorSubject(this.getSelectConfig());
    public selectedFilter: ITravelFilterInfo;
    public filters: ITravelFilterInfo[] = [];
    public tabs: IUniTab[];
    public runs: PayrollRun[];
    public selectedRun: PayrollRun;

    constructor(private payrollRunService: PayrollrunService) {}

    public ngOnInit() {
    }

    public ngOnChanges(changes: SimpleChanges) {

        const travelChange = changes['travels'];
        if (travelChange && (!travelChange.previousValue || travelChange.previousValue.length !== travelChange.currentValue.length)) {
            this.createFilters(this.travels);

            this.payrollRunService
                .getAll(`filter=StatusCode eq null or StatusCode eq 1`)
                .do(runs => this.selectedRun = runs[0])
                .do(() => this.selectedFilterChange.next({
                    filter: this.selectedFilter.filter,
                    run: this.selectedRun
                }))
                .subscribe(runs => this.runs = runs);
        }

    }

    private getSelectConfig(): ISelectConfig {
        return {
            template: (run: PayrollRun) => `Lønnsavregning ${run.ID} ${(run.Description ? '(' + run.Description + ')' : '')}`,
            searchable: true,
            hideDeleteButton: true
        };
    }

    private createFilters(travels: Travel[]) {
        this.filters = [
            this.createFilter(1, travels),
            this.createFilter(2, travels),
        ];
        this.tabs = this.filters.map(filter => {
            return {
                name: filter.name,
                onClick: () => this.onFilterSelected(filter),
                count: filter.amount
            };
        });
        this.selectedFilter = this.filters[0];
    }

    private createFilter(code: number, travels: Travel[]): ITravelFilterInfo {
        const filterFunc = this.getFilterFunc(code);
        return {
            code: code,
            filter: this.getFilterFunc(code),
            amount: travels.filter(travel => filterFunc(travel)).length,
            name: this.getFilterName(code)
        };
    }

    private getFilterFunc(code: number): (travel: Travel) => boolean {
        switch (code) {
            case 1:
                return (travel) => travel.State === state.Received || travel.State === state.PartlyProcessed;
            case 2:
                return (travel) => travel.State === state.Processed;
            default:
                return travel => true;
        }
    }

    private getFilterName(code: number) {
        switch (code) {
            case 1:
                return 'Ubehandlet';
            case 2:
                return 'Importerte';
        }
    }

    public onFilterSelected(filter: ITravelFilterInfo) {
        this.selectedFilter = filter;
        this.selectedFilterChange.next({
            filter: filter.filter,
            run: this.selectedRun
        });
    }

    public onRunSelected(run: PayrollRun) {

        this.selectedRun = run;
        this.selectedFilterChange.next({
            filter: this.selectedFilter.filter,
            run: run
        });
    }

}
