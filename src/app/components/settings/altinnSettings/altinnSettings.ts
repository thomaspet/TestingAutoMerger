import { Component, OnInit } from '@angular/core';
import { IUniSaveAction } from '../../../../framework/save/save';
import { Altinn } from '../../../unientities';
import { Observable } from 'rxjs/Observable';
import { UniFieldLayout } from 'uniform-ng2/main';
import { ErrorService, IntegrationServerCaller, AltinnIntegrationService } from '../../../services/services';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
    selector: 'altinn-settings',
    templateUrl: 'app/components/settings/altinnSettings/altinnSettings.html'

})
export class AltinnSettings implements OnInit {
    private formConfig$: BehaviorSubject<any>= new BehaviorSubject({});
    private fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    private altinn$: BehaviorSubject<Altinn> = new BehaviorSubject(null);
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
        let altinn = this.altinn$.getValue();
        this._altinnService
            .getPassword()
            .flatMap((password: string) => password
                ? this.integrate.checkSystemLogin(
                    company.OrganizationNumber,
                    altinn.SystemID,
                    password,
                    altinn.Language)
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
                .flatMap((altinn: Altinn[]) =>
                    altinn.length ? Observable.of(altinn[0]) : this._altinnService.GetNewEntity([], 'altinn')),
            this._altinnService.getLayout()).subscribe((response: [Altinn, any]) => {
                let [altinn, layout] = response;
                this.altinn$.next(altinn);
                this.fields$.next(this.prepareLayout(layout.Fields, altinn));
            }, err => this.errorService.handle(err));
    }

    public saveAltinn(done) {
        let altinn = this.altinn$.getValue();
        altinn.Language = altinn.Language || '1044'; // Code 1044 == bokmål

        let saveObs = altinn.ID
            ? this._altinnService.Put(altinn.ID, altinn)
            : this._altinnService.Post(altinn);

        saveObs
            .flatMap((retrievedAltinn: Altinn) =>
                altinn.SystemPw
                    ? this._altinnService
                        .setPassword(altinn.SystemPw)
                        .map(x => {
                            retrievedAltinn.SystemPw = x;
                            return retrievedAltinn;
                        })
                    : Observable.of(retrievedAltinn)
            )
            .finally(() => this.saveactions[0].disabled = false)
            .subscribe((response: Altinn) => {
                this.altinn$.next(response);
                this.fields$.next(this.prepareLayout(this.fields$.getValue(), response));
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
