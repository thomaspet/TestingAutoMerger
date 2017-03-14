import {Component, ViewChild} from '@angular/core';
import {UserService, ErrorService} from '../../../services/services';
import {UniForm, FieldType} from 'uniform-ng2/main';
import {User} from '../../../unientities';
import {IUniSaveAction} from '../../../../framework/save/save';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniConfirmModal, ConfirmActions} from '../../../../framework/modals/confirm';

@Component({
    selector: 'user-settings',
    templateUrl: './userSettings.html',
})

export class UserSettings {
    @ViewChild(UniForm) public form: UniForm;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;

    public user$: BehaviorSubject<User> = new BehaviorSubject(null);
    public config$: BehaviorSubject<any>= new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public isDirty: boolean = false;

    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (done) => this.saveSettings(done),
            main: true,
            disabled: false
        }
    ];

    constructor(private userService: UserService, private errorService: ErrorService) {
    }

    public ngOnInit() {
        this.getDataAndSetupForm();
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
    
    private change(event) {
        this.isDirty = true;
    }

    private getDataAndSetupForm() {
        this.getFormLayout();
        this.userService.getCurrentUser().subscribe(user => this.user$.next(user), err => this.errorService.handle(err));
    }

    public saveSettings(complete) {
        this.userService
            .Put(this.user$.getValue().ID, this.user$.getValue())
            .subscribe(
                (response) => {
                    this.isDirty = false;
                    complete('Innstillinger lagret');
                },
                (error) => {
                    complete('Feil oppsto ved lagring');
                    this.errorService.handle(error);
                }
            );
    }

    private getFormLayout() {
        this.config$.next({});
        this.fields$.next([
            {
                ComponentLayoutID: 1,
                EntityType: 'User',
                Property: 'DisplayName',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Visningsnavn',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: '',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'User',
                Property: 'PhoneNumber',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Telefonnummer',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: '',
                hasLineBreak: false,
                Validations: []
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'User',
                Property: 'Email',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                LookupField: false,
                Label: 'Epost',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: '',
                hasLineBreak: false,
                Validations: []
            }
        ]);
    }
}
