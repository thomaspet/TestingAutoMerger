class Event {

    private isActive = false;

    constructor(public object: JQuery, public eventName: string, public handler: any) {
        this.isActive = true;
    }

    Cleanup() {
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

    eventList = [];

    Create(object: JQuery, eventName: string, handler: any) {
        object.on(eventName, handler);
        this.eventList.push(new Event(object, eventName, handler));    
    }

    AddForCleanup(object: JQuery, eventName: string, handler: any) {
        this.eventList.push(new Event(object, eventName, handler));
    }

    Cleanup() {
        for (var i = 0; i < this.eventList.length; i++) {
            this.eventList[i].Cleanup();
        }
        this.eventList.length = 0;
    }

}