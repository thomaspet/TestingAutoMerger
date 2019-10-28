import {Component, Input, ChangeDetectionStrategy, ElementRef} from '@angular/core';

// tslint:disable-next-line
const COLORS = ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50', '#f1c40f', '#e67e22', '#e74c3c', '#ecf0f1', '#95a5a6', '#f39c12', '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d'];

@Component({
    selector: 'uni-avatar',
    template: `
        <section *ngIf="style" [ngStyle]="style">
            {{initials}}
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniAvatar {
    @Input()
    private name: string;

    @Input()
    private isSquare: boolean;

    public style: any;
    public initials: string;

    constructor(private el: ElementRef) {}

    public ngOnChanges() {
        if (!this.name || !this.name.length) {
            this.style = undefined;
            this.initials = '';
            return;
        }

        const nameSplit = this.name.split(' ');
        this.initials = nameSplit[0].charAt(0).toUpperCase();
        if (nameSplit.length > 1) {
            this.initials += nameSplit[1].charAt(0).toUpperCase();
        }

        this.style = {
            'background-color': '#D2DAE2', // this.getColorCode(),
            'color': '#1565C0', // this.getColorCode(), // '#fff',
            'width': 'inherit',
            'height': '100%',
            'border-radius': this.isSquare ? '0' : '50%',
            'font-weight': 500
        };
    }

    private getColorCode(): string {
        const charIndex = this.initials.charCodeAt(0) - 64;
        return COLORS[(charIndex % 20) - 1];
    }

}
