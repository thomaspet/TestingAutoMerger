import {Component} from 'angular2/core';
import {NgFor, NgIf} from 'angular2/common';
import {UniHttp} from '../../../../framework/core/http';
import {OrderByPipe} from '../../../../framework/pipes/orderByPipe';
import {FilterInactivePipe} from '../../../../framework/pipes/filterInactivePipe';

declare var jQuery;

@Component({
    selector: 'uni-users',
    pipes: [OrderByPipe, FilterInactivePipe],
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
    hideInactive: boolean = false;
    sortProperty: string;

    constructor(private http: UniHttp) {
        this.newUser = {};
        this.newUser.CompanyId = JSON.parse(localStorage.getItem('activeCompany')).id;
        this.getUserTableData();
    }

    //Gets the list of users
    getUserTableData() {
        this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint("users")
            .send()
            .subscribe(
                (users) => { this.users = users; },
                (error) => { /*Error handling*/ console.log(error); }
            );
    }

    //Invites new user
    inviteNewUser() {
        if (this.validateEmail(this.newUser.Email) && this.newUser.DisplayName !== '' && this.newUser.DisplayName !== undefined) {
            this.isPostUserActive = true;
            this.invalidInviteInfo = false;
            this.http
                .asPOST()
                .usingBusinessDomain()
                .withEndPoint('user-verifications')
                .withBody(this.newUser)
                .send()
                .subscribe(
                (data) => {
                    //Localhost as default for dev *TODO*
                    this.inviteLink = 'http://localhost:3000/#/confirm/' + data.VerificationCode;
                    this.newUser.DisplayName = '';
                    this.newUser.Email = '';
                    this.getUserTableData();
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

    //Creates a new user-verification object and code for the user, and sends out a new email
    resendInvite(user) {
        //If user is inactive
        if (user.StatusID === 19) {
            this.http
                .asPOST()
                .usingBusinessDomain()
                .withEndPoint('users/' + user.ID)
                .send({ action: 'activate' })
                .subscribe(
                    (data) => { this.getUserTableData(); console.log(data) },
                    (error) => { console.log(error) }
                )
        }
        //If user has not responded to invite
        else {
            this.newUser.DisplayName = user.DisplayName;
            this.newUser.Email = user.Email;
            this.inviteNewUser();
        }
    }

    //Revokes the rights of the user
    revokeInvite(user) {
        console.log(user.DisplayName + '\'s rights have been revoked..');

        this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint('users/' + user.ID)
            .send({ action: 'inactivate' })
            .subscribe(
                (data) => { this.getUserTableData() },
                (error) => { console.log(error) }
            )
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
}