import {Component} from 'angular2/core';

import {AccountDetails} from './accountDetails/accountDetails';

@Component({
    selector: 'account-settings',
    templateUrl: 'app/components/settings/accountSettings/accountSettings.html',
    directives: [AccountDetails]
})

export class AccountSettings {
    constructor() { }
}