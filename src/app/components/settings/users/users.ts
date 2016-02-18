import {Component, ViewChild} from 'angular2/core';
import {NgFor, NgIf} from 'angular2/common';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';
import {UniHttpService} from '../../../../framework/data/uniHttpService';

declare var jQuery;

@Component({
    selector: 'uni-users',
    templateUrl: 'app/components/settings/users/users.html',
    directives: [NgFor, NgIf, UniTable]
})

export class Users {
    @ViewChild(UniTable) userTable: UniTable;
    newUser;
    usersTable: UniTableBuilder;
    users: Array<any>;
    inviteLink: string;
    errorMessage: string;
    invalidInviteInfo: boolean = false;
    isPostUserActive: boolean = false;

    constructor(private http: UniHttpService) {
        this.newUser = {};
        this.newUser.CompanyId = JSON.parse(localStorage.getItem('activeCompany')).id;
        this.setUserTableData();
    }

    createUserTable() {

        var nameCol = new UniTableColumn('DisplayName', 'Navn', 'string');
        var emailCol = new UniTableColumn('Email', 'Epost', 'string');
        var statusCol = new UniTableColumn('Status', 'Status', 'string');
        var roleCol = new UniTableColumn('Role', 'Rolle', 'string');
        var commandCol = new UniTableColumn('Resend', '', 'string')
            .setCommand({ command: "destroy" });
        var revokeCol = new UniTableColumn('Revoke', '', 'string');
        
        this.usersTable = new UniTableBuilder(this.users, false)
            .setPageSize(2)
            .setPageable(false)
            .addColumns(nameCol, emailCol, statusCol, roleCol, revokeCol)
            .setFilterable(false)
            .setSelectCallback(this.testCallback);
    }

    //This needs to merge data from 3 resources (users, usersstatus, roles)
    //Need for DS? Uses data that is not used any other place?
    setUserTableData() {

        var status = this.statusDummy();
        this.http.get({ resource: 'users' })
            .subscribe(
                (data) => {
                    this.users = data;

                    data.forEach((user) => {
                        user.Status = status[status.map((st) => { return st.ID }).indexOf(user.StatusID)].Name;
                    })

                    if (this.usersTable) {
                        this.userTable.refresh(data);
                    } else {
                        this.createUserTable();
                    }
                },
                (error) => {
                    //Error handling
                    console.log(error);
                }
            );
    }

    testCallback(momo) {
        console.log(momo);
    }

    inviteNewUser() {
        if (this.validateEmail(this.newUser.Email) && this.newUser.DisplayName !== '' && this.newUser.DisplayName !== undefined) {
            this.isPostUserActive = true;
            this.invalidInviteInfo = false;
            this.http.post({ resource: 'user-verifications', body: this.newUser })
                .subscribe(
                (data) => {
                    //Localhost as default for dev *TODO*
                    this.inviteLink = 'http://localhost:3000/#/confirm/' + data.VerificationCode;
                    this.newUser.DisplayName = '';
                    this.newUser.Email = '';
                    this.setUserTableData();
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
            this.errorMessage = 'Vennligst oppgi et navn og en gyldig epostaddresse.';
        }
    }

    validateEmail(email) {
        return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
    }

    statusDummy() {
        return [
            {
                Name: 'Invited',
                ID: 17
            },
            {
                Name: 'Active',
                ID: 18
            },
            {
                Name: 'Inactive',
                ID: 19
            },
            {
                Name: 'Revoked',
                ID: 20
            }
        ]
    }
}