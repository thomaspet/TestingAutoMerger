import {Component, Input, ChangeDetectionStrategy, ElementRef, HostBinding, NgModule} from '@angular/core';
import {SHARED_ICONS} from './shared-icons';
import {theme, THEMES} from 'src/themes/theme';
import { LibraryImportsModule } from '@app/library-imports.module';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'uni-icon',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./uni-icon.sass'],
    template: `
        <i *ngIf="matIcon" [class]="matIconClass || 'material-icons'">{{matIcon}}</i>
        <svg *ngIf="svg" [outerHTML]="svg"></svg>
    `
})
export class UniIcon {
    @Input() icon: string;
    @Input() matIconClass: string;

    @HostBinding('class.set-fill') setFill = theme.theme === THEMES.SR;

    theme = theme;
    svg;
    matIcon: string;
    svgMarkup;
    // setFill = theme.theme === THEMES.SR; // temp fix until we refactor SR svg icons to use "currentColor"

    // ElementRef is used by dropdown-menu to attach a click listener if this component is used as a trigger
    constructor(public elementRef: ElementRef, private sanitizer: DomSanitizer) {}

    ngOnChanges(changes) {
        if (changes['icon']) {
            const themeIcon = theme.icons && theme.icons[this.icon];
            if (themeIcon) {
                if (themeIcon.includes('<svg')) {
                    this.svg = this.sanitizer.bypassSecurityTrustHtml(themeIcon);
                    this.matIcon = undefined;
                } else {
                    this.svg = undefined;
                    this.matIcon = themeIcon;
                }
            } else if (SHARED_ICONS[this.icon]) {
                this.svg = SHARED_ICONS[this.icon];
                this.matIcon = undefined;
            } else {
                this.svg = undefined;
                this.matIcon = this.icon;
            }
        }
    }
}

@NgModule({
    imports: [
        LibraryImportsModule
    ],
    declarations: [
        UniIcon
    ],
    exports: [
        UniIcon
    ]
})

export class UniIconModule {}
