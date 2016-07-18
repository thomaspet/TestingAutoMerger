import {IJQItem} from './interfaces';

class Event {

    private isActive: boolean = false;

    constructor(public object: IJQItem, public eventName: string, public handler: any) {
        this.isActive = true;
    }

    public Cleanup() {
        if (this.isActive) {
            this.object.off(this.eventName, this.handler);
            this.isActive = false;
        }
    }
}

// <summary>
//  Helper class that keeps track of domEventshandlers 
//  and enables a central cleanup method for removing all handlers
// </summary>
export class DomEvents {

    private eventList: Array<Event> = [];

    public Create(object: IJQItem, eventName: string, handler: any) {
        object.on(eventName, handler);
        this.eventList.push(new Event(object, eventName, handler));    
    }

    public AddForCleanup(object: IJQItem, eventName: string, handler: any) {
        this.eventList.push(new Event(object, eventName, handler));
    }

    public Cleanup() {
        for (var i = 0; i < this.eventList.length; i++) {
            this.eventList[i].Cleanup();
        }
        this.eventList.length = 0;
    }

}
