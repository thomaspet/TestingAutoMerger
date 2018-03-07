import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {AuthService} from '@app/authService';
import {NAVBAR_LINKS, INavbarLinkSection, INavbarLink} from './navbar-links';
import * as _ from 'lodash';
import {UserDto} from '@uni-entities';

@Injectable()
export class NavbarLinkService {
    private user: UserDto;
    public linkSections$: BehaviorSubject<INavbarLinkSection[]> = new BehaviorSubject([]);

    constructor(private authService: AuthService) {
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
        routeSections.forEach(section => {
            section.componentList = section.componentList.filter(item => {
                return this.authService.canActivateRoute(user, item.componentUrl);
            });
        });

        routeSections = routeSections.filter(section => section.componentList.length > 0);
        return routeSections;
    }
}
