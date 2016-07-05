import {Component, Input, ElementRef} from '@angular/core';
import { GuidService } from '../../../app/services/services';
import { ClickOutsideDirective } from '../../../framework/core/clickOutside';

@Component({
    selector: 'uni-select',
    templateUrl: 'framework/controls/select/select.html',
    directives: [ ClickOutsideDirective ]
})
export class UniSelect {

    @Input() public config: any;
    private guid: string;

    // Is the menu expanded?
    private expanded: boolean = false;
    public selected: any;
    public chosen: any;

    constructor(gs: GuidService, el: ElementRef) {
        // Set a guid for DOM elements, etc.
        this.guid = gs.guid();

        document.addEventListener('keyup', (e: KeyboardEvent) => {
            // Esc to close
            if (e.keyCode === 27) {
                this.close();
            }
        });

        // Keyboard navigation
        el.nativeElement.addEventListener('keyup', (event: KeyboardEvent) => {

            if (event.keyCode === 38) {
                // Arrow up
                this.open();
                this.moveSelection(-1);
            } else if (event.keyCode === 40) {
                // Arrow down
                this.open();
                this.moveSelection(1);
            } else if (event.keyCode === 13 ||
                        event.keyCode === 9) {
                // Enter or tab
                this.chosen = this.selected;
                this.close();
            }
        });

    }

    // Adding named fns for open, close and toggle, just to make the code more
    // readable, as we get into keyboard navigation and the like.
    public open() {
        this.expanded = true;
    }

    public close() {
        // Wrapping this in a timeout, so the Angular loop catches it.
        // (Feel free to find a better way to do this.)
        window.setTimeout(() => {
            this.expanded = false;
        }, 100);
    }

    private toggle() {
        this.expanded = !this.expanded;
    }

    // Choosing an option from the list.
    public choose(option) {
        this.chosen = this.selected = option;
        this.close();
    }

    // Returns the DOM ID for the currently chosen item.
    private activeDescendantID(): any {
        if (!this.chosen){
            return false;
        } else {
            return this.guid + '-item-' + this.config.options.indexOf(this.chosen);
        }
    }

    // Returns the displayText for the currently chosen item
    private chosenDisplayText(): string {
        if (!this.chosen){
            return '';
        } else {
            return this.chosen.displayText;
        }
    }

    // Keyboard navigation within list
    private moveSelection(moveBy) {
        // If we have no results to traverse, return out
        if (!this.config.options) {
            return;
        }

        // If we have no current selection
        if (!this.selected && moveBy >= 0) {
            // If we move down without a selection, start at the top
            return this.selected = this.config.options[0];
        } else if (!this.selected && moveBy < 0) {
            // If we move up without a selection, start at the bottom
            return this.selected = this.config.options[this.config.options.length - 1];
        }

        // If we have a selection already
        let currentIndex = this.config.options.indexOf(this.selected);

        if (currentIndex < 0 ||
            currentIndex + moveBy >= this.config.options.length) {
            // If the selected result is no longer a result, or if we wrap around,
            // then we go to the first item
            this.selected = this.config.options[0];
        } else if (currentIndex + moveBy < 0) {
            // Wrap around the other way
            this.selected = this.config.options[this.config.options.length - 1];
        } else {
            this.selected = this.config.options[currentIndex + moveBy];
        }
    }


}
