import {Component, Input, Output, EventEmitter} from '@angular/core';
import {WorkerService} from '../../../services/timetracking/workerService';
import {WorkRelation} from '../../../unientities';
import {Router} from '@angular/router';
import {createFormField, ControlTypes} from '../../common/utils/utils';
import {ChangeMap} from '../../common/utils/changeMap';
import {Observable} from 'rxjs/Observable';
import {IResult} from '../genericview/detail';
import {ErrorService} from '../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'workrelations',
    templateUrl: './relations.html',
})
export class View {
    @Input()
    public set workerid(id: number) {
        this.currentId = id;
        this.loadList();
    }

    @Output() public valueChange: EventEmitter<any> = new EventEmitter();

    public collapseView: boolean = false;
    public items: Array<WorkRelation> = [];
    public busy: boolean = false;
    private initialized: boolean = false;

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    public layout: any;
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public model$: BehaviorSubject<any> = new BehaviorSubject([]);

    public currentId: number = 0;
    public currentRelation: WorkRelation = new WorkRelation();

    private changeMap: ChangeMap = new ChangeMap();

    constructor(private workerService: WorkerService, private router: Router, private errorService: ErrorService) {
        this.layout = this.createLayout();
        this.fields$.next(this.layout.formFields);
    }

    public ngOnInit() {
        this.initialized = true;
    }

    public onReady(event: any) {
        this.loadList();
    }

    public onChange(event: any) {
        this.valueChange.emit(this.currentRelation);
        var ix = this.items.indexOf(this.currentRelation);
        this.changeMap.add(ix, this.currentRelation);
    }

    public onItemClicked(item: WorkRelation) {
        this.flagSelected(item);
        this.currentRelation = item;
        this.model$.next(this.currentRelation);
    }

    private flagSelected(item: any) {
        item._isSelected = true;
        (<any>this.currentRelation)._isSelected = false;
        this.model$.next(this.currentRelation);
    }

    public onAddNew() {
        var item: WorkRelation = this.layout.data.factory();
        item.WorkPercentage = 100;
        item.CompanyName = this.workerService.user.company;
        item.IsActive = true;
        this.items.push(item);
        this.onItemClicked(item);
        this.changeMap.add(this.items.indexOf(item), this.currentRelation);
        this.valueChange.emit(this.currentRelation);
    }

    public onRegisterHours() {
        this.router.navigateByUrl('/timetracking?workerId=' + this.currentId + '&workRelationId='
            + this.currentRelation.ID);
    }

    public onDelete() {
        var rel = this.currentRelation;
        if (rel && rel.ID) {
            this.changeMap.addRemove(rel.ID, rel);
            this.valueChange.emit(rel);
        }
        if (rel) {
            var ix = this.items.indexOf(rel);
            this.items.splice(ix, 1);
            if (this.items.length > ix + 1) {
                this.onItemClicked(this.items[ix]);
            } else {
                if (this.items.length === 0) {
                    this.currentRelation = this.layout.data.factory();
                    this.model$.next(this.currentRelation);
                } else {
                    this.onItemClicked(this.items[this.items.length - 1]);
                }
            }
        }
    }

    public saveChanges(parentID: number): Promise<IResult> {
        return new Promise((resolve, reject) => {
            var result = this.save(parentID);
            if (result === null) {
                resolve({success: true});
            }
            result.subscribe(results => {
                resolve({success: true});
            }, err => {
                // debugger;
                reject({success: false, msg: err._body});
            });
        });
    }

    private save(parentID: number): Observable<any> {

        var items = this.changeMap.getValues();
        if (items.length > 0) {
            items.forEach(item => item.WorkerID = parentID);
        }

        var removables = this.changeMap.getRemovables();
        if (items.length === 0 && removables.length === 0) {
            return null;
        }

        var obs = this.saveAndDelete('workrelations', items, removables);
        return Observable.forkJoin(obs);
    }

    private saveAndDelete(route: string, items: Array<any>, deletables?: any[]): Observable<any> {

        var obsSave = Observable.from(items).switchMap((item: any) => {
            item.ID = item.ID < 0 ? 0 : item.ID;
            return this.workerService.saveByID<any>(item, route).map((savedItem: WorkRelation) => {
                this.changeMap.remove(item._rowIndex, true);
                item.ID = savedItem.ID;
            });
        });

        if (deletables) {
            let obsDel = Observable.from(deletables).switchMap( (item: any) => {
                return this.workerService.deleteByID(item.ID, route).map((event) => {
                    this.changeMap.removables.remove(item.ID, false);
                });
            });
            return items.length > 0 ? Observable.merge(obsSave, obsDel) : obsDel;
        }

        return obsSave;

    }

    private loadList() {
        if (!this.initialized) {
            return;
        }
        this.currentRelation = this.layout.data.factory();
        this.model$.next(this.currentRelation);
        if (this.currentId) {
            this.busy = true;
            this.workerService.getWorkRelations(this.currentId).subscribe((items) => {
                this.items = items;
                if (items.length > 0) {
                    this.onItemClicked(items[0]);
                }
                this.busy = false;
            }, err => this.errorService.handle(err));
        } else {
            this.items.length = 0;
        }
    }

    private createLayout() {

        var layout = {
            data: {
                route: 'workrelations',
                factory: () => {
                    return new WorkRelation();
                }
            },
            formFields: [
                createFormField('WorkProfileID', 'Stillingsmal', ControlTypes.SelectInput, undefined
                    , false, 0, undefined, this.getComboOptions()),
                createFormField('WorkPercentage', 'Prosent', ControlTypes.NumericInput),
                createFormField('CompanyName', 'Firmanavn', ControlTypes.TextInput),
                createFormField('Description', 'Beskrivelse', ControlTypes.TextInput),
                createFormField('StartDate', 'Startdato', ControlTypes.LocalDate),
                createFormField('EndTime', 'Sluttdato', ControlTypes.LocalDate),
                createFormField('IsActive', 'Aktiv', ControlTypes.CheckboxInput),
                createFormField('TeamID', 'Team', ControlTypes.SelectInput, undefined
                    , false, 0, undefined, this.getTeamCombo()),
            ],
        };

        return layout;
    }

    private getComboOptions(): any {
        return {
            source: this.workerService.getWorkProfiles(),
            template: (obj) => `${obj.ID} - ${obj.Name}`,
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 250,
        };
    }

    private getTeamCombo(): any {
        return {
            source: this.workerService.get('teams?hateoas=false'),
            template: (obj) => `${obj.ID} - ${obj.Name}`,
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 250,
        };
    }

}
