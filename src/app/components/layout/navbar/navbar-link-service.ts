import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {AuthService} from '@app/authService';
import {NAVBAR_LINKS, INavbarLinkSection, INavbarLink} from './navbar-links';
import {UniModules} from './tabstrip/tabService';
import {UserDto} from '@uni-entities';
import {BrowserStorageService, DimensionSettingsService} from '@app/services/services';
import {Observable} from 'rxjs';
import {UniHttp} from '@uni-framework/core/http/http';
import * as _ from 'lodash';

export {INavbarLinkSection, INavbarLink} from './navbar-links';
export type SidebarState = 'collapsed' | 'expanded';

@Injectable()
export class NavbarLinkService {
    private user: UserDto;
    public linkSections$: BehaviorSubject<INavbarLinkSection[]> = new BehaviorSubject([]);

    public megaMenuVisible$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public sidebarState$: BehaviorSubject<SidebarState>;
    public dimensions: any[];

    constructor(
        private authService: AuthService,
        private dimensionSettingsService: DimensionSettingsService,
        private browserStorage: BrowserStorageService,
        private http: UniHttp
    ) {
        const initState = browserStorage.getItem('sidebar_state') || 'expanded';
        this.sidebarState$ = new BehaviorSubject(initState);
        this.sidebarState$.subscribe(state => browserStorage.setItem('sidebar_state', state));

        authService.authentication$.subscribe(authDetails => {
            if (authDetails.user) {
                this.user = authDetails.user;
                this.resetNavbar();
            }
        });
    }

    public resetNavbar() {
        this.linkSections$.next(this.getLinksFilteredByPermissions(this.user));

        this.getDimensionRouteSection(this.user).subscribe(
            dimensionLinks => {
                if (dimensionLinks) {
                    const linkSections = this.linkSections$.getValue();
                    const dimensionsIdx = linkSections.findIndex(section => section.name === 'Dimensjoner');

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
                }
            },
            err => console.error(err)
        );
    }

    private getLinksFilteredByPermissions(user): any[] {
        const routeSections: INavbarLinkSection[] = _.cloneDeep(NAVBAR_LINKS);

        // Filter out links the user doesnt have access to for every section
        routeSections.forEach(section => {
            section.linkGroups = section.linkGroups.map(group => {
                group.links = group.links.filter(link => {
                    const canActivate = this.authService.canActivateRoute(user, link.url);
                    // console.log('Checking: ' + link.url + ' - ' + canActivate);
                    return canActivate;
                });

                // console.log(group);
                return group;
            });
        });

        // Filter out sections where the user doesnt have access to any links
        return routeSections.filter(section => {
            return section.linkGroups.some(group => group.links.length > 0);
        });
    }

    private getDimensionRouteSection(user): Observable<INavbarLinkSection> {
        // Add custom dimensions to the list
        if (this.authService.canActivateRoute(user, 'dimensions/customdimensionlist')) {
            return this.dimensionSettingsService.GetAll(null).map((dimensions) => {
                return {
                    name: 'Dimensjoner',
                    url: '',
                    icon: 'dimension',
                    isSuperSearchComponent: true,
                    mdIcon: 'developer_board',
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

    public getQuery(url: string) {
        return this.http
            .asGET()
            .usingStatisticsDomain()
            .withEndPoint(url)
            .send().map(res => res.json());
    }

    public getDimensionLinks(dimensions) {
        const links: any = [
            {
                name: 'Prosjekt',
                url: '/dimensions/overview/1' ,
                moduleID: UniModules.Dimensions
            },
            {
                name: 'Avdeling',
                url: '/dimensions/overview/2' ,
                moduleID: UniModules.Dimensions
            }
        ];

        dimensions.forEach((dim) => {
            // add check to see if dim.IsActive??
            links.push(
                {
                    name: dim.Label,
                    url: '/dimensions/overview/' + dim.Dimension ,
                    moduleID: UniModules.Dimensions,
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

        links.push({
            name: 'Dimensjonsinnstillinger',
            url: '/settings/dimension',
            moduleID: UniModules.Dimensions
        });
        return links;
    }
}
