import {Component, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Travel, state, linestate, costtype, WageType} from '@uni-entities';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {TravelService, ErrorService, WageTypeService} from '@app/services/services';
import {Observable} from 'rxjs/Observable';
import {UniMath} from '@uni-framework/core/uniMath';
import {ITravelFilter} from '@app/components/salary/travel/travel-filter/travel-filter.component';
import {IUniSaveAction} from '@uni-framework/save/save';
const DIRTY = '_isDirty';
const SELECTED_KEY = '_rowSelected';

@Component({
    selector: 'uni-travel',
    templateUrl: './travel.component.html',
    styleUrls: ['./travel.component.sass']
})
export class TravelComponent implements OnInit {

    public travels$: BehaviorSubject<Travel[]> = new BehaviorSubject([]);
    public filteredTravels$: BehaviorSubject<Travel[]> = new BehaviorSubject([]);
    public travelOptions$: BehaviorSubject<ITravelFilter> = new BehaviorSubject({
        filter: (travel: Travel) => travel.State === state.Received,
        run: null
    });
    public selectedTravel$: BehaviorSubject<Travel> = new BehaviorSubject(null);
    public travelSelection: Travel[] = [];
    public busy: boolean;
    public saveActions$: BehaviorSubject<IUniSaveAction[]> = new BehaviorSubject(this.getSaveActions());

    private wageTypes: WageType[] = [];

    constructor(
        private tabService: TabService,
        private travelService: TravelService,
        private errorService: ErrorService,
        private wageTypeService: WageTypeService,
    ) {}

    public ngOnInit() {
        this.tabService.addTab({
            name: 'Reiser/utlegg',
            url: 'salary/travels',
            moduleID: UniModules.Travel
        });
        this.getTravels();
        // const mock = this.fillInInfo(this.mockTravels());
        // this.travels$.next(mock);
        this.travels$
            .do((travels) => this.checkSave(travels))
            .subscribe(travels => this.updateFilteredTravels(travels, this.travelOptions$.getValue()));

        this.travelOptions$
            .switchMap(options => {
                return this.travels$
                    .take(1)
                    .map(travels => this.updateFilteredTravels(travels, options));
            })
            .subscribe();
    }

    private getSaveActions(): IUniSaveAction[] {
        return [
            {
                label: 'Lagre endringer',
                action: done => this.saveTravels(done),
                main: false,
                disabled: true
            },
            {
                label: 'Overfør til lønn',
                action: done => this.transferToSalary(done),
                main: false,
                disabled: true,
            }
        ];
    }

    private checkSave(travels: Travel[]) {
        const saveActions = this.getSaveActions();
        if (travels.some(travel => travel[DIRTY])) {
            const action = saveActions.find(act => act.label === 'Lagre endringer');
            if (action) {
                action.disabled = false;
            }
        }

        if (this.travelSelection.length) {
            const action = saveActions.find(act => act.label === 'Overfør til lønn');
            if (action) {
                action.disabled = false;
            }
        }

        const activeAction = saveActions.find(act => !act.disabled);

        if (activeAction) {
            activeAction.main = true;
        } else {
            saveActions.find(act => act.label !== 'Lagre endringer').main = true;
        }

        this.saveActions$.next(saveActions);
    }

    private updateFilteredTravels(travels: Travel[], travelOptions: any) {
        if (!travelOptions || !travels || !travels.length) {
            return;
        }
        this.filteredTravels$
            .next(this.markFirstTravel(travels.filter(travelOptions.filter)));
    }

    private getTravels() {
        this.travelService
            .GetAll('', ['TravelLines.TravelType'])
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .switchMap(travels => this.wageTypeService.GetAll('').do(wt => this.wageTypes = wt).map(wt => this.fillInInfo(travels, wt)))
            .subscribe((travels: any[]) => this.travels$.next(travels));
    }

    private markFirstTravel(travels: Travel[]) {
        if (!travels || !travels.length || travels.some(travel => travel[SELECTED_KEY])) {
            return travels;
        }
        travels.forEach((travel, index) => {
            if (index > 0) {
                return;
            }
            travel[SELECTED_KEY] = true;
        });
        return travels;
    }

    private fillInInfo(travels: Travel[], wageTypes: WageType[]): Travel[] {
        return travels.map(travel => this.fillIn(travel, wageTypes));
    }

    private fillIn(travel: Travel, WageTypes: WageType[]): Travel {
        travel['_statusText'] = this.travelService.statusText(travel.State);
        if (travel && travel.TravelLines && travel.TravelLines.length) {
            travel['_sum'] = travel.TravelLines
                .reduce((acc, line) => UniMath.useFirstTwoDecimals(line.Rate * line.Amount) + acc, 0);
            travel['_costType'] = travel.TravelLines[0].CostType;
            travel['_fromDate'] = travel.TravelLines
                .reduce((fromDate, line) => new Date(line.From) < fromDate
                    ? line.From
                    : fromDate, new Date());
            travel['_toDate'] = travel.TravelLines
                .reduce((toDate, line) => new Date(line.To) > toDate
                    ? line.To
                    : toDate, new Date(0));
            travel.TravelLines.forEach(line => {
                if (!line.travelType) {
                    return;
                }
                line['_wageType'] = WageTypes.find(wt => wt.WageTypeNumber === line.travelType.WageTypeNumber);
            });
        }
        return travel;
    }

    private saveTravels(done: (msg: string) => void) {
        this.busy = true;
        this.travels$
            .take(1)
            .switchMap(travels => {
                const obsList: Observable<Travel>[] = [];
                travels.forEach((travel, index) => {
                    if (!travel[DIRTY]) {
                        return;
                    }
                    const obs = this.travelService
                        .save(travel)
                        .do(res => {
                            if (!res.ID || res.Deleted) {
                                return;
                            }
                            res[SELECTED_KEY] = travels[index][SELECTED_KEY];
                            travels[index] = res;
                        });
                    obsList.push(obs);
                });
                return Observable.forkJoin(obsList).map(() => travels);
            })
            .do(travels => this.checkSave(travels))
            .map(travels => this.fillInInfo(travels, this.wageTypes))
            .catch((err, obs) => {
                done('Feil ved lagring');
                return this.errorService.handleRxCatch(err, obs);
            })
            .finally(() => {
                this.busy = false;
                done('Lagring fullført');
            })
            .subscribe(travels => this.travels$.next(travels));
    }

    private transferToSalary(done: (msg) => void) {
        setTimeout(() => {
            done('overføring fullført');
        }, 1000);
    }

    public selectedTravel(travel: Travel) {
        this.selectedTravel$.next(travel);
    }

    public updatedList(travels: Travel[]) {
        this.travels$
            .take(1)
            .map(trvls => {
                travels.forEach(travel => {
                    const index = trvls.findIndex(trvl => trvl.ID === travel.ID);
                    if (index < 0) {
                        return;
                    }
                    trvls[index] = travel;
                });
                return trvls;
            })
            .subscribe(trvls => this.travels$.next(trvls));
    }

    public travelChange(travel: Travel) {
        this.travels$
            .take(1)
            .map(travels => {
                const index = travels.findIndex(x => x.ID === travel.ID);
                if (index < 0) {
                    return travels;
                }
                travels[index] = travel;
                return travels;
            })
            .subscribe(travels => this.travels$.next([...travels]));
    }

    public filterChange(filter: ITravelFilter) {
        this.travelOptions$.next(filter);
    }

    public selectionChange(selection: Travel[]) {
        this.travelSelection = selection;
        this.checkSave(this.travels$.getValue());
    }

}
