import {Component} from '@angular/core';

@Component({
    selector: 'integration-settings',
    templateUrl: './integrationSettings.html',
})
export class IntegrationSettings {
    public showWebhooksSection: boolean = true;
    public showIntegrationSection: boolean  = true;
    constructor() { }
}
