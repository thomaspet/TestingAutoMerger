import {Component, Input, OnInit} from "angular2/core";

@Component({
    selector: "uni-spinner",
    template: `
        <div [attr.aria-busy]="isBusy" [hidden]="isBusy">
            <ng-content></ng-content>
        </div>
    `
})
export class UniSpinner implements OnInit {

    @Input('waitFor')
    $busy: any;

    isBusy = true;

    ngOnInit() {
        var self = this;
        if (this.$busy.subscribe) {
            this.isBusy = true;
            this.$busy.subscribe(()=> {
                self.isBusy = false;
            });
        } else {
            this.isBusy = !!this.$busy;
        }

    }

    refresh() {
        this.ngOnInit();
    }

    setBusy(value: boolean) {
        this.isBusy = value;
    }
}
