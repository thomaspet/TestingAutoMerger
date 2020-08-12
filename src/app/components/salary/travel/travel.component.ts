import {Component, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Travel, state, costtype, WageType, Account} from '@uni-entities';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {TravelService, ErrorService, WageTypeService} from '@app/services/services';
import {Observable} from 'rxjs';
import {UniMath} from '@uni-framework/core/uniMath';
import {ITravelFilter} from '@app/components/salary/travel/travel-filter/travel-filter.component';
import {IUniSaveAction} from '@uni-framework/save/save';
import {ActivatedRoute, Router} from '@angular/router';
import {UniModalService, ConfirmActions} from '@uni-framework/uni-modal';
import {IContextMenuItem} from '@uni-framework/ui/unitable';
import { DimensionsColumnsService } from '@app/components/salary/travel/shared/service/dimensionsColumns/dimensions-columns.service';
const DIRTY = '_isDirty';
const SELECTED_KEY = '_rowSelected';

interface ITravelFile {
    TravelID: number;
    FileIDs: number[];
}

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
    public contextMenuItems: IContextMenuItem[] = [];
    public fileIDs$: BehaviorSubject<number[]> = new BehaviorSubject([]);

    private wageTypes: WageType[] = [];
    private fetchingFiles$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private travelFiles$: BehaviorSubject<ITravelFile[]> = new BehaviorSubject([]);
    public runID: number;

    constructor(
        private tabService: TabService,
        private travelService: TravelService,
        private errorService: ErrorService,
        private wageTypeService: WageTypeService,
        private route: ActivatedRoute,
        private modalService: UniModalService,
        private router: Router,
        private dimensionsColumnService: DimensionsColumnsService,
    ) {}

    public ngOnInit() {
        this.tabService.addTab({
            name: 'Reiser/utlegg',
            url: 'salary/travels',
            moduleID: UniModules.Travel
        });
        this.contextMenuItems = this.getContextMenuItems();

        this.getTravels();

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

        this.route.queryParams.subscribe(params => {
            if (params['runID']) {
                this.runID = +params['runID'];
            }
        });
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
            },
            {
                label: 'Overfør til leverandørfaktura',
                action: done => this.transferToSupplierInvoice(done),
                main: false,
                disabled: true,
            },
        ];
    }

    private getContextMenuItems(): IContextMenuItem[] {
        return [
            {
                label: 'Reisetyper og kontoinnstillinger',
                action: () => this.navigateToTravelTypes(),
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

        if (this.travelSelection.filter(t => t.TravelLines.some(l => l.CostType === costtype.Expense)).length) {
            const action = saveActions.find(act => act.label === 'Overfør til leverandørfaktura');
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
        this.getTravelsObs()
            .subscribe((travels: any[]) => this.travels$.next(travels));
    }

    private getTravelsObs(): Observable<Travel[]> {
        return this.travelService
            .GetAll('', ['TravelLines.TravelType', 'TravelLines.VatType.VatTypePercentages', 'TravelLines.Dimensions.Info'])
            .map(travels => {
                return travels.map(travel => {
                    travel.TravelLines = travel.TravelLines.map(line => {
                        line['_Account'] = new Account();
                        return line;
                    });
                    return travel;
                });
            })
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .switchMap(travels => this.wageTypeService
                .GetAll('orderby=WageTypeNumber').do(wt => this.wageTypes = wt).map(wt => this.fillInInfo(travels, wt))
            );
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
                this.dimensionsColumnService.initializeDimensionFields(line);
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
            .switchMap(travels => this.getTravelsObs())
            .map(travels => {
                return this.mapSelected(travels);
            })
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

    private mapSelected(fetched: Travel[]): Travel[] {
        const local = this.travels$.getValue();
        fetched.forEach(travel => {
            travel[SELECTED_KEY] = local.find(tr => tr.ID === travel.ID)[SELECTED_KEY];
        });
        return fetched;
    }

    private transferToSalary(done: (msg) => void) {
        this.fetchingFiles$
            .filter(fetching => !fetching)
            .take(1)
            .switchMap(() => this.travelService.createTransactions(this.travelSelection, this.travelOptions$.getValue().run.ID))
            .catch((err, obs) => {
                done('Overføring til lønn feilet');
                return this.errorService.handleRxCatch(err, obs);
            })
            .do(() => this.getTravels())
            .subscribe(() => done('Overføring til lønn fullført'));
    }

    private transferToSupplierInvoice(done: (msg) => void) {
        const travels = this.travelSelection.filter(x => x.TravelLines.some(line => line.CostType === costtype.Expense));

        travels.forEach(travel => {
            travel.TravelLines = travel.TravelLines.filter(line => !(line['_isEmpty']));
        });

        this.fetchingFiles$
            .filter(fetching => !fetching)
            .take(1)
            .switchMap(() => this.promptUserIfNeeded(travels, done))
            .filter(proceed => proceed)
            .switchMap(() => this.travelService.createSupplierInvoices(travels))
            .catch((err, obs) => {
                done('Overføring til leverandørfaktura feilet');
                return this.errorService.handleRxCatch(err, obs);
            })
            .do(() => this.getTravels())
            .subscribe(() => done('Overføring til leverandørfaktura fullført'));
    }

    private promptUserIfNeeded(travels: Travel[], done: (msg) => void): Observable<boolean> {
        if (!travels || !travels.length) {
            return Observable.of(true);
        }

        const wts = this.wageTypes.filter(x => x.Benefit || x.IncomeType || x.Description);
        if (travels.some(t => t.TravelLines.some(l => wts.some(wt => wt.WageTypeNumber === l.travelType.WageTypeNumber)))) {
            return this.modalService.confirm({
                header: 'Bekreft overføring',
                message: 'Denne rapporten inneholder godtgjørelse som skal innrapporteres.' +
                ' Vi anbefaler derfor å importere denne via lønn. Ønsker du å overføre reisen/utlegget via leverandørfaktura?',
                buttonLabels: {
                    accept: 'OK',
                    cancel: 'Avbryt'
                }
            })
            .onClose
            .do(result => {
                if (result !== ConfirmActions.ACCEPT) {
                    done('Overføring til leverandørfaktura avbrutt');
                }
            })
            .map(result => result === ConfirmActions.ACCEPT);
        }

        return Observable.of(true);
    }

    private checkFiles(travels: Travel[]): Travel[] {

        travels = travels.filter(travel => !!travel);
        const obs: Observable<ITravelFile>[] = [];
        const travelFiles = this.travelFiles$.getValue();
        const travelsWithoutFiles = travels.filter(t => t && !travelFiles.some(tf => tf.TravelID === t.ID));

        travelsWithoutFiles
            .forEach(travel => {
                obs.push(
                    this.travelService
                        .getFiles(travel)
                        .map(files => files.map(file => file.ID))
                        .map((fileIDs) => {
                            return {
                                TravelID: travel.ID,
                                FileIDs: fileIDs
                            };
                        }));
            });

        if (!obs.length) {
            return travels;
        }

        this.fetchingFiles$.next(true);
        Observable
            .forkJoin(obs)
            .finally(() => this.fetchingFiles$.next(false))
            .do(fetchedTravelFiles => {
                const selected = this.selectedTravel$.getValue();
                if (!selected || !fetchedTravelFiles.some(tf => tf.TravelID === selected.ID)) {
                    return;
                }
                this.fileIDs$.next(fetchedTravelFiles.find(tf => tf.TravelID === selected.ID).FileIDs);
            })
            .subscribe(tf => this.travelFiles$.next([...travelFiles, ...tf]));
    }

    private navigateToTravelTypes() {
        this.router.navigate(['salary/traveltypes']);
    }

    public selectedTravel(travel: Travel) {
        this.selectedTravel$.next(travel);
        const travelFiles = this.travelFiles$.getValue();
        const selectedTravelFiles = travelFiles.find(tf => travel && tf.TravelID === travel.ID);
        this.fileIDs$.next((selectedTravelFiles && selectedTravelFiles.FileIDs) || []);
        this.checkFiles([travel]);
    }

    private updateListObs(travels: Travel[]): Observable<Travel[]> {
        return this.travels$
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
                .do(trvls => this.travels$.next(trvls));
    }

    public updatedList(travels: Travel[]) {
        this.updateListObs(travels)
            .subscribe(trvls => this.travels$.next(trvls));
    }

    public updateListAndSave(travels: Travel[]) {
        this.updateListObs(travels)
            .subscribe(trvls => {
                this.saveTravels(t => {});
            });
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
        this.checkFiles(selection);
    }

}
