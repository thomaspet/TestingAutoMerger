import {Component} from '@angular/core';
import {UserService, ErrorService} from '../../../services/services';
import {FieldType} from '../../../../framework/ui/uniform/index';
import {User} from '../../../unientities';
import {IUniSaveAction} from '../../../../framework/save/save';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniModalService} from '../../../../framework/uniModal/barrel';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'user-settings',
    templateUrl: './userSettings.html',
})
export class UserSettings {
    public user$: BehaviorSubject<User> = new BehaviorSubject(null);
    public formConfig$: BehaviorSubject<any>= new BehaviorSubject({});
    public formFields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public isDirty: boolean = false;

    public saveactions: IUniSaveAction[] = [{
        label: 'Lagre',
        action: (done) => this.saveSettings(done),
        main: true,
        disabled: false
    }];

    constructor(
        private userService: UserService,
        private errorService: ErrorService,
        private modalService: UniModalService
    ) {}

    public ngOnInit() {
        this.userService.getCurrentUser().subscribe(
            user => this.user$.next(user),
            err => this.errorService.handle(err)
        );

        this.formConfig$.next({});
        this.formFields$.next(this.getFormFields());
    }

    public canDeactivate(): boolean | Observable<boolean> {
        if (!this.isDirty) {
           return true;
        }

        return this.modalService.deprecated_openUnsavedChangesModal().onClose;
    }

    public onFormChange(event) {
        this.isDirty = true;
    }

    public saveSettings(complete) {
        const user = this.user$.getValue();
        this.userService.Put(user.ID, user).subscribe(
            (response) => {
                this.isDirty = false;
                complete('Bruker lagret');
            },
            (error) => {
                complete('Feil ved lagring av bruker');
                this.errorService.handle(error);
            }
        );
    }

    private getFormFields() {
        return [
            {
                Legend: 'Brukerinnstillinger',
                FieldSet: 1,
                EntityType: 'User',
                Property: 'DisplayName',
                FieldType: FieldType.TEXT,
                Label: 'Visningsnavn',
            },
            {
                FieldSet: 1,
                EntityType: 'User',
                Property: 'PhoneNumber',
                FieldType: FieldType.TEXT,
                Label: 'Telefonnummer',
            },
            {
                FieldSet: 1,
                EntityType: 'User',
                Property: 'Email',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Epost',
            }
        ];
    }
}
