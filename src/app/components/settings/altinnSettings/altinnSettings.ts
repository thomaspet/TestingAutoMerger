import { Component, OnInit, ViewChild } from '@angular/core';
import { IUniSaveAction } from '../../../../framework/save/save';
import { Altinn } from '../../../unientities';
import { Observable } from 'rxjs/Observable';
import { UniFieldLayout } from 'uniform-ng2/main';
import { ErrorService, IntegrationServerCaller, AltinnIntegrationService } from '../../../services/services';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { UniConfirmModal, ConfirmActions } from '../../../../framework/modals/confirm';

@Component({
    selector: 'altinn-settings',
    templateUrl: './altinnSettings.html'

})
export class AltinnSettings implements OnInit {
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;

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
    public isDirty: boolean = false;

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

    public canDeactivate(): boolean|Promise<boolean> {
        if (!this.isDirty) {
           return true;
        }

        return new Promise<boolean>((resolve, reject) => {
            this.confirmModal.confirm(
                'Du har endringer som ikke er lagret - disse vil forkastes hvis du fortsetter?',
                'Vennligst bekreft',
                false,
                {accept: 'Fortsett uten å lagre', reject: 'Avbryt'}
            ).then((confirmDialogResponse) => {
               if (confirmDialogResponse === ConfirmActions.ACCEPT) {
                    resolve(true);
               } else {
                    resolve(false);
                }
            });
        });
    }

    public change(event) {
        this.isDirty = true;
    }

    public check() {

        this.loginErr = '';
        let company = JSON.parse(localStorage.getItem('companySettings'));

        this.busy = true;
        let altinn = this.altinn$.getValue();
        this._altinnService
            .getPassword()
            .switchMap((password: string) => password
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
                .switchMap((altinn: Altinn[]) =>
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
            .switchMap((retrievedAltinn: Altinn) =>
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
                this.isDirty = false;
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
        field.Placeholder = altinn['HasSystemPw'] ? '********' : '';
        return fields;
    }
}
