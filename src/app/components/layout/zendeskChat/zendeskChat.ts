import { Component } from '@angular/core';
import {AuthService} from '@app/authService';

@Component({
    selector: 'zendesk-chat',
    template: ``,
})
export class ZenDeskChat {

    constructor(private authService: AuthService) {
        const script = document.createElement('script');
        script.type = 'application/javascript';
        script.id = 'ze-snippet';
        script.src = 'https://static.zdassets.com/ekr/snippet.js?key=26dce926-7676-4403-bf9c-5abe6748f65b';

        document.getElementsByTagName('head')[0].appendChild(script);

        if (this.authService.currentUser.License.CustomerInfo.HasExternalAccountant) {
            window.zESettings = {
                webWidget: {
                    chat: {
                        departments: {
                            enabled: ['SystemstøtteDNB'],
                        },
                    },
                },
            };
        }
    }
}
