import { Component, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';
import { UserService, ErrorService } from '@app/services/services';
import { UserDto } from '@app/unientities';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import { environment } from 'src/environments/environment';
import { AuthService } from '@app/authService';
import { HttpClient } from '@angular/common/http';
import { theme, THEMES } from 'src/themes/theme';

@Component({
    selector: 'user-settings-modal',
    templateUrl: './user-settings-modal.html',
    styleUrls: ['./user-settings-modal.sass']
})
export class UserSettingsModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    busy: boolean;
    user: UserDto;
    userDetailsForm: FormGroup;
    autobankPasswordForm: FormGroup;
    epostButtonClicked: boolean;
    changePasswordUrl = `${environment.authority}/Account/ChangePassword?id=${environment.client_id}&redirecturl=${encodeURIComponent(window.location.href)}`;
    countryCodes: Object;
    oldAuthNumber: string;

    showResetAutobankPassword = theme.theme !== THEMES.EXT02;

    // Hide two factor for bruno until it works properly
    showTwoFactorSettings = theme.theme !== THEMES.EXT02;

    constructor(
        private http: HttpClient,
        private errorService: ErrorService,
        private userService: UserService,
        private toast: ToastService,
        private authService: AuthService,
    ) { }

    public ngOnInit() {
        this.busy = true;
        this.user = this.options.data || {};
        this.epostButtonClicked = false;

        this.authService.loadCurrentSession().subscribe((session) => {
            this.busy = false;
            let authPhoneCountryCode, authPhone;
            if (session.user.AuthPhoneNumber) {
                [authPhoneCountryCode, authPhone] = session.user.AuthPhoneNumber.split('-');
            }

            this.oldAuthNumber = session.user.AuthPhoneNumber;
            this.userDetailsForm = new FormGroup({
                DisplayName: new FormControl(this.user.DisplayName),
                PhoneNumber: new FormControl(this.user.PhoneNumber),
                Email: new FormControl(this.user.Email),
                TwoFactorEnabled: new FormControl(session.user.TwoFactorEnabled),
                CountryCode: new FormControl(['']),
                AuthPhoneNumber: new FormControl(authPhone),
            });

            const defaultCode = '47';
            this.userDetailsForm.controls['CountryCode'].setValue(authPhoneCountryCode || defaultCode, { onlySelf: true });
        });

        this.http.get('/assets/countrycode.json').subscribe(countryCodes => {
            this.countryCodes = countryCodes || [];
        });
    }

    save() {
        const saveRequests = [];
        if (this.userDetailsForm.dirty) {
            const model = this.userDetailsForm.value;
            if (model.TwoFactorEnabled && !model.AuthPhoneNumber) {
                this.userDetailsForm.controls['AuthPhoneNumber'].markAsTouched();
                return;
            }
            this.user.DisplayName = model.DisplayName;
            this.user.PhoneNumber = model.PhoneNumber;
            this.user.Email = model.Email;
            this.user.TwoFactorEnabled = model.TwoFactorEnabled;
            this.user.AuthPhoneNumber = this.user.TwoFactorEnabled ? `${model.CountryCode}-${model.AuthPhoneNumber}` : this.oldAuthNumber;

            saveRequests.push(this.userService.Put(this.user.ID, this.user));

            if (this.showTwoFactorSettings) {
                saveRequests.push(this.userService.updateUserTwoFactorAuth(this.user.TwoFactorEnabled).pipe(
                    catchError(e => {
                        this.userDetailsForm.get('TwoFactorEnabled').setValue(!this.user.TwoFactorEnabled);
                        this.user.TwoFactorEnabled = !this.user.TwoFactorEnabled;
                        e.error = `To-faktor pålogging er påkrevd for minst en lisens/selskap du har tilgang til. Kan ikke slå av to-faktor pålogging.`;
                        throw e;
                    })
                ));
            }
        }

        this.busy = true;
        if (saveRequests.length) {
            forkJoin(saveRequests).subscribe(
                () => this.onClose.emit(true),
                err => {
                    this.errorService.handle(err);
                    this.busy = false;
                }
            );
        } else {
            this.onClose.emit(false);
        }
    }

    resetAutobankPassword() {
        if (this.epostButtonClicked) {
            this.toast.toast({
                title: 'Epost sendt',
                message: 'Vi har sendt deg mer informasjon om endring av autobank passord på epost, vennligst sjekk innboksen din.',
                type: ToastType.info,
                duration: 0
            });
        } else {
            this.epostButtonClicked = true;
            this.userService.changeAutobankPassword().subscribe(
                () => {
                    this.toast.toast({
                        title: 'Epost sendt',
                        message: 'Vi har sendt deg mer informasjon om endring av autobank passord på epost, vennligst sjekk innboksen din.',
                        type: ToastType.info,
                        duration: 0
                    });
                },
                err => this.errorService.handle(err)
            );
        }
    }
}
