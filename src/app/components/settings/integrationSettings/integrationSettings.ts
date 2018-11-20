import { Component, ViewChild } from '@angular/core';
import { EventPlans } from '@app/components/settings/eventPlans/event-plans';
import { Observable } from 'rxjs';

@Component({
    selector: 'integration-settings',
    templateUrl: './integrationSettings.html',
})
export class IntegrationSettings {
    public showWebhooksSection: boolean = true;
    public showIntegrationSection: boolean  = true;
    @ViewChild('eventplans') eventplans: EventPlans;
    constructor() { }
    public canDeactivate(): boolean | Observable<boolean> {
        return this.eventplans.canDeactivate();
    }
}
