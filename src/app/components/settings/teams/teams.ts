﻿// tslint:disable:max-line-length
import {Component} from '@angular/core';
import {UniHttp} from '../../../../framework/core/http/http';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '../../../../framework/ui/unitable/index';
import {ErrorService, GuidService} from '../../../services/services';
import {Team, User, TeamPosition} from '../../../unientities';
import {UniModalService, ConfirmActions} from '../../../../framework/uni-modal';
import {Observable} from 'rxjs';
import {IUniSaveAction} from '../../../../framework/save/save';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';

@Component({
    selector: 'uni-teams',
    templateUrl: './teams.html'
})
export class Teams {
    public teams: Team[];
    public users: User[] = [];
    public positionTypes: TeamPosition[] = Teams.toArray('0=Ikke medlem,1=Medlem,10=Lesetilgang,11=Skrivetilgang,12=Godkjenning,20=Leder');
    private deletables: Array<TeamPosition> = [];
    public current: any = {};
    public hasUnsavedChanges: boolean = false;
    public busy: boolean = false;

    teamTableConfig: UniTableConfig;
    positionTableConfig: UniTableConfig;
    saveactions: IUniSaveAction[] = [];

    selectConfig = {
        template: (item) => item ? item.Name : '',
        searchable: false,
        hideDeleteButton: true
    };

    constructor(
        private http: UniHttp,
        private errorService: ErrorService,
        private guidService: GuidService,
        private modalService: UniModalService,
        private tabService: TabService,
    ) {
        this.tabService.addTab({
            name: 'Teams',
            url: '/settings/teams',
            moduleID: UniModules.SubSettings,
            active: true
       });
        this.initTableConfigs();
        this.updateSaveActions();
        this.getData();
    }

    private static toArray(value: string): Array<any> {
        const items = value.split(',');
        const result = [];
        items.forEach(item => {
            const parts = item.split('=');
            result.push( { ID: parseInt(parts[0], 10), Name: parts[1] } );
        });
        return result;
    }
    public updateSaveActions() {
        this.saveactions = [
            {
                label: 'Nytt team',
                action: (done) => this.onAddNew(done),
                main: !this.hasUnsavedChanges,
                disabled: false
            },
            {
                label: 'Lagre team',
                action: (done) => this.onSaveClicked(done),
                main: true,
                disabled: !this.hasUnsavedChanges
            },
            {
                label: 'Slett team',
                action: (done) => this.onDelete(done),
                main: false,
                disabled: !this.current
            }
        ];
    }

    public onTeamSelected(event) {
        if (!event) {
            return;
        }
        this.checkSave(true).then(ok => {
            if (ok) {
                this.setCurrent(event);
            }
        });
    }

    public onAddNew(done?) {
        this.checkSave(true).then(ok => {
            if (ok) {
                const t = new Team();
                t.Positions = [];
                this.setCurrent(t);
            }
        });
        if (done) {
            done('');
        }
    }

    public onSaveClicked(done) {
        this.busy = true;

        this.save().then(x => {
            this.busy = false;
            done('Team lagret');
        }).catch(reason => done(reason));
    }

    public setCurrent(t: Team) {
        if (t.Positions) {
            t.Positions.forEach( x => {
                x['User'] = this.users.find( u => u.ID === x.UserID );
                const pos = this.positionTypes.find( p => p.ID === x.Position  ) || { ID: 0, Name: 'Ikke satt' };
                x['PositionType'] = pos;
            });
        }

        this.deletables = [];
        this.current = t;
        this.hasUnsavedChanges = false;
        this.updateSaveActions();
    }

    public onPositionDeleted(event) {
        const row = event;
        const index = row['_originalIndex'];
        if (index >= 0) {
            const item = this.current.Positions[index];
            this.current.Positions.splice(index, 1);
            if (item && item.ID) {
                item.Deleted = true;
                this.hasUnsavedChanges = true;
                this.updateSaveActions();
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

    // Oppdaterer data ved endring i tabellen (men ikke lagrer, lagres i save())
    public onEditChange(event) {
        const rowIndex = event.originalIndex;
        const value = event.rowModel[event.field];

        if (!value) {
            return event.rowModel;
        }

        this.hasUnsavedChanges = true;
        this.updateSaveActions();

        if (this.current.Positions.length <= rowIndex) {
            this.current.Positions.push(this.newPosition());
        } else if (!this.current.Positions[rowIndex].Position) {
            this.current.Positions[rowIndex] = this.newPosition();
        }

        const localItem = <any>this.current.Positions[rowIndex];
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

    private checkSave(askBeforeSave: boolean): Promise<boolean> {
        return new Promise( (resolve, reject) => {
            setTimeout(() => {
                if (!this.hasUnsavedChanges) {
                    resolve(true);
                    return;
                }

                if (!askBeforeSave) {
                    this.save().then(
                        success => resolve(success),
                        failure => resolve(false)
                    );
                }

                this.modalService.confirm({
                    header: 'Lagre endringer?',
                    message: 'Ønsker du å lagre endringer før vi fortsetter?',
                    buttonLabels: {
                        accept: 'Lagre',
                        reject: 'Forkast',
                        cancel: 'Avbryt'
                    },
                    activateClickOutside: false
                }).onClose.subscribe(response => {
                    if (response === ConfirmActions.ACCEPT) {
                        this.save().then(saveResult => resolve(saveResult));
                    } else if (response === ConfirmActions.REJECT) {
                        resolve(true); // reject = discard changes
                    } else {
                        resolve(false);
                    }
                });
            });
        });
    }

    private save(): Promise<boolean> {
        return new Promise( (resolve, reject) => {
            const ht = this.current.ID ? this.http.asPUT() : this.http.asPOST();
            const route = this.current.ID ? 'teams/' + this.current.ID : 'teams';
            if (this.deletables) {
                this.deletables.forEach( item => this.current.Positions.push(item) );
            }
            this.current.Positions = this.current.Positions.filter((pos: any) => pos.ID || pos._createguid);
            ht.usingBusinessDomain()
                .withBody(this.current)
                .withEndPoint(route)
                .send().map(response => response.body)
                .subscribe(
                    result => {
                        this.hasUnsavedChanges = false;
                        this.updateSaveActions();
                        this.current = result;
                        this.getData();
                        resolve(true);
                    },
                    error => {
                        resolve(false);
                        this.errorService.handle(error);
                    }
                );
        });
    }

    public onDelete(done?) {
        if (!this.current || !this.current.ID) {
            return;
        }

        if (done) {
            done('');
        }

        this.modalService.confirm({
            header: 'Bekreft sletting',
            message: `Vennligst bekreft sletting av team ${this.current.Name || ''}`,
            buttonLabels: {
                accept: 'Slett',
                cancel: 'Avbryt'
            }
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                this.busy = true;
                this.http.usingBusinessDomain()
                    .asDELETE()
                    .withEndPoint(`teams/${this.current.ID}`)
                    .send()
                    .finally(() => this.busy = false)
                    .subscribe(
                        res => {
                            this.current = undefined;
                            this.getData();
                        },
                        error => this.errorService.handle(error)
                    );
            }
        });
    }

    public onFormChange(event) {
        this.flagUnsavedChanges();
    }

    private flagUnsavedChanges(reset: boolean = false) {
        this.hasUnsavedChanges = !reset;
        this.updateSaveActions();
    }

     private initTableConfigs() {
        this.teamTableConfig = new UniTableConfig('settings.teams.teams', false, true, 15)
            .setSearchable(true)
            .setColumns([
                new UniTableColumn('Name', 'Teamnavn')
                    .setTemplate(rowModel => rowModel['Name'])
            ]);

        this.positionTableConfig = new UniTableConfig('settings.teams.positions', true, true, 20)
            .setSearchable(false)
            .setColumns([
                new UniTableColumn('UserID', 'Bruker', UniTableColumnType.Lookup)
                    .setDisplayField('User.DisplayName')
                    .setOptions({
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
                    .setOptions({
                        itemTemplate: (item) => {
                            return item.ID + ' - ' + item.Name;
                        },
                        lookupFunction: x => this.lookupItems(this.positionTypes, x)
                    })

            ]).setChangeCallback( x => this.onEditChange(x) );
        this.positionTableConfig.deleteButton = true;
     }

     private lookupItems(list: Array<any>, txt: string, idField: string = 'ID', nameField: string = 'Name') {
        const lcaseText = txt.toLowerCase();
        const sublist = list.filter(item => {
            return (item[idField].toString() === txt || item[nameField].toLowerCase().indexOf(lcaseText) >= 0); } );
        return Observable.from([sublist]);
     }

    private getData() {
        Observable.forkJoin(this.requestTeams(), this.requestUsers()).subscribe((result) => {
            this.users = result[1];
            this.showTeams(result[0]);
        }, err => {
            this.errorService.handle(err);
        });
    }

    private requestTeams() {
        return this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint('teams?hateoas=false&orderby=name&expand=positions')
            .send()
            .map(response => response.body);
    }

    private requestUsers() {
        return this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint('users?hateoas=false&orderby=displayname')
            .send()
            .map(response => response.body);
    }

    private showTeams(list: Array<Team>) {
        this.teams = list;
        if (this.current && this.current.ID) {
            const match = list.find( x => x.ID === this.current.ID);
            if (match) {
                this.setCurrent(match);
            }
        } else if (this.teams.length) {
            this.setCurrent(this.teams[0]);
        } else {
            this.onAddNew();
        }
    }
}
