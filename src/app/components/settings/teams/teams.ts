// tslint:disable:max-line-length
import {Component, ViewChild, ViewChildren, QueryList} from '@angular/core';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {UniHttp} from '../../../../framework/core/http/http';
import {UniField, FieldType} from 'uniform-ng2/main';
import {UniTableConfig, UniTableColumn, UniTableColumnType, UniTable} from 'unitable-ng2/main';
import {ErrorService, UserService, GuidService} from '../../../services/services';
import {Team, User, TeamPosition} from '../../../unientities';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniConfirmModal, ConfirmActions} from '../../../../framework/modals/confirm';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'uni-teams',
    templateUrl: './teams.html'
})
export class Teams {
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;
    @ViewChildren(UniTable) private uniTables: QueryList<UniTable>;
    
    public teams: Team[];
    public users: User[] = [];
    public positionTypes: TeamPosition[] = Teams.toArray('0=Ikke medlem,1=Medlem,10=Lesetilgang,11=Skrivetilgang,12=Godkjenning,20=Leder');
    private deletables: Array<TeamPosition> = [];
    public current: Team;
    public hasUnsavedChanges: boolean = false;
    public busy: boolean = false;

    public teamTableConfig: UniTableConfig;
    public positionTableConfig: UniTableConfig;

    public formModel$: BehaviorSubject<Team> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniField[]> = new BehaviorSubject([]);
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({});

    constructor(
        private http: UniHttp,
        private tabService: TabService,
        private userService: UserService,
        private errorService: ErrorService,
        private guidService: GuidService
    ) {
        this.initTableConfigs();
        this.initFormConfigs();
        this.requestTeams();
        this.requestUsers();
        this.onAddNew();
    }

    public onTeamSelected(event) {

        if (!(event && event.rowModel)) { return; }
        this.checkSave(true).then( ok => { if (ok) { 
            this.setCurrent( event.rowModel );
        }});
    }

    public onAddNew() {
        this.checkSave(true).then( ok => { if (ok) { 
            var t = new Team();
            t.Positions = [];
            this.setCurrent(t);
        }});
    }

    public onSaveClicked() {
        setTimeout( () => { // Allow the annoying editors to update
            this.busy = true;
            this.Save().then( x => this.busy = false );
        }, 50);
    }

    private setCurrent(t: Team) {
        if (t.Positions) {
            t.Positions.forEach( x => {
                x['User'] = this.users.find( u => u.ID === x.UserID );
                let pos = this.positionTypes.find( p => p.ID === x.Position  ) || { ID: 0, Name: 'Dont know!' };
                x['PositionType'] = pos;
            });
        }
        if (this.uniTables) { 
            this.uniTables.last.blur(); 
        }
        this.deletables = [];
        this.current = t;
        this.formModel$.next(this.current);
        this.hasUnsavedChanges = false;
    }

    public onPositionDeleted(event) {
        var row = event.rowModel;
        var index = row['_originalIndex'];
        if (index >= 0) {
            var item = this.current.Positions[index];
            this.current.Positions.splice(index, 1);
            if (item && item.ID) {                
                item.Deleted = true;
                this.hasUnsavedChanges = true;
                this.deletables.push(item);
            }
        }
    }

    private newPosition(): TeamPosition {
        return <any>{ 
                Position: 1,
                PositionType: this.positionTypes[1],
                _createguid: this.guidService.guid()
            };
    }

    private onEditChange(event) {
        var rowIndex = event.originalIndex;
        var value = event.rowModel[event.field];

        if (!value) {
            return event.rowModel;
        }

        this.hasUnsavedChanges = true;
        
        // New row ?
        if (rowIndex >= this.current.Positions.length) {
            this.current.Positions.push(this.newPosition());
        }

        let localItem = <any>this.current.Positions[rowIndex];
        switch (event.field) {
            case 'UserID':
                this.current.Positions[rowIndex].UserID = value.ID;
                this.current.Positions[rowIndex]['User'] = value;
                break;
            case 'Position':
                this.current.Positions[rowIndex].Position = value.ID;
                this.current.Positions[rowIndex]['PositionType'] = value;
                break;
        }                
        localItem.originalIndex = rowIndex;
        localItem._originalIndex = rowIndex;
        return localItem;
    } 

    public canDeactivate() {
        return new Promise((resolve, reject) => {
            this.checkSave(true).then( ok => resolve(ok) );
        });
    }    

    private checkSave(ask: boolean): Promise<boolean> {        
        return new Promise( (resolve, reject) => {

            // todo: remove timer when uniform has solutions for completing current edit
            setTimeout(() => { 

                if (!this.hasUnsavedChanges) {
                    resolve(true);
                    return;
                }
                if (ask) {                
                    this.confirmModal.confirm('Lagre endringer før du fortsetter?', 'Lagre endringer?', true)
                    .then( (userChoice: ConfirmActions) => {
                        switch (userChoice) {
                            case ConfirmActions.ACCEPT:
                                this.Save().then( saveResult => resolve(saveResult) );
                                break;

                            case ConfirmActions.CANCEL:
                                resolve(false);
                                break;

                            default:
                                resolve(true);
                                break;                        
                        }
                    });
                } else {
                    this.Save().then( x => resolve(x) );
                }

            }, 50);
        });
    }

    private Save(): Promise<boolean> {
        return new Promise( (resolve, reject) => {
            var ht = this.current.ID ? this.http.asPUT() : this.http.asPOST();
            var route = this.current.ID ? 'teams/' + this.current.ID : 'teams';
            if (this.deletables) {
                this.deletables.forEach( item => this.current.Positions.push(item) );
            }
            ht.usingBusinessDomain()
                .withBody(this.current)
                .withEndPoint(route)
                .send().map(response => response.json())
                .subscribe(
                    result => {
                        this.hasUnsavedChanges = false;
                        this.current = result;
                        this.requestTeams();
                        resolve(true);
                    },
                    error => {
                        resolve(false);
                        this.errorService.handle(error);
                    }
                );
        });
    }

    public onDelete(event) {
        if (this.current && this.current.ID) {
            this.confirmModal.confirm(`Ønsker du å slette team: '${this.current.Name}' `, 'Slette teamet', false).then(
                (x: ConfirmActions) => {
                    if (x !== ConfirmActions.ACCEPT) { return; }
                    this.busy = true;
                    this.http.usingBusinessDomain()
                    .asDELETE()
                    .withEndPoint(`teams/${this.current.ID}`)                    
                    .send().finally( () => this.busy = false )
                    .subscribe( () => {
                        this.current = undefined;
                        this.requestTeams();
                    }, error => this.errorService.handle(error) );
                });            
        }
    }

    public onFormChange(event) {
        this.hasUnsavedChanges = true;
    }

     private initTableConfigs() {

        this.teamTableConfig = new UniTableConfig(false, true, 15)
            .setSearchable(true)
            .setColumns([
                new UniTableColumn('Name', 'Teamnavn')
                    .setTemplate(rowModel => rowModel['Name'])
            ]);

        this.positionTableConfig = new UniTableConfig(true, true, 20)
            .setSearchable(false)
            .setColumns([
                new UniTableColumn('UserID', 'Bruker', UniTableColumnType.Lookup)
                    .setDisplayField('User.DisplayName')
                    .setEditorOptions({
                        itemTemplate: (item) => {
                            return item.ID + ' - ' + item.DisplayName;
                        },
                        lookupFunction: x => this.lookupItems(this.users, x, 'ID', 'DisplayName')
                }),
                
                new UniTableColumn('Position', 'Ansvar', UniTableColumnType.Lookup)
                    .setDisplayField('PositionType.Name')
                    .setConditionalCls( row => {
                        return row.Deleted ? 'deleted-row' : '';
                    })
                    .setEditorOptions({     
                        itemTemplate: (item) => {
                            return item.ID + ' - ' + item.Name;
                        },                
                        lookupFunction: x => this.lookupItems(this.positionTypes, x)  
                    })
                
            ])
            .setChangeCallback( x => this.onEditChange(x) );
        this.positionTableConfig.deleteButton = true;
     }

     private lookupItems(list: Array<any>, txt: string, idField: string = 'ID', nameField: string = 'Name') {
        var lcaseText = txt.toLowerCase();
        var sublist = list.filter(item => {
            return (item[idField].toString() === txt || item[nameField].toLowerCase().indexOf(lcaseText) >= 0); } );
        return Observable.from([sublist]);
     }

    private initFormConfigs() {
        this.formConfig$.next({});
        this.formFields$.next([
            <any> {
                EntityType: 'Team',
                Property: 'Name',
                FieldType: FieldType.TEXT,
                Label: 'Teamnavn',
                Classes: ['half-width'],
                Section: 0
            }
         ]);
      }     

    private requestTeams() {
        this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint('teams?hateoas=false&orderby=name&expand=positions')
            .send().map(response => response.json())
            .subscribe( 
                result => this.showTeams(result),
                error => this.errorService.handle(error)
            );        
    }

    private requestUsers() {
        this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint('users?hateoas=false&orderby=displayname')
            .send().map(response => response.json())
            .subscribe( 
                result => this.users = result,
                error => this.errorService.handle(error)
            );             
    }

    private showTeams(list: Array<Team>) {        
        this.teams = list;
        if (this.current && this.current.ID) {
            let match = list.find( x => x.ID === this.current.ID);
            if (match) {
                this.setCurrent(match);
            }
        } else {
            this.onAddNew();
        }
    }

    private static toArray(value: string): Array<any> {
        var items = value.split(',');
        var result = [];
        items.forEach(item => {
            let parts = item.split('=');
            result.push( { ID: parseInt(parts[0]), Name: parts[1] } );
        });
        return result;
    }
}
