import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {VideoMappingService} from '@app/services/services';

@Component({
    selector: 'uni-tabstrip-help',
    template: `
        <section class="help-toggle" role="button"
            (click)="isExpanded = !isExpanded"
            (clickOutside)="isExpanded = false">

            <span>Hjelp</span>
            <i class="material-icons">expand_more</i>
        </section>

        <ul class="toolbar-dropdown-list" [attr.aria-expanded]="isExpanded">
            <li [attr.aria-disabled]="!videoURL?.length" (click)="goToVideo()">Opplæringsvideo for skjermbilde</li>
            <li (click)="goToServiceDesk()">Kundesenter</li>
            <li (click)="goToAbout()">Versjonsinformasjon</li>
        </ul>
    `,
    styleUrls: ['./help.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTabstripHelp {
    public isExpanded: boolean;
    public videoURL: string;

    constructor(
        private videoMappingService: VideoMappingService,
        private router: Router
    ) {
        router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.videoURL = undefined;
                this.videoMappingService.getVideo(window.location.href).then(res => this.videoURL = res);
            }
        });
    }

    public goToVideo() {
        if (this.videoURL) {
            window.open(this.videoURL, '_blank');
        }
    }

    public goToServiceDesk() {
        window.open('https://unimicro.atlassian.net/servicedesk/customer/portal/3', '_blank');
    }

    public goToAbout() {
        this.router.navigateByUrl('/about/versions');
    }
}
