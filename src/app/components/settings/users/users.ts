import {Component, Pipe} from 'angular2/core';
import {NgFor, NgIf} from 'angular2/common';
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
    directives: [NgFor, NgIf]
})

export class Users {
    newUser;
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

                    this.users = users;
                },
                (error) => {
                    //Error handling
                    console.log(error);
                }
            );
    }

    //Invites new user
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

    //Sends out a new invite email to the user 
    resendInvite(user) {
        this.newUser.DisplayName = user.DisplayName;
        this.newUser.Email = user.Email;
        this.inviteNewUser();
    }

    //Revokes the rights of the user
    revokeInvite(user) {
        var revoke = confirm('Er du sikker på at du ønsker å fjerne rettighetene til ' + user.DisplayName + '?');

        if (revoke) {
            console.log(user.DisplayName + '\'s rights have been revoked..');
        }
    }

    //Regex to check valididation of email
    validateEmail(email) {
        return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
    }

    //Sets the property of which the list is sorted by
    sortList(sortValue) {
        if (sortValue === this.sortProperty) {
            var tempstring = '-' + this.sortProperty;
            this.sortProperty = tempstring;
        } else {
            this.sortProperty = sortValue;
        }
    }

    //DUMMY
    statusDummy() {
        return [
            { Name: 'Invitert', ID: 17 },
            { Name: 'Aktiv', ID: 18 },
            { Name: 'Inaktiv', ID: 19 },
            { Name: 'Trukket godkjenning', ID: 20 }
        ]
    }

    //DUMMY
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