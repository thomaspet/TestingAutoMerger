import {Component, Input, ChangeDetectionStrategy, ElementRef, HostBinding} from '@angular/core';
import {theme, THEMES} from 'src/themes/theme';

@Component({
    selector: 'uni-icon',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./uni-icon.sass'],
    template: `
        <i *ngIf="matIcon" [class]="matIconClass || 'material-icons'">{{matIcon}}</i>
        <svg *ngIf="svg" [outerHTML]="svg | keepHtml"></svg>
    `
})
export class UniIcon {
    @Input() icon: string;
    @Input() matIconClass: string;

    @HostBinding('class.set-fill') setFill = theme.theme === THEMES.SR;

    theme = theme;
    svg: string;
    matIcon: string;
    // setFill = theme.theme === THEMES.SR; // temp fix until we refactor SR svg icons to use "currentColor"

    // ElementRef is used by dropdown-menu to attach a click listener if this component is used as a trigger
    constructor(public elementRef: ElementRef) {}

    ngOnChanges(changes) {
        if (changes['icon']) {
            const themeIcon = theme.icons && theme.icons[this.icon];
            if (themeIcon) {
                if (themeIcon.includes('<svg')) {
                    this.svg = themeIcon;
                    this.matIcon = undefined;
                } else {
                    this.svg = undefined;
                    this.matIcon = themeIcon;
                }
            } else {
                this.svg = undefined;
                this.matIcon = this.icon;
            }
        }
    }
}
