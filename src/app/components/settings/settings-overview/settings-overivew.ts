import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {UniModules} from '../../layout/navbar/tabstrip/tabService';
import {AuthService} from '@app/authService';
import {UniTranslationService, PageStateService} from '@app/services/services';
import {NavbarLinkService} from '../../layout/navbar/navbar-link-service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import {FeaturePermissionService} from '@app/featurePermissionService';


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
        private featurePermissionService: FeaturePermissionService,
        private tabService: TabService,
        private navbarLinkService: NavbarLinkService,
        private pageStateService: PageStateService,
        private translate: UniTranslationService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.authService.authentication$.take(1).subscribe(authDetails => {
            if (authDetails.user) {
                this.filterSettingsLinks = this.navbarLinkService.getSettingsFilteredByPermissions(authDetails.user);
                this.route.queryParams.subscribe((params) => {
                    this.searchString = params['search'] || '';
                    this.updateTabState();
                });
            }
        });
    }

    updateTabState() {
        this.pageStateService.setPageState('search', this.searchString);
        this.tabService.addTab({
            name: 'Innstillinger',
            url: '/settings?search=' + this.searchString,
            moduleID: UniModules.Settings,
            active: true
        });
    }

    goToView (item: any) {
      if (item.subSettings) {
          item.showSubSettings = !item.showSubSettings;
      } else if (item && item.url) {
        this.router.navigateByUrl(item.url);
      }
    }

    getClass(link: any) {
      return this.searchString !== '' && link.name &&
      (this.translate.translate(link.name).toLowerCase().includes(this.searchString.toLowerCase())
      || (link.keyWords && link.keyWords.filter(word => word.toLowerCase().includes(this.searchString.toLowerCase())).length))
            ? 'isSearchMatch'
            : '';
  }
}
