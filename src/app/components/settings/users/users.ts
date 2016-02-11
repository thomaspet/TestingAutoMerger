import {Component} from 'angular2/core';
import {NgFor, NgIf} from 'angular2/common';
import {UniTable, UniTableConfig} from '../../../../framework/uniTable';
import {UniHttpService, UniHttpRequest} from '../../../../framework/data/uniHttpService';
declare var jQuery;

@Component({
    selector: 'uni-users',
    templateUrl: 'app/components/settings/users/users.html',
    directives: [NgFor, NgIf, UniTable]
})

export class Users {

    newUser;
    users: Array<any> = [];
    usersConfig: UniTableConfig;
    inviteLink: string;
    inviteSuccess: boolean = false;
    isPostUserActive: boolean = false;

    constructor(private http: UniHttpService) {
        this.newUser = {};
        this.newUser.CompanyId = JSON.parse(localStorage.getItem('activeCompany')).id;
        this.createUserTable();
    }

    createUserTable() {
        this.usersConfig = new UniTableConfig('http://devapi.unieconomy.no/api/biz/users', false, false)

            .setDsModel({
                id: 'ID',
                fields: {
                    DisplayName: { type: 'text' },
                    Email: { type: 'text' }
                }
            })

            .setColumns([
                { field: 'DisplayName', title: 'Navn' },
                { field: 'Email', title: 'Epost' },
                { field: 'Username', title: 'Brukernavn' },
                { field: 'Status', title: 'Status' },
                { field: 'Role', title: 'Rolle' }
            ]);

    }

    inviteNewUser() {
        this.isPostUserActive = true;
        this.http.post({ resource: 'user-verifications', body: this.newUser })
            .subscribe(
            (data) => {
                console.log(data);
                this.inviteLink = 'http://localhost:3000/#/confirm/' + data.VerificationCode;
                this.inviteSuccesful();
                this.newUser.DisplayName = '';
                this.newUser.Email = '';
                this.createUserTable();
                this.isPostUserActive = false;
            },
            (error) => {
                console.log(error);
                this.isPostUserActive = false;
            }
            )
    }

    inviteSuccesful() {
        this.inviteSuccess = true;
    }
}