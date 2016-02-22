import {Component, ViewChild, Pipe} from 'angular2/core';
import {NgFor, NgIf} from 'angular2/common';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';
import {UniHttpService} from '../../../../framework/data/uniHttpService';

declare var jQuery;

@Pipe({
    name: 'sort'
})

export class OrderByPipe {
    transform(value, property) {
        return value.sort(this.dynamicSort(property[0]));
        
    }

    dynamicSort(property) {
        var sortOrder = 1;

        if (property !== undefined) {
            if (property.charAt(0) === '-') {
                sortOrder = -1;
                property = property.substr(1);
            }
        }
        

        return function (a, b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;  
        }
    }
}

@Component({
    selector: 'uni-users',
    pipes: [OrderByPipe],
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
    sortProperty: string;

    constructor(private http: UniHttpService) {
        this.newUser = {};
        this.newUser.CompanyId = JSON.parse(localStorage.getItem('activeCompany')).id;
        this.setUserTableData();
    }

    createUserTable() {

        var nameCol = new UniTableColumn('DisplayName', 'Navn', 'string').setEditable(true);
        var emailCol = new UniTableColumn('Email', 'Epost', 'string');
        var statusCol = new UniTableColumn('Status', 'Status', 'string');
        //var roleCol = new UniTableColumn('Role', 'Rolle', 'string');
        var self = this;
           
        this.usersTable = new UniTableBuilder(this.users, false)
            .setPageSize(2)
            .setPageable(false)
            .addColumns(nameCol, emailCol, statusCol)
            .addCommands(
            {
                name: 'Resend',
                click: function (e) {
                    e.preventDefault();
                    var tr = jQuery(e.target).closest("tr");
                    self.resendInvite(this.dataItem(tr));
                },
                className: 'btn_resend'
            },
            {
                name: 'Revoke',
                click: function (e) {
                    e.preventDefault();
                    var tr = jQuery(e.target).closest("tr");
                    self.revokeInvite(this.dataItem(tr));
                },
                className: 'btn_revoke'
            }
            )
            .setFilterable(false)
    }

    //This needs to merge data from 3 resources (users, usersstatus, roles)
    //Need for DS? Uses data that is not used any other place?
    setUserTableData() {

        var status = this.statusDummy();
        this.http.get({ resource: 'users' })
            .subscribe(
                (users) => {
                    

                    users.forEach((user) => {
                        user.Status = status[status.map((st) => { return st.ID }).indexOf(user.StatusID + (Math.floor(Math.random()* 3)))].Name;
                    })

                    //if (this.usersTable) {
                    //    this.userTable.refresh(users);
                    //} else {
                    //    this.createUserTable();
                    //}

                    this.users = users;
                },
                (error) => {
                    //Error handling
                    console.log(error);
                }
            );
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

    resendInvite(user) {
        this.newUser.DisplayName = user.DisplayName;
        this.newUser.Email = user.Email;
        this.inviteNewUser();
    }

    /*
        Should cancel current active user-verification invite..
        Should set status to Invoked/Removed/Invactive?
     */
    revokeInvite(user) {
        var revoke = confirm('Er du sikker på at du ønsker å fjerne rettighetene til ' + user.DisplayName + '?');

        if (revoke) {
            console.log(user.DisplayName + '\'s rights have been revoked..');
        }
    }

    validateEmail(email) {
        return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
    }

    sortList(sortValue) {
        if (sortValue === this.sortProperty) {
            var tempstring = '-' + this.sortProperty;
            this.sortProperty = tempstring;
        } else {
            this.sortProperty = sortValue;
        }
    }

    statusDummy() {
        return [
            { Name: 'Invitert', ID: 17 },
            { Name: 'Aktiv', ID: 18 },
            { Name: 'Inaktiv', ID: 19 },
            { Name: 'Trukket godkjenning', ID: 20 }
        ]
    }

    roleDummy() {
        return [
            { Name: 'Admin' },
            { Name: 'Bruker(#845)' },
            { Name: 'Bruker(#323)' },
            { Name: 'Bruker(#523)' },
            { Name: 'Generell bruker' },
            { Name: 'Midlertidig' },
        ]
    }
}