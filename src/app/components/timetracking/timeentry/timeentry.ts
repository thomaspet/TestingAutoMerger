import {Component, AfterViewInit} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {Worker, WorkRelation, WorkProfile, WorkItem} from '../../../unientities';
import {WorkerService} from '../../../services/timetracking/workerservice';
import {Editable, IChangeEvent, IConfig, Column} from '../utils/editable/editable';
import {parseTime, addTime, parseDate} from '../utils/utils';
import {TimesheetService, TimeSheet, ValueItem} from '../../../services/timetracking/timesheetservice';
import {IsoTimePipe} from '../utils/isotime';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';

declare var moment;

export var view = new View('timeentry', 'Registrere timer', 'TimeEntry');

@Component({
    selector: view.name,
    templateUrl: 'app/components/timetracking/timeentry/timeentry.html', 
    styles: [`
            .title { font-size: 18pt; padding: 1em 1em 1em 0; }
            .title span { margin-right: 1em;}
            .title select { display:inline-block; width: auto; padding-left: 7px; padding-right: 7px; }
            .timeentriesTable { width: 100%; border-collapse: collapse } 
            .timeentriesTable th { text-align:left; border-bottom: 1px solid #c0c0c0; } 
            .timeentriesTable tr { height: 1.5em;}
            .timeentriesTable td { padding: 4px 4px 1px 4px; border-bottom: 1px solid #d0d0d0; border-left: 1px solid #d0d0d0; }
            .subcontainer { margin-top: 1em;}
            .tabtip { color: #606060; margin-left: -15px; }
            .busy { padding: 7px; color: green; font-size: 14pt; }
            `],
    directives: [Editable, UniSave],
    providers: [WorkerService, TimesheetService],
    pipes: [IsoTimePipe]
})
export class TimeEntry {    
    view = view;
    busy = true;
    userName = '';
    workRelations: Array<WorkRelation> = [];
    private timeSheet: TimeSheet = new TimeSheet();

    private actions: IUniSaveAction[] = [ 
            { label: 'Lagre endringer', action: (done)=>this.save(done), main: true, disabled: true }
        ];   
    
    tabs = [ { name: 'timeentry', label: 'Timer', isSelected: true },
            { name: 'totals', label: 'Totaler' },
            { name: 'flex', label: 'Fleksitid', counter: 15 },
            { name: 'profiles', label: 'Arbeidsgivere', counter: 1 },
            { name: 'vacation', label: 'Ferie', counter: 22 },
            { name: 'offtime', label: 'Fravær', counter: 4 },
            ];
            
    tableConfig: IConfig = {
        columns: [
            new Column('Description'), 
            new Column('StartTime', '', 'time'),
            new Column('EndTime', '', 'time'),
            new Column('Date','', 'date'),
            new Column('WorkTypeID','', 'lookup'),
            new Column('Project', '', 'lookup')
            ],
        events: {
            onChange: (event) => { this.onChange(event); }
        }  
    };
            
    constructor(private tabService: TabService, private service:WorkerService, private timesheetService:TimesheetService) {
        this.tabService.addTab({ name: view.label, url: view.route });
        this.userName = service.user.name;
        this.initUser();
    }
    
    ngAfterViewInit() {

    }
    
    initUser() {
        this.timesheetService.initService(this.service);
        this.timesheetService.initUser().subscribe((ts:TimeSheet)=>{
            this.workRelations = this.timesheetService.workRelations;
            this.timeSheet = ts;
            this.loadItems();
        })
    }
    
    loadItems() {
        if (this.timeSheet.currentRelation && this.timeSheet.currentRelation.ID) {
            this.timeSheet.loadItems().subscribe((itemCount:number)=>{
                this.timeSheet.ensureRowCount(itemCount + 1);
                this.flagUnsavedChanged(true);
                this.busy = false;
            })    
        } else {
            alert("Current worker/user has no workrelations!");
        }
    }

    save(done) {
        this.busy = true;
        var counter = 0;
        this.timeSheet.saveItems().subscribe((item:WorkItem)=>{            
            counter++;                
        }, (err)=>{
            var msg:string = err._body || err.statusText;
            if (msg.indexOf('"Message":')>0) {
                msg = msg.substr(msg.indexOf('"Message":') + 12, 80) + "..";
            }
            done('Feil ved lagring: ' + msg);
            alert(msg);
            this.busy = false;            
        }, ()=>{
            this.flagUnsavedChanged(true);
            done(counter + " poster ble lagret.");
            this.loadItems();
        });
    }

    flagUnsavedChanged(reset = false) {
        this.actions[0].disabled = reset;
    }
       
    onChange(event: IChangeEvent ) {

        // Update value via timesheet
        if (!this.timeSheet.setItemValue(new ValueItem(event.columnDefiniton.name, event.value, event.row))) {
            event.cancel = true;
            return;
        }

        this.flagUnsavedChanged();

		// Ensure a new row at bottom?
		this.timeSheet.ensureRowCount(event.row + 2);
		
		// we use databinding instead
        event.updateCell = false;       
		
    }
    
    
    
}