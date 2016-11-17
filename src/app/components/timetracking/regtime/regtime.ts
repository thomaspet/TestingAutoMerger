import {Component, ViewChild} from '@angular/core';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {WorkRelation, WorkItem, WorkType} from '../../../unientities';
import {UniTable, UniTableColumn, UniTableConfig, UniTableColumnType, IContextMenuItem} from 'unitable-ng2/main';
import {Observable} from 'rxjs/Rx';
import {WorkerService, ItemInterval} from '../../../services/timetracking/workerservice';
import {TimesheetService, TimeSheet, ValueItem} from '../../../services/timetracking/timesheetservice';
import {IUniSaveAction} from '../../../../framework/save/save';
import {setDeepValue} from '../utils/utils';
import {ErrorService} from '../../../services/common/ErrorService';

export var view = new View('regtime', 'Timeregistrering', 'RegisterTime', false, '', RegisterTime);

declare var moment;

interface IFilter {
    name: string;
    label: string;
    isSelected?: boolean;
    interval: ItemInterval;
}

@Component({
    selector: view.name,
    templateUrl: 'app/components/timetracking/regtime/regtime.html'
})
export class RegisterTime {
    public view: View = view;
    @ViewChild(UniTable) private dataTable: UniTable;

    private busy: boolean = true;
    private userName: string = '';
    private tableConfig: UniTableConfig;
    private worktypes: Array<WorkType> = [];
    private workRelations: Array<WorkRelation> = [];
    private timeSheet: TimeSheet = new TimeSheet();
    private currentFilter: { name: string, interval: ItemInterval };

    public tabs: Array<any> = [ { name: 'timeentry', label: 'Timer', isSelected: true },
            { name: 'totals', label: 'Totaler' },
            { name: 'flex', label: 'Fleksitid', counter: 12 },
            { name: 'profiles', label: 'Arbeidsgivere', counter: 1 },
            { name: 'vacation', label: 'Ferie', counter: 22 },
            { name: 'offtime', label: 'Fravær', counter: 4 },
            ];

    public filters: Array<IFilter> = [
        { name: 'today', label: 'I dag', isSelected: true, interval: ItemInterval.today },
        { name: 'week', label: 'Denne uke', interval: ItemInterval.thisWeek},
        { name: 'month', label: 'Denne måned', interval: ItemInterval.thisMonth},
        { name: 'months', label: 'Siste 2 måneder', interval: ItemInterval.lastTwoMonths},
        { name: 'year', label: 'Dette år', interval: ItemInterval.thisYear},
        { name: 'all', label: 'Alt', interval: ItemInterval.all}
    ];

    private actions: IUniSaveAction[] = [
            { label: 'Lagre', action: (done) => this.save(done), main: true, disabled: true }
        ];

    constructor(
        private tabService: TabService,
        private workerService: WorkerService,
        private timesheetService: TimesheetService,
        private errorService: ErrorService
    ) {
        this.tabService.addTab({ name: view.label, url: view.url, active: true });
        this.userName = workerService.user.name;
        this.tableConfig = this.createTableConfig();
        this.currentFilter = this.filters[0];
        this.initServiceValues();
    }

    public canDeactivate(): any {
        return this.checkSave();
    }

    public save(done?: any) {
        return new Promise((resolve, reject) => {
            this.busy = true;
            var counter = 0;
            this.timeSheet.saveItems().subscribe((item: WorkItem) => {
                counter++;
            }, (err) => {
                this.errorService.handle(err);
                if (done) { done('Feil ved lagring'); }
                this.busy = false;
                resolve(false);
            }, () => {
                this.flagUnsavedChanged(true);
                if (done) { done(counter + ' poster ble lagret.'); }
                this.loadItems();
                resolve(true);
            });
        });
    }

    public checkSave(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.hasUnsavedChanges()) {
                if (confirm('Lagre endringer før du fortsetter?')) {
                    this.save().then((success: boolean) => {
                        if (success) {
                            resolve(true);
                        } else {
                            reject();
                        }
                    });
                    return;
                }
            }
            resolve(true);
        });
    }

    public loadItems() {
        if (this.timeSheet.currentRelation && this.timeSheet.currentRelation.ID) {
            this.timeSheet.loadItems(this.currentFilter.interval).subscribe((itemCount: number) => {
                this.busy = false;
                this.tableConfig = this.createTableConfig();
                this.actions[0].disabled = true;
            });
        } else {
            this.errorService.handle('Current worker/user has no workrelations!');
        }
    }


    public initServiceValues() {

        this.timesheetService.initUser().subscribe((ts: TimeSheet) => {
            this.timeSheet = ts;
            this.loadItems();
            this.workRelations = this.timesheetService.workRelations;
        });

        this.workerService.queryWithUrlParams().subscribe((result: Array<WorkType>) => {
            this.worktypes = result;
        }, this.errorService.handle);

    }

    public onFilterClick(filter: IFilter) {
        this.checkSave().then(() => {
            this.filters.forEach((value: any) => value.isSelected = false);
            filter.isSelected = true;
            this.currentFilter = filter;
            this.busy = true;
            this.loadItems();
        });
    }

    public filterWorkTypes(txt: string): Observable<any> {
        var list = this.worktypes;
        var lcaseText = txt.toLowerCase();
        var sublist = list.filter((item: WorkType) => {
            return (item.ID.toString() === txt || item.Name.toLowerCase().indexOf(lcaseText) >= 0); } );
        return Observable.from([sublist]);
    }

    public filterDimensions(route: string, txt: string): Observable<any> {
        var list = [{ID: 1, Name: 'Testproject'}, {ID: 2, Name: 'Economy project'}];
        return Observable.from([list]);
    }

    public createTableConfig(): UniTableConfig {

        var cols = [
            new UniTableColumn('Date', 'Dato', UniTableColumnType.Date, true),
            this.createTimeColumn('StartTime', 'Fra kl.'),
            this.createTimeColumn('EndTime', 'Til kl.'),
            this.createLookupColumn('Worktype', 'Type arbeid', 'Worktype', (txt) => this.filterWorkTypes(txt)),
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text, true).setWidth('40vw'),
            this.createDimLookup('Dimensions.ProjectID', 'Prosjekt', (txt) => this.filterDimensions('projects', txt)),
        ];

        var ctx: Array<IContextMenuItem> = [];
        ctx.push({
            label: 'Slett post',
            action: (rowModel) => {
                var rowIndex = rowModel._originalIndex;
                if (rowIndex >= 0) {
                    this.timeSheet.removeRow(rowIndex);
                    this.dataTable.removeRow(rowIndex);
                    if (rowModel.ID) {
                        this.flagUnsavedChanged();
                    }
                }
            },
            disabled: (rowModel) => {
                return false;
            }
        });

        return new UniTableConfig(true, true, 25).setColumns(cols).setChangeCallback((event) => this.onEditChange(event)).setContextMenu(ctx).setFilters([]);
    }

    public onEditChange(event) {

        var newRow = event.rowModel;
        var change = new ValueItem(event.field, newRow[event.field], event.originalIndex);
        if (this.timeSheet.setItemValue(change)) {
            this.flagUnsavedChanged();
            setDeepValue(newRow, event.field, change.value);
            return newRow;
        }

    }

    public flagUnsavedChanged(reset = false) {
        this.actions[0].disabled = reset;
    }

    public hasUnsavedChanges(): boolean {
        return !this.actions[0].disabled;
    }

    // UniTable helperes:

    private createTimeColumn(name: string, label: string): UniTableColumn {
        return new UniTableColumn(name, label, UniTableColumnType.Text)
            .setTemplate((item: any) => {
                var value = item[name];
                if (value) {
                    return moment(value).format('HH:mm');
                }
                return '';
            });
    }

    private createLookupColumn(name: string, label: string, expandCol: string, lookupFn?: any, expandKey = 'ID', expandLabel = 'Name'): UniTableColumn {
        var col = new UniTableColumn(name, label, UniTableColumnType.Lookup)
            .setDisplayField(`${expandCol}.${expandLabel}`)
            .setEditorOptions({
                itemTemplate: (item) => {
                    return item[expandKey] + ' - ' + item[expandLabel];
                },
                lookupFunction: lookupFn
            });
        return col;
    }

    private createDimLookup(name: string, label: string, lookupFn: any ): UniTableColumn {
        var col = new UniTableColumn(name, label, UniTableColumnType.Lookup)
            .setDisplayField(name)
            .setEditorOptions({
                itemTemplate: (item) => {
                    return item['ID'] + ' - ' + item['Description'];
                },
                lookupFunction: lookupFn
            });
        return col;
    }

}
