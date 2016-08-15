import {Component, OnInit, ViewChild} from '@angular/core';
import {AltinnService} from '../../../services/services';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {Altinn} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {IntegrationServerCaller} from '../../../services/common/IntegrationServerCaller';
import {UniForm, UniFieldLayout} from '../../../../framework/uniform/index'

@Component({
    selector: 'altinn-settings',
    templateUrl: 'app/components/settings/altinnSettings/altinnSettings.html',
    providers: [AltinnService, IntegrationServerCaller],
    directives: [UniForm, UniSave]
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

    constructor(private _altinnService: AltinnService, private integrate: IntegrationServerCaller) {
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
            });
    }

    public saveAltinn(done) {
        this.saveactions[0].disabled = true;
        done('lagrer altinninnstillinger: ');
        if (this.altinn.ID) {
            this._altinnService.Put(this.altinn.ID, this.altinn).subscribe((response: Altinn) => {
                this.altinn = response;
                this.check();
                done('altinninnstillinger lagret: ');
                this.saveactions[0].disabled = false;
            }, error => {
                this.log('problemer med å lagre Altinninnstillinger', error);
                this.saveactions[0].disabled = false;
            });
        } else {
            this._altinnService.Post(this.altinn).subscribe((response: Altinn) => {
                this.altinn = response;
                this.check();
                done('altinninnstillinger lagret: ');
                this.saveactions[0].disabled = false;
            }, error => {
                this.log('problemer med å lagre Altinninnstillinger', error);
                this.saveactions[0].disabled = false;
            });
        }
    }

    public log(title: string, err) {
        if (!title) {
            title = '';
        }
        if (err._body) {
            alert(title + ' ' + err._body);
        } else {
            alert(title + ' ' + JSON.stringify(err));
        }

    }
}
