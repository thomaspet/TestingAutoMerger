import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {cloneDeep} from 'lodash';
import {AuthService} from '@app/authService';
import {NAVBAR_LINKS} from './navbar-links';
import {INavbarLinkSection, SETTINGS_LINKS} from './navbar-links-common';
import {UniModules} from './tabstrip/tabService';
import {UserDto} from '@uni-entities';
import {BrowserStorageService, DimensionSettingsService} from '@app/services/services';
import {UniHttp} from '@uni-framework/core/http/http';
import {theme, THEMES} from 'src/themes/theme';

export type SidebarState = 'collapsed' | 'expanded';


@Injectable()
export class NavbarLinkService {
    private user: UserDto;
    public localeValue: string = '';
    public linkSections$: BehaviorSubject<INavbarLinkSection[]> = new BehaviorSubject([]);
    public settingsSection$: BehaviorSubject<INavbarLinkSection[]> = new BehaviorSubject([]);

    sidebarState$: BehaviorSubject<SidebarState>;
    megaMenuVisible$ = new BehaviorSubject(false);

    public dimensions: any[];
    public company: any = {};

    constructor(
        private authService: AuthService,
        private dimensionSettingsService: DimensionSettingsService,
        private http: UniHttp,
        browserStorage: BrowserStorageService,
    ) {
        const initState = browserStorage.getItem('sidebar_state') || 'expanded';
        this.sidebarState$ = new BehaviorSubject(initState);
        this.sidebarState$.subscribe(state => browserStorage.setItem('sidebar_state', state));

        authService.authentication$.subscribe(authDetails => {
            this.company = authDetails.activeCompany;
            if (authDetails.user) {
                this.user = authDetails.user;
                this.linkSections$.next(this.getLinksFilteredByPermissions(this.user));
                this.resetNavbar();
            }
        });
    }

    public resetNavbar() {
        this.settingsSection$.next(this.getSettingsFilteredByPermissions(this.user));
        if (theme.theme === THEMES.SR) {
            this.linkSections$.next(this.getLinksFilteredByPermissions(this.user));
        } else {
            const linkSections = this.getLinksFilteredByPermissions(this.user);

            this.getDimensionRouteSection(this.user).subscribe(
                dimensionLinks => {
                    if (dimensionLinks) {
                        const dimensionsIdx = linkSections.findIndex(section => section.name === 'NAVBAR.DIMENSION');

                        // Insert before marketplace
                        const insertIndex = linkSections.findIndex(section => section.name === 'NAVBAR.MARKETPLACE');

                        // If dimensions is already in the list, just update
                        if (dimensionsIdx !== -1) {
                            linkSections[dimensionsIdx] = dimensionLinks;
                        } else if (insertIndex > 0) {
                            linkSections.splice(insertIndex, 0, dimensionLinks);
                        } else {
                            linkSections.push(dimensionLinks);
                        }

                        this.linkSections$.next(linkSections);
                    } else {
                        this.linkSections$.next(linkSections);
                    }
                },
                () => this.linkSections$.next(linkSections)
            );
        }
    }

    public getSettingsFilteredByPermissions(user: UserDto): any[] {
        const settingsSections: INavbarLinkSection[] = cloneDeep(SETTINGS_LINKS);
        // Filter out links the user doesnt have access to for every section
        settingsSections.forEach(section => {
            section.linkGroups = section.linkGroups.map(group => {
                group.links = group.links.filter(link => {
                    const canActivate = this.authService.canActivateRoute(user, link.url);
                    return canActivate;
                });
                return group;
            });
        });

        // Filter out sections where the user doesnt have access to any links
        return settingsSections.filter(section => {
            return section.linkGroups.some(group => group.links.length > 0);
        });
    }

    private getLinksFilteredByPermissions(user): any[] {

        const fromLocalStorage = this.company.Key ? localStorage.getItem(`SIDEBAR_${this.localeValue}_${this.company.Key}`) : null;
        const routeSections: INavbarLinkSection[] = cloneDeep(NAVBAR_LINKS);

        if (fromLocalStorage) {
            const valuesFromLS: any[] = JSON.parse(fromLocalStorage);
            routeSections.forEach(section => {
                section.linkGroups = section.linkGroups.map(group => {
                    group.links = group.links.filter(link => {
                        const canActivate = this.authService.canActivateRoute(user, link.url);

                        // Use saved config from localStorage
                        const savedState = valuesFromLS.find(value => value.name === link.name);
                        link.activeInSidebar = !!savedState ? savedState.activeInSidebar : link.activeInSidebar;

                        return canActivate;
                    });
                    return group;
                });
            });
        }

        // Filter out links the user doesnt have access to for every section
        routeSections.forEach(section => {
            section.linkGroups = section.linkGroups.map(group => {
                group.links = group.links.filter(link => {
                    const canActivate = this.authService.canActivateRoute(user, link.url);
                    return canActivate;
                });

                return group;
            });
        });

        // Filter out sections where the user doesnt have access to any links
        return routeSections.filter(section => {
            return section.isOnlyLinkSection || section.linkGroups.some(group => group.links.length > 0);
        });
    }

    private getDimensionRouteSection(user): Observable<INavbarLinkSection> {
        // Add custom dimensions to the list
        if (this.authService.canActivateRoute(user, 'dimensions/customdimensionlist')) {
            return this.dimensionSettingsService.GetAll(null).map((dimensions) => {
                return {
                    name: 'NAVBAR.DIMENSION',
                    url: '/dimensions',
                    icon: 'developer_board',
                    isSuperSearchComponent: true,
                    megaMenuGroupIndex: 0,
                    linkGroups: [{
                        name: '',
                        links: this.getDimensionLinks(dimensions)
                    }]
                };
            });
        } else {
            return Observable.of(null);
        }
    }

    public resetToDefaultMenuStructure() {
        localStorage.removeItem(`SIDEBAR_${this.localeValue}_${this.company.Key}`);
        this.resetNavbar();
    }

    public getQuery(url: string) {
        return this.http
            .asGET()
            .usingStatisticsDomain()
            .withEndPoint(url)
            .send().map(res => res.body);
    }

    public getDimensionLinks(dimensions) {
        const links: any = [
            {
                name: 'Prosjekt',
                url: '/dimensions/overview/1' ,
                moduleID: UniModules.Dimensions,
                activeInSidebar: true
            },
            {
                name: 'Avdeling',
                url: '/dimensions/overview/2' ,
                moduleID: UniModules.Dimensions,
                activeInSidebar: true
            }
        ];

        dimensions.forEach((dim) => {
            // add check to see if dim.IsActive??
            links.push(
                {
                    name: dim.Label,
                    url: '/dimensions/overview/' + dim.Dimension ,
                    moduleID: UniModules.Dimensions,
                    activeInSidebar: true,
                    isSuperSearchComponent: false,
                    moduleName: 'Dimension' + dim.Dimension,
                    selects: [
                        {key: 'ID', isNumeric: true},
                        {key: 'Number', isNumeric: false},
                        {key: 'Name', isNumeric: false}
                    ],
                    // shortcutName: 'Ny ' + dim.Label,
                    prefix: 'dim' + dim.Dimension,
                }
            );
        });
        return links;
    }

    public saveSidebarLinks(linkSection: INavbarLinkSection[]) {

        const nameAndActiveValue = [];

        linkSection.forEach(section => {
            section.linkGroups.forEach(group => {
                group.links.map(link => {
                    nameAndActiveValue.push({
                        activeInSidebar: link.activeInSidebar,
                        name: link.name
                    });
                });
            });
        });

        localStorage.setItem(`SIDEBAR_${this.localeValue}_${this.company.Key}`, JSON.stringify(nameAndActiveValue));
        this.resetNavbar();
    }
}
