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
    success: boolean = false;
    users: Array<any> = [];
    usersConfig: UniTableConfig;

    constructor(private http: UniHttpService) {
        this.newUser = {};
        this.newUser.CompanyId = JSON.parse(localStorage.getItem('activeCompany')).id;
        this.createUserTable();
    }

    createUserTable() {
        this.usersConfig = new UniTableConfig('http://devapi.unieconomy.no/api/biz/users', false, false)

            .setColumns([
                { field: 'Name', title: 'Navn' },
                { field: 'Email', title: 'Epost' },
                { field: 'Username', title: 'Brukernavn' },
                { field: 'Status', title: 'Status' },
                { field: 'Role', title: 'Rolle' }
            ]);
    }

    inviteNewUser() {
        this.http.get({ resource: '/users'})
            .subscribe(
            (data) => {
                console.log(data);
                this.createUserTable();
            },
            error => console.log(error)
        )
    }
}