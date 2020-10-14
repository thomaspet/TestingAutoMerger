import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { IUniSaveAction } from '@uni-framework/save/save';
import { IDPortenAuthenticationService } from '@app/services/common/idPortenAuthService';
import { UniHttp } from '@uni-framework/core/http';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { AltinnIntegrationService } from '@app/services/services';

@Component({
    selector: 'skattemelding-view',
    templateUrl: './skattemelding-view.component.html',
    // styleUrls: ['./skattemelding-view.component.sass']
})
export class SkattemeldingViewComponent implements OnInit {

    public toolbarConfig: IToolbarConfig;

    actions: IUniSaveAction[] = [
        {
            label: 'Logg på ID-porten',
            action: (done) => this.CheckLoginStatus(done)
        },
        {
            label: 'Log ut av Id-porten',
            action: (done) => this.logoutIdPorten(done)
        },
    ];


    constructor(
        private idportenService: IDPortenAuthenticationService,
        private altinnIntegrationService: AltinnIntegrationService
    ) { }

    public ngOnInit() {
        this.toolbarConfig = {
            title: `Skattemelding`
        };
    }

    private logoutIdPorten(done) {
        this.idportenService.logout().catch(err => {
            console.log(err);
          }).finally(() => done('Logget ut'));
    }

    public CheckLoginStatus(done) {
        if (this.idportenService.isLoggedIn()) {
            console.log(this.idportenService.currentUser);
            console.log(this.idportenService.getAuthorizationHeaderValue());
            this.altinnIntegrationService.pingAltinn(this.idportenService.getAuthorizationHeaderValue())
                .subscribe(response => {
                    console.log(response);
                    done = true;
                });

        } else {
           this.idportenService.popupSignin();
        }
    }
}

