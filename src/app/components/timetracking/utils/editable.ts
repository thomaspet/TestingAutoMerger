import {Directive, AfterViewInit, Input, ElementRef, OnDestroy} from '@angular/core';
declare var jQuery;

@Directive({
    selector: '[editable]'
})
export class Editable implements AfterViewInit, OnDestroy {
    
    jqRoot: any;
    name = "test";
     handlers = {
         onClick: undefined,         
     }
    
    constructor(el:ElementRef) {
        this.jqRoot = jQuery(el.nativeElement);
        
        this.handlers.onClick = (event) => {
            this.onClick(event);
        };
        
        var ref = this.jqRoot.on('click', this.handlers.onClick);
    }
    
    public ngAfterViewInit() {
        console.info("afterViewInit(editable)");
    }
    

   public ngOnDestroy() {
       console.info("onDestroy(editable)");
       this.jqRoot.off('click', this.handlers.onClick);
    }
    
    private onClick(event) {
        console.info("onClick => " + this.name);
    }
    
}