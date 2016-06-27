import {ITypeSearch} from './interfaces';
import {DomEvents} from './domevents';

export enum DropListNavigation {
    UP = 38,
    DOWN = 40,
    PAGEDOWN = 34,
    PAGEUP = 33,
    ENTER = 13,
    TAB = 9,
    ESC = 27
}
    
// 1. creates scrollable droplist inside given parent element
// 2. should drop-upwards if to low on screen
// 3. todo: should move-leftwards if to much on the right side

export class DropList {
    
    private details: ITypeSearch;
    private items: Array<any>;
    private editorElement: JQuery;
    private rootElement: JQuery;        
    private itemsParent: JQuery;
    private isVisible = false;
    private domEventHandlers = new DomEvents();
    private template = "<div class='droplist' tabindex='50' ></div>";
    private rowIndex = -1;
    private parentColIndex = -1;

    public onClick: (rowIndex: number, item: any, details: ITypeSearch) => void;


    public getCurrentRowIndex(): number {
        return this.rowIndex;
    }

    public raiseClickEvent(row: number): boolean {
        if (row >= 0 && this.items && this.items.length > 0) {
            this.onClick(row, this.items[row], this.details);
            return true;
        }
        return false;
    }

    public navigate(direction: DropListNavigation): boolean {
        switch (direction) {
            case DropListNavigation.UP:
                if (this.rowIndex <= 0) return true; // block up-key when on top
                return this.showSelectedRow(this.rowIndex - 1);
            case DropListNavigation.DOWN:
                if (this.rowIndex >= this.items.length - 1) return true; //block down-key when on bottom
                return this.showSelectedRow(this.rowIndex + 1);
        }
        return false;
    }

    public setParentElement(el: any) {
        this.editorElement = el;
    }

    public destroy() {
        this.domEventHandlers.Cleanup();
        if (this.rootElement) {
            this.rootElement.remove();
            this.rootElement = undefined;
        }
    }

    public isOpen() {
        return this.isVisible;
    }

    public showSelectedRow(rowIndex: number): boolean {
        if (this.items && this.items.length > rowIndex) {
            var current = this.getRowElement(this.rowIndex);
            var item = this.getRowElement(rowIndex);
            if (this.rowIndex >= 0) {
                this.showSelectedStyleOnElement(current, false);
            }
            this.showSelectedStyleOnElement(item, true);
            this.rowIndex = rowIndex;
            return true;
        }
        return false;
    }

    private getRowElement(rowIndex: number): JQuery {
        if (this.itemsParent && rowIndex>=0) {
            var listParent = this.itemsParent.children().eq(0);
            if (listParent && listParent.length) {
                return listParent.children().eq(rowIndex);
            }
        }
        return undefined;
    }

    private showSelectedStyleOnElement(el: JQuery, show = true) {
        if (el) {
            if (show) {
                el.addClass("dropselect");
                scrollToView(el, this.itemsParent);
            } else {
                el.removeClass("dropselect");
            }
        }
    }

    public hide() {
        if ((this.rootElement) && (this.isVisible)) {
            this.rootElement.hide();
            this.isVisible = false;
        }
        this.parentColIndex = -1;
        this.rowIndex = -1;
    }

    public moveNextToEditor() {
        var offset = this.editorElement.offset();
        var wh = $(window).height();
        var boxHeight = this.rootElement.outerHeight();
        var scroll = this.calcScroll(this.editorElement);
        var upwards = offset.top + boxHeight > wh + scroll;
        if (upwards) {
            offset.top -= (boxHeight + 2);
        } else {
            offset.top += this.editorElement.outerHeight();
        }
        this.rootElement.offset(offset);
        // Width ?
        var cellWidth = this.editorElement.outerWidth();
        if (this.rootElement.outerWidth()< cellWidth) {
            this.rootElement.outerWidth(cellWidth);
        }
    }

    private calcScroll(ref: JQuery): number {
        if (ref.length === 0) return 0;
        var st = ref[0].scrollTop;
        if (st) return st;
        return this.calcScroll(ref.parent());
    }

    public show(details: ITypeSearch, data: Array<any> = null) {
        this.parentColIndex = details.position.col;            
        this.details = details;
        if (details.promise && data === null) {
            details.promise.then((result: any) => {
                if (details.position.col === this.parentColIndex) {
                    this.show(details, result || []);
                }
            });
        } else {
            if (this.ensureSelfElement()) {
                var items = data || details.rows;
                var txt = this.buildContent(items, details.renderFunc);
                this.itemsParent.html("<ul>" + txt + "</ul>");
                if (!this.isVisible) {
                    this.rootElement.show();
                    this.isVisible = true;
                }
                this.moveNextToEditor();
                this.items = items;
                
                this.itemsParent[0].scrollTop = 0;
                this.rowIndex = -1;
            }
        }
    }

    private buildContent(data: Array<any>, renderFunc: (item: any) => string): string {
        var txt = "", value = "";
        for (var i = 0; i < data.length; i++) {
            if (renderFunc) {
                value = renderFunc(data[i]);
            } else {
                value = data[i];
            }
            txt += "<li>" + value + "</li>";
        }
        return txt;
    }

    private ensureSelfElement(): boolean {
        if (!this.rootElement) {
            return this.createSelf();
        }
        return true;
    }

    private createSelf(): boolean {
        this.rootElement = $(this.template);
        this.editorElement.parent().parent().append(this.rootElement);
        this.itemsParent = this.rootElement; 

        this.domEventHandlers.Create(this.itemsParent, "click", (event) => {
            if (this.onClick) {
                var row = $(event.target).index();
                this.raiseClickEvent(row);
            }
        });

        this.moveNextToEditor();
        return true;
    }

}

export function scrollToView(element: JQuery, parent: JQuery) {
    var li:any = element[0];
    // scroll UL to make li visible
    // li can be the li element or its id
    if (typeof li !== "object") {
        li = document.getElementById(li);
    }
    var ul = parent[0]; // li.parentNode;
    // fudge adjustment for borders effect on offsetHeight
    var fudge = 4;
    // bottom most position needed for viewing
    var bottom = (ul.scrollTop + (ul.offsetHeight - fudge) - li.offsetHeight);
    // top most position needed for viewing
    var top = ul.scrollTop + fudge;
    if (li.offsetTop <= top) {
        // move to top position if LI above it
        // use algebra to subtract fudge from both sides to solve for ul.scrollTop
        ul.scrollTop = li.offsetTop - fudge;
    } else if (li.offsetTop >= bottom) {
        // move to bottom position if LI below it
        // use algebra to subtract ((ul.offsetHeight - fudge) - li.offsetHeight) from both sides to solve for ul.scrollTop
        ul.scrollTop = li.offsetTop - ((ul.offsetHeight - fudge) - li.offsetHeight);
    }

}

