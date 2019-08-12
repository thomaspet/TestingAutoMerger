﻿import {Component, Input, Output, EventEmitter} from '@angular/core';
import {WorkerService} from '../../../../services/timetracking/workerService';
import {WorkTimeOff, FieldType} from '../../../../unientities';
import {Router} from '@angular/router';
import {createFormField, FieldSize, ControlTypes} from '../../../common/utils/utils';
import {ChangeMap} from '../../../common/utils/utils';
import {Observable} from 'rxjs';
import {IResult} from '../../genericview/detail';
import {ErrorService} from '../../../../services/services';
import {BehaviorSubject} from 'rxjs';
import * as moment from 'moment';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';

@Component({
    selector: 'vacation',
    templateUrl: './vacation.html',
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

    public layout$: BehaviorSubject<any> = new BehaviorSubject(null);

    public parentId: number = 0;
    public current$: BehaviorSubject<WorkTimeOff> = new BehaviorSubject(new WorkTimeOff());

    private changeMap: ChangeMap = new ChangeMap();

    constructor(
        private workerService: WorkerService,
        private router: Router,
        private errorService: ErrorService,
        private toastService: ToastService
    ) {
        this.layout$.next(this.createLayout());
    }

    public ngOnInit() {
        this.initialized = true;
    }

    public onReady(event: any) {
        this.loadList();
    }

    public onChange(event: any) {
        const currentValue = this.current$.getValue();
        this.valueChange.emit(currentValue);
        const ix = this.items.indexOf(currentValue);
        this.changeMap.add(ix, currentValue);
        this.hasUnsavedChanges = true;
        const fom = currentValue.FromDate;
        const tom = currentValue.ToDate;
        if (fom && tom && moment(tom).isBefore(fom)) {
            this.toastService
                .addToast('Advarsel', ToastType.warn, 0, `Nå er "til" dato (${tom}) før "fra" dato (${fom})!`);
        }
    }

    public onItemClicked(item: WorkTimeOff) {
        this.flagSelected(item);
        this.current$.next(item);
    }

    private flagSelected(item: any) {
        item._isSelected = true;
        (<any>this.current$.getValue())._isSelected = false;
    }

    public onAddNew() {
        const item: WorkTimeOff = this.layout$.getValue().data.factory();
        item.TimeoffType = 2; // Vacation
        item.Description = 'Ny ferie';
        item.WorkRelationID = this.parentId;
        this.items.push(item);
        this.onItemClicked(item);
        this.changeMap.add(this.items.indexOf(item), this.current$.getValue());
        this.valueChange.emit(this.current$.getValue());
    }

    public onReset() {
        this.loadList();
        this.hasUnsavedChanges = false;
    }

    public onDelete() {
        const rel = this.current$.getValue();
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
            const ix = this.items.indexOf(rel);
            this.items.splice(ix, 1);
            if (this.items.length > ix + 1) {
                this.onItemClicked(this.items[ix]);
            } else {
                if (this.items.length === 0) {
                    this.current$.next(this.layout$.getValue().data.factory());
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
        this.busy = true;
        return new Promise((resolve, reject) => {
            const result = this.save(parentID);
            if (result === null) {
                this.afterSaveCompleted();
                resolve({success: true});
            }
            result.subscribe( results => {
                this.afterSaveCompleted();
                resolve({ success: true });
            }, err => {
                this.busy = false;
                reject({ success: false, msg: 'Lagring feilet' });
            });
        });
    }

    private afterSaveCompleted() {
        this.hasUnsavedChanges = false;
        this.saved.emit();
        this.loadList();
        this.changeMap.clear();
        this.busy = false;
    }

    private save(parentID: number): Observable<any> {
        const items = this.changeMap.getValues();
        if (items.length > 0) {
            items.forEach( item => item.WorkerID = parentID );
        }

        const removables = this.changeMap.getRemovables();
        if (items.length === 0 && removables.length === 0) {
            return null;
        }

        const obs = this.saveAndDelete('worktimeoff', items, removables);
        return Observable.forkJoin(obs);
    }

    private saveAndDelete(route: string, items: Array<any>, deletables?: any[]): Observable<any> {
        const obsSave = Observable.from(items).switchMap((item: any) => {
            this.validateItem(item);
            return this.workerService.saveByID<any>(item, route).map((savedItem: WorkTimeOff) => {
                this.changeMap.remove(item._rowIndex, true);
                item.ID = savedItem.ID;
            });
        });

        if (deletables) {
            const obsDel = Observable.from(deletables).switchMap( (item: any) => {
                return this.workerService.deleteByID(item.ID, route).map((event) => {
                    this.changeMap.removables.remove(item.ID, false);
                });
            });
            return items.length > 0 ? Observable.merge(obsSave, obsDel) : obsDel;
        }

        return obsSave;

    }

    private validateItem(item: WorkTimeOff) {
        const today = new Date();
        item.ID = item.ID || 0;
        item.TimeoffType = item.TimeoffType || 2; // Vacation
        item.FromDate = item.FromDate || today;
        item.ToDate = item.ToDate || item.FromDate || today;
        item.WorkRelationID = item.WorkRelationID || this.parentId;
    }

    private loadList() {
        if (!this.initialized) { return; }
        this.current$.next(this.layout$.getValue().data.factory());
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
        const layout = {
            data: {
                route: 'worktimeoff',
                factory: () =>  new WorkTimeOff()
            },
            Fields: [
                createFormField('Description', 'Beskrivelse av ferie/fri', ControlTypes.TextInput, FieldSize.Full),
                createFormField('FromDate', 'Fra og med dato', ControlTypes.LocalDate, FieldSize.Full),
                createFormField('ToDate', 'Til og med dato',  ControlTypes.LocalDate, FieldSize.Full )
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
