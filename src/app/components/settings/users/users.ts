import {Component} from 'angular2/core';
import {NgFor, NgIf} from 'angular2/common';
import {UniTable, UniTableConfig} from '../../../../framework/uniTable';
import {UniHttpService, IUniHttpRequest} from '../../../../framework/data/uniHttpService';

declare var jQuery;

@Component({
    selector: 'uni-users',
    templateUrl: 'app/components/settings/users/users.html',
    directives: [NgFor, NgIf, UniTable]
})

export class Users {

    newUser;
    baseUrl: string = 'http://localhost:3000/#/confirm/';
    users: Array<any> = [];
    usersConfig: UniTableConfig;
    inviteLink: string;
    errorMessage: string;
    invalidInviteInfo: boolean = false;
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
        if (this.validateEmail(this.newUser.Email) && this.newUser.DisplayName !== '' && this.newUser.DisplayName !== undefined) {
            this.isPostUserActive = true;
            this.http.post({ resource: 'user-verifications', body: this.newUser })
                .subscribe(
                (data) => {
                    this.inviteLink = this.baseUrl + data.VerificationCode;
                    this.newUser.DisplayName = '';
                    this.newUser.Email = '';
                    this.createUserTable();
                    this.isPostUserActive = false;
                    jQuery('.users_invite_link').slideDown(500);
                },
                (error) => {
                    console.log(error);
                    this.isPostUserActive = false;
                }
                )
        } else {
            this.invalidInviteInfo = true;
            this.errorMessage = 'Vennligst oppgi en navn og en gyldig epostaddresse.';
        }
    }

    validateEmail(email) {
        return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
    }
}