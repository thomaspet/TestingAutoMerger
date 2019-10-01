import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {AuthService} from '@app/authService';
import {
    NO_UNI_NAVBAR_LINKS,
    NO_SR_NAVBAR_LINKS,
    SETTINGS_LINKS,
    INavbarLinkSection,
    INavbarLink
} from './navbar-links';
import {UniModules} from './tabstrip/tabService';
import {UserDto, User} from '@uni-entities';
import {BrowserStorageService, DimensionSettingsService, UniTranslationService} from '@app/services/services';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {Observable} from 'rxjs';
import {UniHttp} from '@uni-framework/core/http/http';
import * as _ from 'lodash';

export {INavbarLinkSection, INavbarLink} from './navbar-links';
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
    public links = {
        NO_UNI_NAVBAR_LINKS: NO_UNI_NAVBAR_LINKS,
        NO_SR_NAVBAR_LINKS: NO_SR_NAVBAR_LINKS
    };
    public NAVBAR_LINKS;

    constructor(
        private authService: AuthService,
        private dimensionSettingsService: DimensionSettingsService,
        private http: UniHttp,
        private toastService: ToastService,
        private translationService: UniTranslationService,
        browserStorage: BrowserStorageService,
    ) {
        const initState = browserStorage.getItem('sidebar_state') || 'expanded';
        this.sidebarState$ = new BehaviorSubject(initState);
        this.sidebarState$.subscribe(state => browserStorage.setItem('sidebar_state', state));

        this.translationService.locale.subscribe((locale) => {
            this.localeValue = locale;
            if (locale !== 'EN') {
                this.NAVBAR_LINKS = this.links[`${locale}_NAVBAR_LINKS`];
            } else {
                this.NAVBAR_LINKS = this.links.NO_UNI_NAVBAR_LINKS;
            }
            this.resetNavbar();
        });

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

        // Only get dimensions tab view when in UNI-VIEW
        if (this.localeValue === 'NO_UNI') {

            const linkSections = this.getLinksFilteredByPermissions(this.user);

            this.getDimensionRouteSection(this.user).subscribe(
                dimensionLinks => {
                    if (dimensionLinks) {
                        // linkSections = this.linkSections$.getValue();
                        const dimensionsIdx = linkSections.findIndex(section => section.name === 'NAVBAR.DIMENSION');

                        // Insert before settings (or marketplace if no settings access)
                        const insertIndex = linkSections.findIndex(section => {
                            return section.name === 'Innstillinger' || section.name === 'Markedsplass';
                        });

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
                err => {
                    this.linkSections$.next(linkSections);
                }
            );
        } else {
            this.linkSections$.next(this.getLinksFilteredByPermissions(this.user));
        }
    }

    private getSettingsFilteredByPermissions(user: UserDto): any[] {
        const settingsSections: INavbarLinkSection[] = _.cloneDeep(SETTINGS_LINKS);
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
        let routeSections: INavbarLinkSection[];

        if (fromLocalStorage) {
            routeSections = JSON.parse(fromLocalStorage);
        } else {
            routeSections = _.cloneDeep(this.NAVBAR_LINKS);
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
                    url: '',
                    icon: 'dimension',
                    isSuperSearchComponent: true,
                    mdIcon: 'developer_board',
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

    public saveSidebarLinks(linkSection: any[]) {
        localStorage.setItem(`SIDEBAR_${this.localeValue}_${this.company.Key}`, JSON.stringify(linkSection));
        this.toastService.addToast('Ny menystruktur lagret', ToastType.good, ToastTime.short);
        this.resetNavbar();
    }
}
