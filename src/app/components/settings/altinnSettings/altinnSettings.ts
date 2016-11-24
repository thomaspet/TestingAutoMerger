import {Component, OnInit} from '@angular/core';
import {AltinnIntegrationService} from '../../../services/services';
import {IUniSaveAction} from '../../../../framework/save/save';
import {Altinn} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {IntegrationServerCaller} from '../../../services/common/IntegrationServerCaller';
import {UniFieldLayout} from 'uniform-ng2/main';
import {ErrorService} from '../../../services/common/ErrorService';

@Component({
    selector: 'altinn-settings',
    templateUrl: 'app/components/settings/altinnSettings/altinnSettings.html'

})
export class AltinnSettings implements OnInit {
    private formConfig: UniFieldLayout[] = [];
    private altinn: Altinn;

    public saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre altinn innstillinger',
            action: this.saveAltinn.bind(this),
            main: true,
            disabled: false
        }
    ];
    
    public loginErr: string;

    constructor(
        private _altinnService: AltinnIntegrationService,
        private integrate: IntegrationServerCaller,
        private errorService: ErrorService
    ) {
           this.loginErr = '';
    }

    public ngOnInit() {
        this.getData();
    }

    public check()  {
        this.loginErr = '';
        if (this.altinn == undefined) {
             this.altinn = new Altinn();
        }

        let company = JSON.parse(localStorage.getItem('companySettings'));      
                
        
        this.integrate.checkSystemLogin(company.OrganizationNumber, this.altinn.SystemID, this.altinn.SystemPw, this.altinn.Language).subscribe((response) => {
            if (response !== true){                
                this.loginErr = 'Failed to log in with given credentials'; 
            } else {
                this.loginErr = 'Login ok';
            }
        }, (err) => {
            this.errorService.handle(err);
            this.loginErr = err;
        });

    }

    private getData() {
        Observable.forkJoin(
            this._altinnService.GetAll(''),
            this._altinnService.getLayout()).subscribe((response: any) => {
                let [altinn, layout] = response;
                if (altinn.length !== 0) {
                    this.altinn = altinn[0];
                    this.formConfig = layout.Fields;
                } else {
                    this._altinnService.GetNewEntity().subscribe((newAltinn: Altinn) => {
                        this.altinn = new Altinn();
                        this.formConfig = layout.Fields;
                    });
                }
            }, this.errorService.handle);
    }

    public saveAltinn(done) {
        this.altinn.Language = this.altinn.Language || '1044'; // Code 1044 == bokmål
        if (this.altinn.ID) {
            this._altinnService.Put(this.altinn.ID, this.altinn).subscribe((response: Altinn) => {
                this.altinn = response;
                this.check();
                done('altinninnstillinger lagret: ');
                this.saveactions[0].disabled = false;
            }, error => {
                this.errorService.handle(error);
                this.saveactions[0].disabled = false;
            });
        } else {
            this._altinnService.Post(this.altinn).subscribe((response: Altinn) => {
                this.altinn = response;
                this.check();
                done('altinninnstillinger lagret: ');
                this.saveactions[0].disabled = false;
            }, error => {
                this.errorService.handle(error);
                this.saveactions[0].disabled = false;
            });
        }
    }
}
