import {Component, ViewChild} from '@angular/core';
import {UserService, ErrorService} from '../../../services/services';
import {UniForm} from 'uniform-ng2/main';
import {FieldType, User} from '../../../unientities';
import {IUniSaveAction} from '../../../../framework/save/save';

@Component({
    selector: 'user-settings',
    templateUrl: 'app/components/settings/userSettings/userSettings.html',
})

export class UserSettings {
    @ViewChild(UniForm) public form: UniForm;
    private user: User;

    public config: any = {};
    public fields: any[] = [];

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

    private getDataAndSetupForm() {
        this.getFormLayout();
        this.userService.getCurrentUser().subscribe(user => this.user = user, err => this.errorService.handle(err));
    }

    public saveSettings(complete) {
        this.userService
            .Put(this.user.ID, this.user)
            .subscribe(
                (response) => {
                    complete('Innstillinger lagret');
                },
                (error) => {
                    complete('Feil oppsto ved lagring');
                    this.errorService.handle(error);
                }
            );
    }

    private getFormLayout() {
        this.config = {};
        this.fields = [
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
        ]
    }
}
