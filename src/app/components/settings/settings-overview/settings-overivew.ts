import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {UniModules} from '../../layout/navbar/tabstrip/tabService';
import {AuthService} from '@app/authService';
import {UniTranslationService} from '@app/services/services';
import {NavbarLinkService} from '../../layout/navbar/navbar-link-service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';


const listAnimation = trigger('listAnimation', [
    transition('* <=> *', [
      query(':enter',
        [style({ opacity: 0 }), stagger('60ms', animate('600ms ease-out', style({ opacity: 1 })))],
        { optional: true }
      ),
      query(':leave',
        animate('200ms', style({ opacity: 0 })),
        { optional: true}
      )
    ])
  ]);

@Component({
    selector: 'settings-overview',
    templateUrl: './settings-overview.html',
    styleUrls: ['./settings-overview.sass'],
    animations: [listAnimation],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsOverview {
    public childRoutes: any[];

    filterSettingsLinks = [];
    searchString: string = '';

    constructor(
        private authService: AuthService,
        private tabService: TabService,
        private navbarLinkService: NavbarLinkService,
        private translate: UniTranslationService,
        private router: Router
    ) {
        this.tabService.addTab({
             name: 'Innstillinger',
             url: '/settings',
             moduleID: UniModules.Settings,
             active: true
        });

        this.authService.authentication$.take(1).subscribe(authDetails => {
            if (authDetails.user) {
                this.filterSettingsLinks = this.navbarLinkService.getSettingsFilteredByPermissions(authDetails.user);
            }
        });
    }

    goToView (item: any) {
        this.router.navigateByUrl(item.url);
    }

    getClass(link: any) {
      return this.searchString !== '' && link.name &&
      (this.translate.translate(link.name).toLowerCase().includes(this.searchString.toLowerCase())
      || (link.keyWords && link.keyWords.filter(word => word.toLowerCase().includes(this.searchString.toLowerCase())).length))
            ? 'isSearchMatch'
            : '';
  }
}
