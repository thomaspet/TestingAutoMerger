import {Component, Input, ChangeDetectionStrategy, ElementRef} from '@angular/core';
import {theme} from 'src/themes/theme';

@Component({
    selector: 'uni-icon',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./uni-icon.sass'],
    template: `
        <i *ngIf="matIcon" [class]="matIconClass || 'material-icons'">{{matIcon}}</i>
        <svg *ngIf="svg" [class.set-fill]="theme.setFillOnIcons" [outerHTML]="svg | keepHtml"></svg>
    `
})
export class UniIcon {
    @Input() icon: string;
    @Input() matIconClass: string;


    theme = theme;
    svg: string;
    matIcon: string;

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
