import {Component, ElementRef, Output, EventEmitter} from '@angular/core';
import * as $ from 'jquery';

export interface IPopupItem {
    label: string;
    name: string;
    cargo?: any;
}

@Component({
    selector: 'popup-menu',
    template: `<ul><li (click)="onMenuItemClicked(item)" *ngFor="let item of items">{{item.label}}</li></ul>`,
    styles: [
        `:host {
            padding: 0;
            border: 1px solid #ccc;
            border-radius: 5px;
            background-color: white;
            box-shadow: 3px 3px 3px #888;
            display: none;
            position: absolute;
            left: 0;
            top: 0;
        }
        ul {
            margin: 0;
            list-style: none;
            white-space: nowrap;
        }
        li {
            cursor: pointer;
            padding: 0.3em 0.7em 0.3em 0.7em;
        }
        li:hover {
            background-color: #efefef;
        }
        `
    ],
    host: {
        '(document:click)': 'onClickOutside()'
      }
})
export class PopupMenu {
    @Output() public menuclick: EventEmitter<any> = new EventEmitter();
    private rootElement: any;
    private clickOutsideHandlerActive: boolean = false;
    private isOpen: boolean = false;
    public items: Array<IPopupItem> = [];
    public tag: any;

    constructor(private myElement: ElementRef) {
        this.rootElement = $(myElement.nativeElement);
    }

    public clear() {
        this.items.length = 0;
    }

    public onMenuItemClicked(item: IPopupItem) {
        this.menuclick.emit(item);
    }

    public addItem(name: string, label: string, cargo?) {
        this.items.push({ name: name, label: label, cargo: cargo });
    }

    public activate(el: Element, tag) {
        if (tag === this.tag && this.IsOpen) {
            this.Hide();
            return;
        }
        this.tag = tag;
        this.MoveTo(el);
    }

    public MoveTo(el: Element) {
        this.Show();
        this.moveNextTo(el);
        this.startActivateClickOutsideHandler();
        this.isOpen = true;
    }

    private startActivateClickOutsideHandler() {
        this.clickOutsideHandlerActive = false;
        setTimeout( () => {
            this.clickOutsideHandlerActive = true;
        });
    }

    public Hide() {
        (<HTMLElement>this.myElement.nativeElement).style.display = 'none';
        this.isOpen = false;
    }

    public onClickOutside() {
        if (this.clickOutsideHandlerActive) {
            this.Hide();
        }
    }

    public Show() {
        (<HTMLElement>this.myElement.nativeElement).style.width = '0';
        setTimeout(() => {
            (<HTMLElement>this.myElement.nativeElement).style.width = null;
        });
        (<HTMLElement>this.myElement.nativeElement).style.display = 'inline-block';
    }

    public get IsOpen() {
        return this.isOpen;
    }

    public moveNextTo(element: Element) {
        var el = $(element);
        var offset = el.offset();
        var wh = $(window).height();
        var boxHeight = this.rootElement.outerHeight();
        var scroll = this.calcScroll(el);
        var upwards = offset.top + boxHeight > wh + scroll;
        if (upwards) {
            offset.top -= (boxHeight + 2);
        } else {
            // offset.top -= (this.rootElement.outerHeight() - el.outerHeight()) / 2;
            offset.left += el.outerWidth() + 5;
        }

        this.rootElement.offset(offset);
        // Width ?
        var cellWidth = el.outerWidth();
        var w = this.rootElement.outerWidth();
        // if (cellWidth < 200) { cellWidth = 200; }
        if (w < cellWidth) {
            this.rootElement.outerWidth(cellWidth);
        }
    }

    private calcScroll(ref): number {
        if (ref.length === 0) { return 0; }
        var st = ref[0].scrollTop;
        if (st) { return st; }
        return this.calcScroll(ref.parent());
    }

}
