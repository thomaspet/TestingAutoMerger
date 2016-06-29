import {Component, ViewChild} from "@angular/core";
import {UserService} from '../../../services/services';
import {UniForm} from '../../../../framework/uniform';
import {UniFieldLayout} from '../../../../framework/uniform/index';
import {FieldType} from '../../../unientities';
import {AuthService} from '../../../../framework/core/authService';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';

@Component({
    selector: "user-settings",
    templateUrl: "app/components/settings/userSettings/userSettings.html",
    providers: [
        UserService
    ],
    directives: [UniForm, UniSave]
})

export class UserSettings {
    @ViewChild(UniForm) public form: UniForm;
    private user: any;

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

    constructor(private userService: UserService,
                private authService: AuthService) {       
    }

    public ngOnInit() {
        this.getDataAndSetupForm();
    }

    private getDataAndSetupForm() {
        this.getFormLayout();

        let jwt = this.authService.jwtDecoded;     
        this.userService.Get(`?filter=GlobalIdentity eq '${jwt.nameid}'`).subscribe((users) => {
            this.user = users[0];
        });
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
                    alert('Feil oppsto ved lagring:' + JSON.stringify(error.json()));
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