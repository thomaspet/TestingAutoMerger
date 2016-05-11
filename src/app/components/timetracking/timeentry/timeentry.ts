import {Component} from "@angular/core";

@Component({
    selector: "timeentry",
    template: "<h3>Time-entry</h3>"    
})
export class TimeEntry {    
    constructor() {
        console.log("TimeEntry (sub)view constructor");
    }
}