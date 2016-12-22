import {Component, Input, Output, EventEmitter} from '@angular/core';
import {WorkerService} from '../../../../services/timetracking/workerservice';
import {WorkTimeOff} from '../../../../unientities';
import {Router} from '@angular/router';
import {createFormField, FieldSize, ControlTypes} from '../../utils/utils';
import {ChangeMap} from '../../utils/changeMap';
import {Observable} from 'rxjs/Rx';
import {IResult} from '../../genericview/detail';
import {ErrorService} from '../../../../services/common/ErrorService';

@Component({
    selector: 'vacation',
    templateUrl: 'app/components/timetracking/timeentry/vacation/vacation.html',
})
export class View {
    @Input() public set workrelationid(id: number) {
        this.parentId = id;
        this.loadList();
    }
    @Output() public valueChange: EventEmitter<any> = new EventEmitter();
    @Output() public saved: EventEmitter<any> = new EventEmitter();

    public collapseView: boolean = false;
    public items: Array<WorkTimeOff> = [];
    public busy: boolean = false;
    private initialized: boolean = false;
    public hasUnsavedChanges: boolean = false;

    public formConfig: any = {};
    public layout: any;

    public parentId: number = 0;
    public current: WorkTimeOff = new WorkTimeOff();

    private changeMap: ChangeMap = new ChangeMap();

    constructor(private workerService: WorkerService, private router: Router, private errorService: ErrorService) {
        this.layout = this.createLayout();
    }

    public ngOnInit() {
        this.initialized = true;
    }

    public onReady(event: any) {
        this.loadList();
    }

    public onChange(event: any) {
        this.valueChange.emit(this.current);
        var ix = this.items.indexOf(this.current);
        this.changeMap.add(ix, this.current);
        this.hasUnsavedChanges = true;
    }

    public onItemClicked(item: WorkTimeOff) {
        this.flagSelected(item);
        this.current = item;
    }

    private flagSelected(item: any) {
        item._isSelected = true;
        (<any>this.current)._isSelected = false;
    }

    public onAddNew() {
        var item: WorkTimeOff = this.layout.data.factory();
        item.TimeoffType = 2; // Vacation
        item.Description = 'Ny ferie';
        item.WorkRelationID = this.parentId;
        this.items.push(item);
        this.onItemClicked(item);
        this.changeMap.add(this.items.indexOf(item), this.current);
        this.valueChange.emit(this.current);
    }

    public onReset() {
        this.loadList();
        this.hasUnsavedChanges = false;
    }

    public onDelete() {
        var rel = this.current;
        if (rel) {
            if (rel.ID) {
                this.changeMap.addRemove(rel.ID, rel);
                this.hasUnsavedChanges = true;
                this.valueChange.emit(rel);
            } else {
                this.changeMap.remove(this.items.indexOf(rel), true);
            }
        }
        if (rel) {
            var ix = this.items.indexOf(rel);
            this.items.splice(ix, 1);
            if (this.items.length > ix + 1) {
                this.onItemClicked(this.items[ix]);
            } else {
                if (this.items.length === 0) {
                    this.current = this.layout.data.factory();
                } else {
                    this.onItemClicked(this.items[this.items.length - 1]);
                }
            }
        }
    }

    public onSave() {
        this.saveChanges(this.parentId);
    }

    public saveChanges(parentID: number): Promise<IResult> {
        return new Promise((resolve, reject) => {
            var result = this.save(parentID);
            if (result === null) { 
                this.afterSaveCompleted();
                resolve({success: true});
            }
            result.subscribe( results => {
                this.afterSaveCompleted();
                resolve({ success: true });
            }, err => {
                // debugger;
                reject({ success: false, msg: err._body });
            });
        });
    }

    private afterSaveCompleted() {
        this.hasUnsavedChanges = false;
        this.saved.emit();
        this.loadList();
        this.changeMap.clear();
    }

    private save(parentID: number): Observable<any> {
        
        var items = this.changeMap.getValues();
        if (items.length > 0) {
            items.forEach( item => item.WorkerID = parentID );
        }

        var removables = this.changeMap.getRemovables();
        if (items.length === 0 && removables.length === 0) {
            return null;
        }

        var obs = this.saveAndDelete('worktimeoff', items, removables);
        return Observable.forkJoin(obs);
    }

    private saveAndDelete(route: string, items: Array<any>, deletables?: any[]): Observable<any> {
        var obsSave = Observable.from(items).flatMap((item: any) => {
            item.ID = item.ID < 0 ? 0 : item.ID;
            return this.workerService.saveByID<any>(item, route).map((savedItem: WorkTimeOff) => {
                this.changeMap.remove(item._rowIndex, true);
                item.ID = savedItem.ID;
            });
        });

        if (deletables) {
            let obsDel = Observable.from(deletables).flatMap( (item: any) => {
                return this.workerService.deleteByID(item.ID, route).map((event) => {
                    this.changeMap.removables.remove(item.ID, false);
                });
            });
            return items.length > 0 ? Observable.merge(obsSave, obsDel) : obsDel;
        }

        return obsSave;

    }

    private loadList() {
        if (!this.initialized) { return; }
        this.current = this.layout.data.factory();
        if (this.parentId) {
            this.busy = true;
            this.workerService.get<WorkTimeOff>('worktimeoff', 
                { filter: `workrelationid eq ${this.parentId}`,
                    top: 30, orderBy: 'todate desc' 
                }).subscribe( (items: any) => {
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
                route: 'worktimeoff',
                factory: () => { return new WorkTimeOff(); }
            },
            formFields: [                
                createFormField('Description', 'Beskrivelse av ferie/fri',  ControlTypes.TextInput, FieldSize.Full),
                createFormField('FromDate', 'Fra og med dato',  ControlTypes.LocalDate, FieldSize.Double ),
                createFormField('ToDate', 'Til og med dato',  ControlTypes.LocalDate, FieldSize.Double )
            ],
        };

        return layout;
    }  
/*
    private getTimeOffTypes(): Array<any> {
        return [
            { ID: 1, Name: 'Bevegelig helligdag'},
            { ID: 2, Name: 'Ferie'},
            { ID: 3, Name: 'Permisjon'}
        ];
    }
*/
}
