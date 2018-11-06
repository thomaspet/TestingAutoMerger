export function hasEvent(events, event) {
    if (!events) {
        return false;
    }
    const eventName = getEventName(event);
    return !!events[eventName];
}

export function runEvent(events, event, model, context) {
    const eventName = getEventName(event);
    if (hasEvent(events, event)) {
       return events[eventName](model, event, context);
    }
    return true;
}

export function getEventName(event: KeyboardEvent) {
    const hasCtrl = event.ctrlKey;
    const hasShift = event.shiftKey;
    const key: string = event.key.toLowerCase();
    const eventNameParts = [];
    if (hasCtrl) {
        eventNameParts.push('ctrl');
    }
    if (hasShift) {
        eventNameParts.push('shift');
    }
    eventNameParts.push(key);
    return eventNameParts.join('_');
}
