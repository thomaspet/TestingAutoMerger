import {Component} from "@angular/core";
import {TabService} from '../../../layout/navbar/tabstrip/tabService';
import {View} from '../../../../models/view/view';
import {WorkerService} from '../../../../services/timetracking/workerservice';
import {WorkTypeSystemTypePipe} from '../../utils/pipes';
import {RouteParams} from '@angular/router-deprecated';
import {WorkType} from '../../../../unientities';
import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniFieldLayout} from '../../../../../framework/uniform';
import {SystemTypes} from '../../utils/pipes';

export var view = new View('worktype', 'Timeart', 'WorktypeDetailview', true, 'worktype/detail');

@Component({
    selector: view.name,
    templateUrl: 'app/components/timetracking/worktype/detail/worktype.html',
    pipes: [WorkTypeSystemTypePipe],
    providers: [WorkerService],
    directives: [UniForm, UniSave]
})
export class WorktypeDetailview {
    private busy = true;
    private title:any;
    private ID:number;
    private current: WorkType;
    private fields: Array<any>;
    private config: any = {};
    private actions: IUniSaveAction[] = [ 
        { label: 'Lagre endringer', action: (done)=>this.save(done), main: true, disabled: false },
        { label: 'Slett', action: (done)=>this.delete(done), main:false, disabled: true}
    ];     

    constructor(private workerService: WorkerService, 
        private params: RouteParams, private tabService: TabService) {
        this.ID = parseInt(params.get('id'));
        this.updateTitle();        
    }

    public ngOnInit() {
        this.setupLayout();        
    }

    public onChange(event) {

    }

    public onReady(event) {
        this.loadCurrent(this.ID);
    }

    private loadCurrent(id:number, updateTitle = false) {
        if (id) {
            this.workerService.getByID(id, 'worktypes').subscribe((item:WorkType) =>{
                if (item) {
                    item.SystemType = item.SystemType || 1 // timer;
                    this.current = item;
                    this.actions[1].disabled = false;
                }
                if (updateTitle) {
                    this.updateTitle();
                }                
            }, (err)=> this.showErrMsg(err._body || err.statusText, true), ()=> this.busy = false );
        } else {
            let t = new WorkType();
            this.ID = 0;
            t.SystemType = 1 // timer;
            this.current = t;
            this.actions[1].disabled = true;
            this.busy = false;
            if (updateTitle) {
                this.updateTitle();
            }
        }
        
    }

    private updateTitle() {
        this.title = this.ID ? view.label + ' ' + this.ID : 'Ny timeart';  
        this.tabService.addTab({ name: this.title, url: view.url + '/' + this.ID, moduleID: 17, active: true });
    }

    private save(done) {
        this.busy = true;
        this.workerService.saveByID(this.current, 'worktypes').subscribe((item)=>{
            this.current = item;
            this.ID = item.ID;
            this.updateTitle();
            done(this.title);
        }, (err)=>{
            var msg = this.showErrMsg(err._body || err.statusText, true);
            if (done) { done('Feil ved lagring: ' + msg); }
        }, ()=> this.busy = false);
    }

    private delete(done) {
        if (this.ID) {
            this.workerService.deleteByID(this.ID, 'worktypes').subscribe((result)=>{
                this.loadCurrent(0, true);
                done('Sletting ok');
            }, (err)=>{
                var msg = this.showErrMsg(err._body || err.statusText, true);
                if (done) { done('Feil ved sletting: ' + msg); }
                this.busy = false;
            }, ()=> this.busy = false);
        }
    }

    private setupLayout() {
        this.fields = [
            this.createField('Name', 'Navn'),
            this.createField('SystemType', 'Type', 3, null, null, null, {
                source: SystemTypes, valueProperty: 'id', displayProperty: 'label'
            }),
            this.createField('Description', 'Kommentar', 16)
        ];
    }

    private createField(name:string, label:string, fieldType = 10, section = 0, sectionHeader?:string, fieldSet = 0, options?: any):any {
        return { 
            EntityType: 'WorkType', 
            Property: name, Label: label,
            FieldType: fieldType,
            Section: section, SectionHeader: sectionHeader,
            FieldSet: fieldSet,
            Combo: 0, Options: options
        }
    }

    showErrMsg(msg:string, lookForMsg = false):string {
        var txt = msg;
        if (lookForMsg) {
            if (msg.indexOf('"Message":')>0) {
                txt = msg.substr(msg.indexOf('"Message":') + 12, 80) + "..";
            }
        }
        alert(txt);
        return txt;
    }     

}  