import {Component} from '@angular/core';
import {NgFor, NgIf, ControlGroup, Control, Validators} from '@angular/common';
import {UniHttp} from '../../../../framework/core/http/http';
import {OrderByPipe} from '../../../../framework/pipes/orderByPipe';
import {FilterInactivePipe} from '../../../../framework/pipes/filterInactivePipe';
import {UniTable, UniTableConfig, UniTableColumn, IContextMenuItem} from 'unitable-ng2/main';

@Component({
    selector: 'uni-users',
    pipes: [OrderByPipe, FilterInactivePipe],
    templateUrl: 'app/components/settings/users/users.html',
    directives: [NgFor, NgIf, UniTable]
})
export class Users {
    // New user Form 
    private newUserForm: ControlGroup;
    private errorMessage: string;
    
    // Users table
    private users: any[];
    private tableConfig: UniTableConfig;
    
    // Misc
    private busy: boolean = false;

    constructor(private http: UniHttp) {
        this.newUserForm = new ControlGroup({
            DisplayName: new Control('', Validators.required),
            Email: new Control('', this.isInvalidEmail)
        });
        
        this.errorMessage = '';
        this.users = [];
        
        this.setupUserTable();
        this.refreshUsers();
    }
    
    private setupUserTable() {
        const nameCol = new UniTableColumn('DisplayName', 'Navn');
        const emailCol = new UniTableColumn('Email', 'Epost');
        const statusCol = new UniTableColumn('StatusCode', 'Status')
            .setTemplate(rowModel => this.getStatusCodeText(rowModel['StatusCode']));
        
        const contextMenuItems: IContextMenuItem[] = [
            {
                label: 'Send ny invitasjon',
                action: rowModel => this.resendInvite(rowModel),
                disabled: (rowModel) => {
                    return (rowModel['StatusCode'] === 110001);
                }
            },
            {
                label: 'Fjern rettigheter',
                action: rowModel => this.revokeUser(rowModel),
                disabled: (rowModel) => {
                    return (rowModel['StatusCode'] !== 110001)
                }
            }
        ];
        
        this.tableConfig = new UniTableConfig(false, true, 25)
            .setColumns([nameCol, emailCol, statusCol])
            .setContextMenu(contextMenuItems);
    }
    
    private refreshUsers() {
        this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('users')
            .send()
            .map(response => response.json())
            .subscribe(response => this.users = response);
    }

    private sendInvite(user?) {
        this.errorMessage = '';
        let companyId = JSON.parse(localStorage.getItem('activeCompany')).id;
        let newUser = user || this.newUserForm.value;
        
        this.busy = true;

        this.http.asPOST()
            .usingBusinessDomain()
            .withEndPoint('user-verifications')
            .withBody({
                Email: newUser.Email,
                DisplayName: newUser.DisplayName,
                CompanyId: companyId
            })
            .send()
            .map(response => response.json())
            .subscribe(
                (data) => {
                    this.busy = false;
                    
                    // clear form
                    this.newUserForm = new ControlGroup({
                        DisplayName: new Control('', Validators.required),
                        Email: new Control('', this.isInvalidEmail)
                    });

                    this.refreshUsers();
                },
                (error) => {
                    this.busy = false;                        
                    this.errorMessage = 'Noe gikk galt med invitasjonen. Vennligst prøv igjen.';
                }
            );
    }

    private resendInvite(user) {
        // If user is inactive
        if (user.StatusID === 110002) {
            this.http.asPOST()
                .usingBusinessDomain()
                .withEndPoint('users/' + user.ID)
                .send({action: 'activate'})
                .map(response => response.json())
                .subscribe(response => this.refreshUsers());
        }
        // If user has not responded to invite
        else {
            this.sendInvite(user);
        }
    }

    private revokeUser(user) {
        this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint('users/' + user.ID)
            .send({ action: 'inactivate' })
            .map(response => response.json())
            .subscribe(response => this.refreshUsers());
    }
    
    private getStatusCodeText(statusCode: number): string {
        switch (statusCode) {
            case 110000: return 'Invitert';
            case 110001: return 'Aktiv';
            case 110002: return 'Inaktiv';
            default: return 'Ingen status';
        }
    }
    
    private isInvalidEmail(control: Control) {
        let testResult = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.test(control.value);
        
        if (!testResult) {
            return {'isInvalidEmail': true}
        }
        
        return null;
    }
}
