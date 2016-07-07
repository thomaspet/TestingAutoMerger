import {Component, ViewChild, Input} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {WorkerService} from '../../../services/timetracking/workerservice';
import {Router, RouteParams, RouterLink} from '@angular/router-deprecated';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {UniForm, UniFieldLayout} from '../../../../framework/uniform';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {URLSearchParams} from '@angular/http'
import {IViewConfig} from './list';

enum IAction {
    Save = 0,
    Delete = 1
}

var labels = {
    'action_save': 'Lagre',
    'action_delete':'Slett',
    'deleted_ok': 'Sletting ok',
    'error': 'En feil oppstod',
    'err_loading': 'Feil ved lasting',
    'err_save': 'Feil ved lagring',
    'err_delete': 'Feil ved sletting',
    'ask_delete': 'Ønsker du virkelig å slette aktuell post?'
}

@Component({
    selector: 'genericdetail',
    templateUrl: 'app/components/timetracking/genericview/detail.html',
    providers: [WorkerService],
    directives: [UniForm, UniSave]
})
export class GenericDetailview {
    @Input() viewconfig: IViewConfig;
    @ViewChild(UniForm) form:UniForm;
    private busy = true;
    private isDirty = false;
    private title:any;
    private subTitle:any;
    private ID:number;
    private current: any;
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
    }

    public ngOnInit() {
        if (this.viewconfig) {
            var tab = this.viewconfig.tab;
            this.tabService.addTab({ name: tab.label, url: tab.url, moduleID: this.viewconfig.moduleID, active: true });
            this.fields = this.viewconfig.formFields;
            this.updateTitle();        
        }        
    }

    public onReady(event) {
        this.loadCurrent(this.ID);
        // Auto open first secion:
        if (this.form && this.form.section(1)) {
            this.form.section(1).toggle();
        }
    }    

    public onShowList() {
        if (this.viewconfig && this.viewconfig.detail && this.viewconfig.detail.routeBackToList)
            this.router.navigateByUrl(this.viewconfig.detail.routeBackToList);
    }

    public onNavigate(direction = 'next')
    {
        this.busy = true;
        this.navigate(direction).then(()=>this.busy= false, ()=> this.busy = false);        
    }

    private navigate(direction = 'next'):Promise<any>
    {        
    
        var params = 'model=' + this.viewconfig.data.model;
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
        this.flagDirty();
    }

    public onCreateNew() {
        this.loadCurrent(0);
    }

    private flagDirty(dirty = true) {
        this.isDirty = dirty;
        this.enableAction(IAction.Save, true);
    }

    private loadCurrent(id:number, updateTitle = true) {
        if (id) {
            this.busy = true;
            this.workerService.getByID(id, this.viewconfig.data.route).subscribe((item:any) =>{
                this.ID = item.ID;
                if (item) {
                    if (this.viewconfig.data && this.viewconfig.data.check) {
                        this.viewconfig.data.check(item);
                    }
                    this.current = item;
                    this.enableAction(IAction.Delete);
                }
                if (updateTitle) {
                    this.updateTitle();
                }
                this.flagDirty(false);
                this.busy = false;                
            }, (err)=> {
                this.showErrMsg(err._body || err.statusText, labels.err_loading, true);
                this.busy = false; 
            });
        } else {
            if (this.viewconfig.data && this.viewconfig.data.factory) {
                this.current = this.viewconfig.data.factory();
            }
            this.ID = 0;            
            this.enableAction(IAction.Delete, false);
            this.busy = false;
            this.flagDirty(false);
            if (updateTitle) {
                this.updateTitle(this.viewconfig.labels.createNew);
            }
        }        
    }

    private enableAction(actionID:IAction, enable = true) {
        this.actions[actionID].disabled = !enable;
    }

    private updateTitle(fallbackTitle?:string) {
        this.title = this.ID && this.current ? this.current.Name : fallbackTitle || ''; 
        if (this.viewconfig) {
            this.subTitle = this.ID ? this.viewconfig.tab.label + ' ' + this.ID : this.viewconfig.labels.createNew;  
            this.tabService.addTab({ name: this.subTitle, url: this.viewconfig.tab.url + '/' + this.ID, moduleID: this.viewconfig.moduleID, active: true });
        }
    }

    private save(done) {
        this.busy = true;
        this.workerService.saveByID(this.current, this.viewconfig.data.route).subscribe((item)=>{
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

    private onDelete() {
        this.delete(()=>{});
    }

    private delete(done) {
        if (this.ID) {
            if (!confirm(labels.ask_delete)) { done(); return; }
            this.workerService.deleteByID(this.ID, this.viewconfig.data.route).subscribe((result)=>{
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
                    this.loadCurrent(0);
                });
                return;
            }
            this.loadCurrent(0);
        });        
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