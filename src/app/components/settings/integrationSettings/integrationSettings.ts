import { Component } from '@angular/core';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';

@Component({
    selector: 'integration-settings',
    templateUrl: './integrationSettings.html',
})
export class IntegrationSettings {
    public showWebhooksSection: boolean = true;
    public showIntegrationSection: boolean  = true;

    constructor (tabService: TabService) {
        tabService.addTab({
            name: 'Integrasjoner',
            url: '/settings/webhooks',
            moduleID: UniModules.SubSettings,
            active: true
       });
    }
}
