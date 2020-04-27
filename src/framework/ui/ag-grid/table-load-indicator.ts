import {Component} from '@angular/core';
import {ILoadingOverlayAngularComp} from 'ag-grid-angular';

@Component({
  selector: 'table-load-indicator',
  template: '<mat-spinner diameter="30"></mat-spinner>',
  styles: [':host { display: flex; justify-content: center; }']
})
export class TableLoadIndicator implements ILoadingOverlayAngularComp {
    agInit() {}
}
