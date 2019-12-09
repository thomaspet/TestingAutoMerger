import {Component, OnInit} from '@angular/core';
import {IUniSaveAction} from '../../../../framework/save/save';
import {Altinn} from '../../../unientities';
import {Observable} from 'rxjs';
import {UniFieldLayout} from '../../../../framework/ui/uniform/index';
import {
    ErrorService,
    IntegrationServerCaller,
    AltinnIntegrationService,
} from '@app/services/services';
import {BehaviorSubject} from 'rxjs';
import {UniModalService} from '../../../../framework/uni-modal';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';

// HasSystemPw is not in the database but will still come from backend
// Create an extended class so typescript is happy
class AltinnExtended extends Altinn {
    HasSystemPw: boolean;
}

@Component({
    selector: 'altinn-settings',
    templateUrl: './altinnSettings.html'

})
export class AltinnSettings implements OnInit {
    public formConfig$: BehaviorSubject<any>= new BehaviorSubject({});
    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    public altinn$: BehaviorSubject<AltinnExtended> = new BehaviorSubject(null);
    public busy: boolean;
    actions: IUniSaveAction[] = [
        {
            label: 'Lagre innstillinger',
            action: this.saveAltinn.bind(this),
            main: true,
            disabled: false
        }
    ];

    public loginErr: string = '';
    public isDirty: boolean = false;
    public onlyOnce: boolean = true;

    constructor(
        private _altinnService: AltinnIntegrationService,
        private integrate: IntegrationServerCaller,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private toast: ToastService
    ) {}

    public ngOnInit() {
        this.getData();
    }

    public canDeactivate(): boolean | Observable<boolean> {
        if (!this.isDirty) {
           return true;
        }

        return this.modalService.deprecated_openUnsavedChangesModal().onClose;
    }

    public change(event) {
        this.isDirty = true;
    }

    public check() {
        if (this.isDirty) {
            this.errorService.addErrorToast('Innstillingene må lagres først');
        }
        this.busy = true;
        this._altinnService.checkLogin()
        .finally(()  => {
            this.busy = false;
        })
        .subscribe((res) => {
            if (res === true)  {
                this.loginErr = 'Testen kommuniserte med AltInn ';
                this.toast.addToast('Sjekk', ToastType.good, ToastTime.medium, this.loginErr);
            } else {
                this.loginErr = 'Test av kommunikasjon med AltInn feilet';
                 this.toast.addToast('Sjekk', ToastType.bad, ToastTime.medium, this.loginErr);
            }
            this.onlyOnce = false;
            this.busy = false;
         }, err => { this.errorService.handle(err); this.loginErr = 'Test av kommunikasjon feilet'; });

    }

    private getData() {
        Observable.forkJoin(
            this._altinnService
                .GetAll('')
                .switchMap((altinn: AltinnExtended[]) =>
                    altinn.length ? Observable.of(altinn[0]) : this._altinnService.GetNewEntity([], 'altinn')),
            this._altinnService.getLayout()).subscribe((response: [AltinnExtended, any]) => {
                const [altinn, layout] = response;
                this.altinn$.next(altinn);
                this.fields$.next(this.prepareLayout(layout.Fields, altinn));
            }, err => this.errorService.handle(err));
    }

    public saveAltinn(done) {
        const altinn = this.altinn$.getValue();
        altinn.Language = altinn.Language || '1044'; // Code 1044 == bokmål

        const saveObs = altinn.ID
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
            .subscribe((response: AltinnExtended) => {
                this.isDirty = false;
                this.altinn$.next(response);
                this.fields$.next(this.prepareLayout(this.fields$.getValue(), response));
                done('Innstillinger lagret ');
                this.loginErr = '';
                this.onlyOnce = true;
            }, error => {
                this.errorService.handle(error);
                done('feil ved lagring: ');
            });
    }

    private prepareLayout(fields: UniFieldLayout[], altinn: Altinn): UniFieldLayout[] {
        const field = fields.find(x => x.Property === 'SystemPw');
        field.Placeholder = altinn['HasSystemPw'] ? '********' : '';
        return fields;
    }
}
