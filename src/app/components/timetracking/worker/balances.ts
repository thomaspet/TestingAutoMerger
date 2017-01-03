import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {WorkerService} from '../../../services/timetracking/workerservice';
import {WorkBalance, WorkRelation} from '../../../unientities';
import {ErrorService} from '../../../services/common/ErrorService';
import {UniTableColumn, UniTableColumnType, UniTableConfig, UniTable} from 'unitable-ng2/main';
import {MinutesToHoursPipe} from '../utils/pipes';
import {ChangeMap} from '../utils/changeMap';
import {safeDec, safeInt} from '../utils/utils';
import {Observable} from 'rxjs/Rx';
import {UniConfirmModal, ConfirmActions} from '../../../../framework/modals/confirm';

@Component({
    selector: 'workbalances',
    templateUrl: 'app/components/timetracking/worker/balances.html',
})
export class View {
    @Input() public set workerid(id: number) {
        this.loadList(id);
    }
    @Output() public valueChange: EventEmitter<any> = new EventEmitter();
    
    @ViewChild(UniTable) private tableView: UniTable;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;

    public currentId: number = 0;
    public relations: Array<WorkRelation>;
    public list: Array<WorkBalance>;
    public currentRelation: WorkRelation;
    private isActivated: boolean = false;
    private tableConfig: UniTableConfig;
    private unsavedChanges: boolean = false;
    private busy: boolean = false;

    private changeMap: ChangeMap = new ChangeMap();

    constructor(private workerService: WorkerService, private errorService: ErrorService) {
    }

    public activate(workerid: number, reload = false) {
        var preActivated = this.isActivated;
        this.isActivated = true;
        if ( (!preActivated) || this.currentId !== workerid || (reload && preActivated) ) {
            this.loadList(workerid);
        }
    }

    private loadList(workerId: number) {
        this.flagSavedChanges(false);
        if (!this.isActivated) { return; }
        this.currentId = workerId;
        this.list = [];
        this.workerService.getWorkRelations(workerId).subscribe( x => {
            this.relations = x;
            if (x.length > 0) {
                this.selectWorkRelation(x[0]);
            } else {
                this.tableConfig = this.createTableConfig();
            }
        });
    }

    public hasUnsavedChanges(): boolean {
        return this.unsavedChanges;
    }

    private flagSavedChanges(dirty: boolean) {
        this.unsavedChanges = dirty;
        if (!dirty) {
            this.changeMap.clear();
        }
    }

    public addNew() {
        var item = this.createNewItem();
        this.tableView.addRow( JSON.parse( JSON.stringify(item) ) );
        setTimeout( () => {
            this.tableView.focusRow(this.list.length);    
        }, 50);
    }

    public onSaveClicked() {
        // ensure onBlur has happened on current editor-cell
        setTimeout( () => {
            this.save();
        }, 30);
    }

    public save(reloadAfter = true): Promise<boolean> {
        this.busy = true;
        return new Promise( (resolve, reject) => {
            if (!this.hasUnsavedChanges()) { resolve(true); }
            this.saveChanges(this.currentId).finally( () => this.busy = false )
                .subscribe( result => { 
                    this.flagSavedChanges(false);
                    if (reloadAfter) { this.reset(); }
                    resolve(true);
                }, err => {
                    resolve(false);
                });
        });
    }

    private saveChanges(parentID: number): Observable<any> {
        
        var items = this.changeMap.getValues();
        if (items.length > 0) {
            items.forEach( item => item.WorkerID = parentID );
        }

        var removables = this.changeMap.getRemovables();
        if (items.length === 0 && removables.length === 0) {
            return null;
        }

        var obs = this.saveAndDelete('workbalances', items, removables);
        return Observable.forkJoin(obs);
    }

    private saveAndDelete(route: string, items: Array<any>, deletables?: any[]): Observable<any> {

        var obsSave = Observable.from(items).flatMap((item: any) => {
            item.ID = item.ID < 0 ? 0 : item.ID;
            return this.workerService.saveByID<any>(item, route).map((savedItem: WorkRelation) => {
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

    private checkSave(reloadAfter = false): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.hasUnsavedChanges()) {
                this.confirmModal.confirm('Lagre endringer før du fortsetter?', 'Lagre endringer', true)
                .then( (x: ConfirmActions) => {
                    switch (x) {
                        case ConfirmActions.ACCEPT:
                            this.save(reloadAfter).then(success => {
                                resolve(true);
                            }).catch( () => 
                                resolve(false) );
                            break;
                        case ConfirmActions.REJECT:
                            resolve(true);
                            break;
                        default: // CANCEL
                            resolve(false);
                    } 
                });
            } else {
                resolve(true);
            }
        });
    }

    public reset() {
        this.loadBalances(this.currentRelation.ID);
    }

    public onRelationChanged(textualID: string) {
        this.checkSave().then( () => {
            var id = safeInt(textualID);
            this.relations.forEach( x => {
                if (x.ID === id) {
                    this.selectWorkRelation(x);
                }
            });
        });
    }

    private selectWorkRelation(rel: WorkRelation) {
        this.currentRelation = rel;
        this.loadBalances(this.currentRelation.ID);
    }

    private loadBalances(workRelationId: number) {
        this.busy = true;
        this.workerService.get('workbalances', 
        { filter: `workrelationid eq ${workRelationId}`, orderBy: 'BalanceDate Desc'})
            .finally( () => this.busy = false )
            .subscribe( x => {
            this.list = <any>x;            
            this.list.forEach( (item: any) => item.Hours = safeDec(item.Minutes / 60));
            this.tableConfig = this.createTableConfig();
            this.flagSavedChanges(false);
        });
    }

    private mapStatusCode(item: WorkBalance): string {
        if (item === undefined) { return ''; };
        var statusCode = item.StatusCode;
        if (statusCode === undefined) { return ''; };
        switch (statusCode) {
            case 0:
                return 'Utkast';
            case null:
                return item.ID ? 'Utkast' : '';
            default:
                return 'Status ' + statusCode;
        }
    }

    private createTableConfig(): UniTableConfig {
        var hourPipe = new MinutesToHoursPipe();

        var statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Select)
            .setTemplate( item => this.mapStatusCode(item) );
        statusCol.editable = false;

        var changedCol = new UniTableColumn('UpdatedAt', 'Sist endret', UniTableColumnType.LocalDate)
            .setFormat('DD.MM.YYYY HH:mm');
        changedCol.editable = false;

        var cols = [
            new UniTableColumn('BalanceDate', 'Dato', UniTableColumnType.LocalDate),
            new UniTableColumn('Hours', 'Timesaldo')
                .setTemplate( item => item && item.Minutes ? hourPipe.transform(item.Minutes, 'decimal') : '' ),
            new UniTableColumn('Description', 'Kommentar'),
            changedCol,
            statusCol
        ];

        var cfg = new UniTableConfig(false, true)
            .setSearchable(false)
            .setColumns(cols)
            .setColumnMenuVisible(true)
            .setEditable(true)
            .setChangeCallback( x => this.onEditChange(x) )
            .setDeleteButton(true);            

        cfg.autoAddNewRow = false;

        return cfg;
    }    

    public onDeleteRow(event) {        
        var rowModel = event.rowModel;
        if (!rowModel) { return; }
        var index = rowModel._originalIndex;
        if (rowModel.ID) {
            this.changeMap.addRemove(index, rowModel);
            this.flagSavedChanges(true);
        }
        this.changeMap.remove(index, true);        
    }

    private createNewItem(): WorkBalance {
        let item = new WorkBalance();
        item.WorkRelationID = this.currentRelation.ID;
        item.Balancetype = 11;
        return item;
    }

    private onEditChange(event) {
        if (!(event || event.rowModel )) { return; }
        var value = event.rowModel[event.field];
        var item: WorkBalance;
        if (event.originalIndex < this.list.length) {
            item = this.list[event.originalIndex];
        } else {
            item  = event.rowModel;
            this.list.push(item);
        }
        switch (event.field) {
            case 'Hours':
                value = parseFloat(safeDec(value).toFixed(3));
                item.Minutes = safeDec(value) * 60;
                event.rowModel['Minutes'] = item.Minutes;
                break;
        }
        item[event.field] = value;
        this.changeMap.add(event.originalIndex, item);
        this.flagSavedChanges(true);
        return event.rowModel;
    }
   
}
