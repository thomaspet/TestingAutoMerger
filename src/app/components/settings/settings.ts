import {Component, OnInit} from '@angular/core';
import {TabService} from '../layout/navbar/tabstrip/tabService';
import {UniModules} from '../layout/navbar/tabstrip/tabService';
import {IPosterWidget} from '../common/poster/poster';
import {CompanySettings, SubEntity, User, File} from '../../unientities';
import {Observable} from 'rxjs/Observable';
import {CompanySettingsService, SubEntityService, UserService, ErrorService} from '../../services/services';
import {UniHttp} from '../../../framework/core/http/http';
import {IToolbarConfig} from '../common/toolbar/toolbar';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

@Component({
    selector: 'settings',
    templateUrl: './settings.html'
})
export class Settings {

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

    constructor(
        private tabService: TabService,
        private companySettingsService: CompanySettingsService,
        private subEntityService: SubEntityService,
        private userService: UserService,
        private errorService: ErrorService,
        private http: UniHttp) {
        this.tabService.addTab({ name: 'Innstillinger', url: '/settings/company', moduleID: UniModules.Settings, active: true });
        this.childRoutes = [
            { name: 'Firma', path: 'company' },
            { name: 'Lønn', path: 'aga-and-subentities' },
            { name: 'Integrasjoner', path: 'webhooks' },
            { name: 'Bruker', path: 'user' },
            { name: 'Roller', path: 'users' },
            { name: 'Altinn', path: 'altinn' }
        ];
    }

    private toolbarconfig: IToolbarConfig = {
        title: 'Innstillinger'
    };

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
            let [settings, subEntities, users, currentUser, file] = response;
            this.updateWidgets(settings, subEntities, users, currentUser, file);

        }, err => this.errorService.handle(err));
    }

    private updateWidgets(
        companySettings: CompanySettings,
        subEntities: SubEntity[],
        users: User[],
        currentUser: User,
        file: File) {

        let posterCompanyLogo: IPosterWidget = {
            type: 'image',
            config: {
                fileID: file ? file.ID : null,
                placeholderSrc: 'http://celebrityhockeyclassics.com/wp-content/uploads/Logo-Placeholder.png',
                altText: 'firmalogo'
            }
        };

        let posterOrgNumber: IPosterWidget = {
            type: 'text',
            config: {
                topText: [{ text: 'Org.Nummer', class: 'large' }],
                mainText: { text: companySettings.OrganizationNumber },
                bottomText: [{ text: subEntities.length + ' virksomheter', class: 'small' }]
            }
        };
        let posterCurrentUser: IPosterWidget = {
            type: 'contact',
            config: {
                contacts: [{
                    value: currentUser.DisplayName
                }]
            }
        };
        let posterActiveUsers: IPosterWidget = {
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
