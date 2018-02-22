import {Component, OnInit} from '@angular/core';
import {TabService} from '../layout/navbar/tabstrip/tabService';
import {UniModules} from '../layout/navbar/tabstrip/tabService';
import {IPosterWidget} from '../common/poster/poster';
import {CompanySettings, SubEntity, User, File} from '../../unientities';
import {Observable} from 'rxjs/Observable';
import {CompanySettingsService, SubEntityService, UserService, ErrorService} from '../../services/services';
import {UniHttp} from '../../../framework/core/http/http';
import {IToolbarConfig} from '../common/toolbar/toolbar';

@Component({
    selector: 'settings',
    templateUrl: './settings.html'
})
export class Settings implements OnInit {

    private childRoutes: any[];
    private widgets: IPosterWidget[] = [
        {
            type: 'image',
            config: {

            }
        },
        {
            type: 'text',
            config: {
                mainText: { text: '' }
            }
        },
        {
            type: 'contact',
            config: {
                contact: []
            }
        },
        {
            type: 'text',
            size: 'big',
            config: {
                mainText: { text: '' }
            }
        }
    ];

    public toolbarconfig: IToolbarConfig = {
        title: 'Innstillinger',
        hideBreadcrumbs: true
    };

    constructor(
        private tabService: TabService,
        private companySettingsService: CompanySettingsService,
        private subEntityService: SubEntityService,
        private userService: UserService,
        private errorService: ErrorService,
        private http: UniHttp) {
        this.tabService.addTab({
             name: 'Innstillinger',
             url: '/settings/company',
             moduleID: UniModules.Settings,
             active: true
        });
        this.childRoutes = [
            { name: 'Firma', path: 'company' },
            { name: 'Lønn', path: 'aga-and-subentities' },
            { name: 'Integrasjoner', path: 'webhooks' },
            { name: 'Min Bruker', path: 'user' },
            { name: 'Brukere', path: 'users' },
            { name: 'Team', path: 'teams' },
            { name: 'Altinn', path: 'altinn' },
            { name: 'Nummerserier', path: 'numberseries' },
            { name: 'Betalings- og leveringsbetingelser', path: 'terms' },
            { name: 'Bankinnstillinger', path: 'banksettings' }
        ];
    }

    public ngOnInit() {
        Observable.forkJoin(
            this.companySettingsService.GetAll('').map(response => response[0]),
            this.subEntityService.GetAll('filter=SuperiorOrganizationID gt 0'),
            this.userService.GetAll('filter=StatusCode eq 110001'),
            this.userService.getCurrentUser(),
            this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint(`files/companysettings/1`)
            .send()
            .map(response => response.json())
            .map(response => response[0])
        ).subscribe((response: [CompanySettings, SubEntity[], User[], User, File]) => {
            const [settings, subEntities, users, currentUser, file] = response;
            this.updateWidgets(settings, subEntities, users, currentUser, file);

        }, err => this.errorService.handle(err));
    }

    private updateWidgets(
        companySettings: CompanySettings,
        subEntities: SubEntity[],
        users: User[],
        currentUser: User,
        file: File) {

        const posterCompanyLogo: IPosterWidget = {
            type: 'image',
            config: {
                fileID: file ? file.ID : null,
                placeholderSrc: '/assets/Logo-Placeholder.png',
                altText: 'firmalogo',
                hideToolbar: true
            }
        };

        const posterOrgNumber: IPosterWidget = {
            type: 'text',
            config: {
                topText: [{ text: 'Org.Nummer', class: 'large' }],
                mainText: { text: companySettings.OrganizationNumber },
                bottomText: [{ text: subEntities.length + ' virksomheter', class: 'small' }]
            }
        };
        const posterCurrentUser: IPosterWidget = {
            type: 'contact',
            config: {
                contacts: [{
                    value: currentUser.DisplayName
                }]
            }
        };
        const posterActiveUsers: IPosterWidget = {
            type: 'text',
            config: {
                mainText: { text: users.length, class: 'large' },
                bottomText: [{ text: 'Aktive brukere', class: 'large' }]
            }
        };

        this.widgets[0] = posterCompanyLogo;
        this.widgets[1] = posterOrgNumber;
        this.widgets[2] = posterCurrentUser;
        this.widgets[3] = posterActiveUsers;
    }
}
