import {
    Component,
    ElementRef,
    Pipe,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ViewChild,
    PipeTransform
} from '@angular/core';
import {Router} from '@angular/router';
import {UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {NavbarLinkService} from '../navbar-link-service';

@Pipe({name: 'removehidden'})
export class RemoveHidden implements PipeTransform {
    public transform(componentList) {
        return componentList.filter((x) => !(x.hidden || false));
    }
}

@Component({
    selector: 'uni-hamburger-menu',
    template: `
        <nav class="hamburger"
            [ngClass]="{'is-active': open}"
            (click)="toggle($event)"
            (clickOutside)="close()">

            <ul class="hamburger_menu" #menu (mousemove)="mouseMoveHandler($event)">
                <li class="hamburger_item"
                    *ngFor="let componentList of navbarLinkService.linkSections$ | async; let idx = index"
                    (mouseenter)="mouseEnterHandler($event, idx)"
                    [ngClass]="{'is-active': idx === selectionIndex}">

                    {{componentList.componentListName}}

                    <ul class="hamburger_submenu">
                        <h3>{{componentList.componentListHeader}}</h3>
                        <li *ngFor="let component of componentList.componentList | removehidden"
                        [attr.data-header]="component.groupHeader"
                        (click)="navigate(component.componentUrl)"
                        class="hamburger_component">
                            {{component.componentName}}
                        </li>
                    </ul>
                </li>
            </ul>
        </nav>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HamburgerMenu {
    @ViewChild('menu')
    private sectionList: ElementRef;

    private open: boolean = false;
    public selectionIndex: number = 0;

    // Menu aim
    private timeoutReference: any;
    private tolerance: number = 75;
    private timeout: number = 500;
    private movements: {x: number, y: number}[] = [];
    private lastDelayLocation: {x: number, y: number};

    constructor(
        private router: Router,
        private cdr: ChangeDetectorRef,
        private navbarLinkService: NavbarLinkService
    ) {}

    public toggle(event) {
        if (event.target.tagName === 'NAV') {
            this.open = !this.open;
        }
    }

    public close() {
        this.open = false;
    }

    public navigate(url: string): void {
        this.open = false;
        this.router.navigateByUrl(url);
    }

    // Menu aim
    public mouseMoveHandler(event: MouseEvent) {
        this.movements.push({
            x: event.clientX,
            y: event.clientY
        });

        if (this.movements.length >= 3) {
            this.movements.shift();
        }
    }

    public mouseEnterHandler(event: MouseEvent, index) {
        if (this.timeoutReference) {
            clearTimeout(this.timeoutReference);
        }

        this.possiblyActivate(event.target, index);
    }

    private activationDelay() {
        const menu = this.sectionList.nativeElement;

        const offset = {left: menu.offsetLeft, top: menu.offsetTop};

        const upperLeft = {
            x: offset.left,
            y: offset.top - 75
        };

        const upperRight = {
            x: offset.left + menu.offsetWidth,
            y: upperLeft.y
        };

        const lowerLeft = {
            x: offset.left,
            y: offset.top + menu.offsetHeight + this.tolerance
        };

        const lowerRight = {
            x: offset.left + menu.offsetWidth,
            y: lowerLeft.y
        };

        const loc = this.movements[this.movements.length - 1];
        const prevLoc = this.movements[0];

        if (!loc || !prevLoc) {
            return 0;
        }

        if (this.lastDelayLocation &&
            loc.x === this.lastDelayLocation.x && loc.y === this.lastDelayLocation.y
        ) {
            // If the mouse hasn't moved since the last time we checked
            // for activation status, immediately activate.
            return 0;
        }

        const slope = (a, b) => {
            return (b.y - a.y) / (b.x - a.x);
        };

        const decreasingSlope = slope(loc, upperRight),
            increasingSlope = slope(loc, lowerRight),
            prevDecreasingSlope = slope(prevLoc, upperRight),
            prevIncreasingSlope = slope(prevLoc, lowerRight);

        if (decreasingSlope < prevDecreasingSlope &&
                increasingSlope > prevIncreasingSlope) {
            // Mouse is moving from previous location towards the
            // currently activated submenu. Delay before activating a
            // new menu row, because user may be moving into submenu.
            this.lastDelayLocation = loc;
            return this.timeout;
        }

        this.lastDelayLocation = null;
        return 0;
    }

    private possiblyActivate(element, index) {
        const delay = this.activationDelay();

        if (delay) {
            this.timeoutReference = setTimeout(() => {
                this.possiblyActivate(element, index);
            }, delay);
        } else {
            this.selectionIndex = index;
            this.cdr.markForCheck();
        }
    }
}
