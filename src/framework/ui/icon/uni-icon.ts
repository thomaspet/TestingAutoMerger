import {Component, Input, ChangeDetectionStrategy, ElementRef, HostBinding, NgModule} from '@angular/core';
import {SHARED_ICONS} from './shared-icons';
import {theme, THEMES} from 'src/themes/theme';
import { LibraryImportsModule } from '@app/library-imports.module';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

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

    // Ideally this would be one input named size, but since the icons sets used
    // in the whitelabel versions have different viewboxes that doesn't work very well.
    // This isn't a perfect solution either, and at some point we're probably going to want
    // to refactor all icons to use the same viewbox.
    @Input() svgSize: number;
    @Input() matIconSize: number;

    // Temp fix until we refactor SR svg icons to use "currentColor"
    @HostBinding('class.set-fill') setFill = theme.theme === THEMES.SR;

    @HostBinding('style') sizeStyling: SafeStyle;

    theme = theme;
    svg;
    matIcon: string;
    svgMarkup;

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

        let styles;
        if (this.svgSize && this.svg) {
            styles = `width: ${this.svgSize}px; height: ${this.svgSize}px`;
        } else if (this.matIconSize && this.matIcon) {
            styles = `font-size: ${this.matIconSize}`;
        }

        if (styles) {
            this.sizeStyling = this.sanitizer.bypassSecurityTrustStyle(styles);
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
