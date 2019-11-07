import {
    Component,
    Input,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ElementRef,
    ViewChild
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {KeyCodes} from '../../../services/common/keyCodes';

export interface IToolbarSearchConfig {
    lookupFunction: (input: string) => Observable<any[]>;
    itemTemplate: (item) => string;
    initValue: string;
    onSelect: (item) => void;
}

@Component({
    selector: 'uni-toolbar-search',
    template: `
        <input type="search" #inputElement
            (keydown)="onKeyDown($event)"
            [formControl]="searchControl"
            (focus)="markText()"
            autocorrect="off"
        />

        <section class="dropdown-menu" *ngIf="expanded" (clickOutside)="close()">
            <a *ngFor="let item of searchResults; let idx = index"
                class="dropdown-menu-item"
                [attr.aria-selected]="idx === selectedIndex"
                (mouseover)="selectedIndex = idx"
                (click)="itemSelected(idx)">

                {{item._displayValue}}
            </a>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniToolbarSearch {
    @Input() public config: IToolbarSearchConfig;
    @ViewChild('inputElement') private input: ElementRef;

    public searchControl: FormControl = new FormControl('');
    public searchResults: any[] = [];
    public expanded: boolean;
    private selectedIndex: number;
    private lookupInProgress: boolean;

    constructor(private cdr: ChangeDetectorRef) {}

    public ngAfterViewInit() {
        this.searchControl.valueChanges
            .do(() => this.lookupInProgress = true)
            .debounceTime(250)
            .subscribe(value => {
                this.config.lookupFunction(value || '')
                    .finally(() => this.lookupInProgress = false)
                    .subscribe(items => {
                        if (items && items.length) {
                            this.searchResults = items.map(item => {
                                item['_displayValue'] = this.config.itemTemplate(item);
                                return item;
                            });

                            this.expanded = true;
                            this.selectedIndex = 0;
                            this.cdr.detectChanges();
                        }
                    });
            });

        if (this.input) {
            this.input.nativeElement.focus();
        }
    }

    public onKeyDown(event: KeyboardEvent) {
        const keyCode = event.which || event.keyCode;
        switch (keyCode) {
            case KeyCodes.UP_ARROW:
                if (this.selectedIndex > 0) {
                    this.selectedIndex--;
                }
            break;
            case KeyCodes.DOWN_ARROW:
                if (this.selectedIndex >= 0) {
                    if (this.selectedIndex < this.searchResults.length - 1) {
                        this.selectedIndex++;
                    }
                } else {
                    this.selectedIndex = 0;
                }
            break;
            case KeyCodes.ENTER:
                this.itemSelected(this.selectedIndex || 0);
            break;
        }
    }

    public close() {
        if (this.expanded) {
            this.searchControl.setValue(this.config.initValue, {emitEvent: false});
            this.expanded = false;
        }
    }

    public itemSelected(index: number, retryCount: number = 0) {
        if (this.lookupInProgress) {
            if (retryCount < 5) {
                setTimeout(() => {
                    retryCount++;
                    this.itemSelected(index, retryCount);
                }, 250);
            }

            return;
        }

        if (this.searchResults[index]) {
            this.config.onSelect(this.searchResults[index]);
            this.close();
        }
    }

    public markText() {
        if (!this.input || !this.input.nativeElement) {
            return;
        }

        this.input.nativeElement.select();
    }
}
