import { Component, OnInit } from '@angular/core';
import { IUniSaveAction } from '../../../../framework/save/save';
import { Altinn } from '../../../unientities';
import { Observable } from 'rxjs/Observable';
import { UniFieldLayout } from 'uniform-ng2/main';
import { ErrorService, IntegrationServerCaller, AltinnIntegrationService } from '../../../services/services';

@Component({
    selector: 'altinn-settings',
    templateUrl: './altinnSettings.html'

})
export class AltinnSettings implements OnInit {
    private formConfig: UniFieldLayout[] = [];
    private altinn: Altinn;
    private busy: boolean;

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

    public check() {

        this.loginErr = '';
        let company = JSON.parse(localStorage.getItem('companySettings'));

        this.busy = true;
        this._altinnService
            .getPassword()
            .switchMap((password: string) => password
                ? this.integrate.checkSystemLogin(
                    company.OrganizationNumber,
                    this.altinn.SystemID,
                    password,
                    this.altinn.Language)
                    .map(result => result
                        ? 'Login ok'
                        : 'Failed to log in with given credentials')
                : Observable.of('Missing password'))
            .finally(() => this.busy = false)
            .subscribe((loginError: string) => {
                this.loginErr = loginError;
            }
            , (err) => {
                this.errorService.handle(err);
                this.loginErr = err;
            });
    }

    private getData() {
        Observable.forkJoin(
            this._altinnService
                .GetAll('')
                .switchMap((altinn: Altinn[]) =>
                    altinn.length ? Observable.of(altinn[0]) : this._altinnService.GetNewEntity([], 'altinn')),
            this._altinnService.getLayout()).subscribe((response: [Altinn, any]) => {
                let [altinn, layout] = response;
                this.altinn = altinn;
                this.formConfig = this.prepareLayout(layout.Fields, altinn);
            }, err => this.errorService.handle(err));
    }

    public saveAltinn(done) {
        this.altinn.Language = this.altinn.Language || '1044'; // Code 1044 == bokmål

        let saveObs = this.altinn.ID
            ? this._altinnService.Put(this.altinn.ID, this.altinn)
            : this._altinnService.Post(this.altinn);

        saveObs
            .switchMap((altinn: Altinn) =>
                this.altinn.SystemPw
                    ? this._altinnService
                        .setPassword(this.altinn.SystemPw)
                        .map(x => {
                            altinn.SystemPw = x;
                            return altinn;
                        })
                    : Observable.of(altinn)
            )
            .finally(() => this.saveactions[0].disabled = false)
            .subscribe((response: Altinn) => {
                this.altinn = response;
                this.formConfig = this.prepareLayout(this.formConfig, response);
                this.check();
                done('altinninnstillinger lagret: ');
            }, error => {
                this.errorService.handle(error);
                done('feil ved lagring: ');
            });
    }

    private prepareLayout(fields: UniFieldLayout[], altinn: Altinn): UniFieldLayout[] {
        let field = fields.find(x => x.Property === 'SystemPw');
        field.Placeholder = altinn['HasPasswordValue'] ? '********' : '';
        return fields;
    }
}
