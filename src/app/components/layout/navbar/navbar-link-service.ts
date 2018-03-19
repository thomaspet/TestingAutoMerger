import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {AuthService} from '@app/authService';
import {NAVBAR_LINKS, INavbarLinkSection, INavbarLink} from './navbar-links';
import {UniModules} from './tabstrip/tabService';
import * as _ from 'lodash';
import {UserDto} from '@uni-entities';
import {DimensionSettingsService} from '@app/services/common//dimensionSettingsService';

@Injectable()
export class NavbarLinkService {
    private user: UserDto;
    public linkSections$: BehaviorSubject<INavbarLinkSection[]> = new BehaviorSubject([]);
    public dimensions: any[];

    constructor(
        private authService: AuthService,
        private dimensionSettingsService: DimensionSettingsService
    ) {
        authService.authentication$.subscribe(authDetails => {
            if (authDetails.user) {
                this.user = authDetails.user;
                this.resetNavbar();
            }
        });
    }

    public addLink(componentListName: string, link: INavbarLink) {
        const linkSections = this.linkSections$.getValue() || [];
        const sectionIndex = linkSections.findIndex(section => section.componentListName === componentListName);
        if (sectionIndex >= 0) {
            linkSections[sectionIndex].componentList.push(link);
            this.linkSections$.next(linkSections);
        }
    }

    public resetNavbar() {
        this.linkSections$.next(this.getLinksFilteredByPermissions(this.user));
    }

    private getLinksFilteredByPermissions(user): any[] {
        let routeSections = _.cloneDeep(NAVBAR_LINKS);

        if (this.authService.canActivateRoute(user, 'dimensions/customdimensionlist')) {
            // Add custom dimensions to the list
            // this.dimensionSettingsService.GetAll(null).subscribe((dimensions) => {
            //         routeSections.push({
            //             componentListName: 'Dimensjoner',
            //             componentListHeader: 'Dimensjoner',
            //             componentListUrl: '/dimensions/customdimensionlist',
            //             componentListIcon: 'dimension',
            //             componentList: this.getDimensionList(dimensions)
            //     });
            // });
        }

        routeSections.forEach(section => {
            section.componentList = section.componentList.filter(item => {
                return this.authService.canActivateRoute(user, item.componentUrl);
            });
        });

        routeSections = routeSections.filter(section => section.componentList.length > 0);
        return routeSections;
    }

    public getDimensionList(dimensions) {
        const list = [
            {
                componentName: 'Prosjekt',
                componentUrl: '/dimensions/overview/1' ,
                moduleID: UniModules.Dimensions
            },
            {
                componentName: 'Avdeling',
                componentUrl: '/dimensions/overview/2' ,
                moduleID: UniModules.Dimensions
            }
        ];

        dimensions.forEach((dim) => {
            // add check to see if dim.IsActive??
            list.push(
                {
                    componentName: dim.Label,
                    componentUrl: '/dimensions/overview/' + dim.Dimension ,
                    moduleID: UniModules.Dimensions
                }
            );
        });
        list.push({
            componentName: 'Dimensjonsinnstillinger',
            componentUrl: '/settings/dimension',
            moduleID: UniModules.Dimensions
        });
        return list;
    }
}
