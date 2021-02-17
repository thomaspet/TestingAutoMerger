import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { IUniSaveAction } from '@uni-framework/save/save';
import { IDPortenAuthenticationService } from '@app/services/common/idPortenAuthService';
import { Observable} from 'rxjs';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { AltinnIntegrationService, ErrorService } from '@app/services/services';
import { ToastService, ToastTime, ToastType } from '@uni-framework/uniToast/toastService';

@Component({
    selector: 'skattemelding-view',
    templateUrl: './skattemelding-view.component.html',
    // styleUrls: ['./skattemelding-view.component.sass']
})
export class SkattemeldingViewComponent implements OnInit {
    public busy: boolean;
    public loginErr: string = '';
    public toolbarConfig: IToolbarConfig;

    actions: IUniSaveAction[] = [
        {
            label: 'Sjekk ID-porten',
            action: this.CheckIdPortenStatus.bind(this)
        },
        {
            label: 'Ping Skatteetaten',
            action: this.CheckLoginStatus.bind(this)
        },
    ];


    constructor(
        private idportenService: IDPortenAuthenticationService,
        private altinnIntegrationService: AltinnIntegrationService,
        private toast: ToastService,
        private errorService: ErrorService,
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

    public CheckIdPortenStatus(done) {
        this.busy = true;
        this.idportenService.isLoggedIn$()
        .finally(()  => {
            this.busy = false;
        })
        .subscribe((res) => {
            if (res === true)  {
                this.loginErr = 'Testen kommuniserte med AltInn/Id Porten ';
                this.toast.addToast('Sjekk', ToastType.good, ToastTime.medium, this.loginErr);

            } else {
                this.loginErr = 'Test av kommunikasjon med AltInn/ID Porten feilet';
                 this.toast.addToast('Sjekk', ToastType.bad, ToastTime.medium, this.loginErr);
            }
            done(' ');
            this.busy = false;
         }, err => { this.errorService.handle(err); this.loginErr = 'Test av kommunikasjon feilet'; });


    }

    public CheckLoginStatus(done) {
        if (this.idportenService.isLoggedIn()) {
            this.altinnIntegrationService.pingAltinn(this.idportenService.getAuthorizationHeaderValue())
                .subscribe(response => {
                    if (response) {
                        done ('Ping ok');
                    } else {
                        done ('Ingen ping');
                    }
                });

        } else {
           this.idportenService.popupSignin();
        }
    }
}

