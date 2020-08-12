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
import {HttpClient} from '@angular/common/http';

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
            const [authCode, authNumber] = session.user.AuthPhoneNumber.split('-');
            this.oldAuthNumber = session.user.AuthPhoneNumber;
            this.userDetailsForm = new FormGroup({
                DisplayName: new FormControl(this.user.DisplayName),
                PhoneNumber: new FormControl(this.user.PhoneNumber),
                Email: new FormControl(this.user.Email),
                TwoFactorEnabled: new FormControl(session.user.TwoFactorEnabled),
                CountryCode: new FormControl(['']),
                AuthPhoneNumber: new FormControl(authNumber),
            });

            const defaultCode = '47';
            this.userDetailsForm.controls['CountryCode'].setValue(authCode || defaultCode, { onlySelf: true });
        });

        this.http.get('/assets/countrycode.json').subscribe(countryCodes => {
            this.countryCodes = countryCodes || [];
        });
    }

    save() {
        const saveRequests = [];
        if (this.userDetailsForm.dirty) {
            const model = this.userDetailsForm.value;
            if (this.user.TwoFactorEnabled && !model.AuthPhoneNumber) { return; }
            this.user.DisplayName = model.DisplayName;
            this.user.PhoneNumber = model.PhoneNumber;
            this.user.Email = model.Email;
            this.user.TwoFactorEnabled = model.TwoFactorEnabled;
            this.user.AuthPhoneNumber = this.user.TwoFactorEnabled ? `${model.CountryCode}-${model.AuthPhoneNumber}` : this.oldAuthNumber;
            saveRequests.push(this.userService.Put(this.user.ID, this.user));
            saveRequests.push(this.userService.updateUserTwoFactorAuth(this.user.TwoFactorEnabled).pipe(
                catchError((e) => {
                    this.userDetailsForm.get('TwoFactorEnabled').setValue(!this.user.TwoFactorEnabled);
                    this.user.TwoFactorEnabled = !this.user.TwoFactorEnabled;
                    e.error = `To-faktor pålogging er påkrevd for minst en lisens/selskap du har tilgang til. Kan ikke slå av to-faktor pålogging.`;
                    throw e;
                }
                )));
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
        this.userService.changeAutobankPassword().subscribe(
            () => this.toast.addToast('E-post er sendt', ToastType.good, ToastTime.short),
            err => this.errorService.handle(err)
        );
    }
}
