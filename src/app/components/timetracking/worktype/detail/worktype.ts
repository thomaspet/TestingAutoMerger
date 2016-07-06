import {Component, ViewChild} from "@angular/core";
import {TabService} from '../../../layout/navbar/tabstrip/tabService';
import {View} from '../../../../models/view/view';
import {WorkerService} from '../../../../services/timetracking/workerservice';
import {WorkTypeSystemTypePipe, SystemTypes} from '../../utils/pipes';
import {Router, RouteParams, RouterLink} from '@angular/router-deprecated';
import {WorkType} from '../../../../unientities';
import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniFieldLayout} from '../../../../../framework/uniform';
import {createFormField} from '../../utils/utils';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {URLSearchParams} from '@angular/http'

export var view = new View('worktype', 'Timeart', 'WorktypeDetailview', true, 'worktype/detail');

enum IAction {
    Save = 0,
    Delete = 1
}

var resource = 'worktypes';
var statResource = 'worktype';

var labels = {
    'new': 'Ny timeart',
    'action_save': 'Lagre',
    'action_delete':'Slett',
    'deleted_ok': 'Sletting ok',
    'error': 'En feil oppstod',
    'err_loading': 'Feil ved lasting',
    'err_save': 'Feil ved lagring',
    'err_delete': 'Feil ved sletting'
}

@Component({
    selector: view.name,
    templateUrl: 'app/components/timetracking/worktype/detail/worktype.html',
    pipes: [WorkTypeSystemTypePipe],
    providers: [WorkerService],
    directives: [UniForm, UniSave]
})
export class WorktypeDetailview {
    @ViewChild(UniForm) form:UniForm;
    private busy = true;
    private title:any;
    private ID:number;
    private current: WorkType;
    private fields: Array<any>;
    private config: any = {};
    private actions: IUniSaveAction[] = [ 
        { label: labels.action_save, action: (done)=>this.save(done), main: true, disabled: false },
        { label: labels.action_delete, action: (done)=>this.delete(done), main:false, disabled: true}
    ];     

    constructor(private workerService: WorkerService, 
        private params: RouteParams, private tabService: TabService,
        private toastService: ToastService, private router: Router) {
        this.ID = parseInt(params.get('id'));
        this.updateTitle();        
    }

    public ngOnInit() {
        this.setupLayout();        
    }

    public onShowList() {
         this.router.navigateByUrl('/timetracking/worktypes');
    }

    public onNavigate(direction = 'next')
    {
        this.busy = true;
        this.navigate(direction).then(()=>this.busy= false, ()=> this.busy = false);        
    }

    private navigate(direction = 'next'):Promise<any>
    {        
    
        var params = 'model=' + statResource;
        var resultFld = 'minid';

        if (direction==='next') {
            params += '&select=min(id)&filter=deleted eq \'false\'' + (this.ID ? ' and id gt ' + this.ID : '');
        } else {
            params += '&select=max(id)&filter=deleted eq \'false\'' + (this.ID ? ' and id lt ' + this.ID : '');
            resultFld = 'maxid';
        }

        return new Promise((resolve, reject) => {
            this.workerService.getStatistics(params).subscribe((items)=>{
                if (items && items.length > 0 && items[0].Data && items[0].Data.length>0) {
                    var key = items[0].Data[0][resultFld];
                    if (key) {                        
                        this.loadCurrent(key);
                        resolve(true);
                        return;
                    }
                }
                reject(0); // not found
            }, (err)=>{
                reject(-1); // error
            });
        });
    }

    public onChange() {

    }

    public onCreateNew() {
        this.loadCurrent(0, true);
    }

    public onReady(event) {
        this.loadCurrent(this.ID);
    }

    private loadCurrent(id:number, updateTitle = false) {
        if (id) {
            this.busy = true;
            this.workerService.getByID(id, resource).subscribe((item:WorkType) =>{
                this.ID = item.ID;
                if (item) {
                    item.SystemType = item.SystemType || 1 // default type = 1. timer;
                    this.current = item;
                    this.enableAction(IAction.Delete);
                }
                if (updateTitle) {
                    this.updateTitle();
                }
                this.busy = false;                
            }, (err)=> {
                this.showErrMsg(err._body || err.statusText, labels.err_loading, true);
                this.busy = false; 
            });
        } else {
            let t = new WorkType();
            this.ID = 0;
            t.SystemType = 1 // default type = 1. timer;
            this.current = t;
            this.enableAction(IAction.Delete, false);
            this.busy = false;
            if (updateTitle) {
                this.updateTitle();
            }
        }        
    }

    private enableAction(actionID:IAction, enable = true) {
        this.actions[actionID].disabled = !enable;
    }

    private updateTitle() {
        this.title = this.ID ? view.label + ' ' + this.ID : labels.new;  
        this.tabService.addTab({ name: this.title, url: view.url + '/' + this.ID, moduleID: 17, active: true });
    }

    private save(done) {
        this.busy = true;
        this.workerService.saveByID(this.current, resource).subscribe((item)=>{
            this.current = item;
            this.ID = item.ID;
            this.updateTitle();
            this.enableAction(IAction.Delete, true);
            done(this.title);
        }, (err)=>{
            this.busy = false
            var msg = this.showErrMsg(err._body || err.statusText, labels.err_save, true);
            if (done) { done(labels.err_save + ':' + msg); }
        }, ()=> this.busy = false);
    }

    private delete(done) {
        if (this.ID) {
            this.workerService.deleteByID(this.ID, resource).subscribe((result)=>{
                done(labels.deleted_ok);
                this.postDeleteAction();
            }, (err)=>{
                var msg = this.showErrMsg(err._body || err.statusText,labels.err_delete, true);
                if (done) { done(labels.err_delete + ':' + msg); }
                this.busy = false;
            }, ()=> this.busy = false);
        }
    }

    private postDeleteAction() {
        this.busy = true;
        this.navigate('next').catch((id)=>{
            if (id===0) {
                this.navigate('prev').catch((id)=> {
                    this.loadCurrent(0, true);
                });
                return;
            }
            this.loadCurrent(0, true);
        });        
    }

    private setupLayout() {
        this.fields = [
            createFormField('Name', 'Navn'),
            createFormField('SystemType', 'Type', 3, null, null, null, {
                source: SystemTypes, valueProperty: 'id', displayProperty: 'label'
            }),
            createFormField('Description', 'Kommentar', 16)
        ];
    }

    showErrMsg(msg:string, title?:string, lookForMsg = false):string {
        var txt = msg;
        if (lookForMsg) {
            let tStart = '"Message":';
            let ix = msg.indexOf(tStart);
            if (ix > 0) {
                ix += tStart.length;
                let ix2 = msg.indexOf('"', ix);
                if (ix2>ix) {
                    ix = ix2+1;
                    ix2 = msg.indexOf('"', ix2+1);
                    txt = msg.substr(ix, ix2>ix ? ix2-ix : 80);
                } else {
                    txt = msg.substr(ix, 80) + "..";
                }
            }
        }
        this.toastService.addToast(title || labels.error, ToastType.bad, 6, txt);
        return txt;
    }     

}  