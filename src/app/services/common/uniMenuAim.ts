// Based in large part on [jQuery-menu-aim](https://github.com/kamens/jQuery-menu-aim)

import {Injectable} from '@angular/core';
@Injectable()
export class UniMenuAim {
    public aim(menu: HTMLElement, itemSelector: string, activationCb: (activeElement: HTMLElement) => void): void {

        const rows: any = menu.querySelectorAll(itemSelector),
            tolerance = 75,
            timeout = 500;

        let movements: {x: number, y: number}[] = [],
            lastDelayLoc,
            timeoutId;

        let activationDelay = () => {
            let offset = {left: menu.offsetLeft, top: menu.offsetTop},
                upperLeft = {
                    x: offset.left,
                    y: offset.top - 75
                },
                upperRight = {
                    x: offset.left + menu.offsetWidth,
                    y: upperLeft.y
                },
                lowerLeft = {
                    x: offset.left,
                    y: offset.top + menu.offsetHeight + tolerance
                },
                lowerRight = {
                    x: offset.left + menu.offsetWidth,
                    y: lowerLeft.y
                },
                loc = movements[movements.length - 1],
                prevLoc = movements[0];

            if (!loc || !prevLoc) {
                return 0;
            }

            if (lastDelayLoc &&
                    loc.x === lastDelayLoc.x && loc.y === lastDelayLoc.y) {
                // If the mouse hasn't moved since the last time we checked
                // for activation status, immediately activate.
                return 0;
            }

            let slope = (a, b) => {
                return (b.y - a.y) / (b.x - a.x);
            };

            var decreasingSlope = slope(loc, upperRight),
                increasingSlope = slope(loc, lowerRight),
                prevDecreasingSlope = slope(prevLoc, upperRight),
                prevIncreasingSlope = slope(prevLoc, lowerRight);

            if (decreasingSlope < prevDecreasingSlope &&
                    increasingSlope > prevIncreasingSlope) {
                // Mouse is moving from previous location towards the
                // currently activated submenu. Delay before activating a
                // new menu row, because user may be moving into submenu.
                lastDelayLoc = loc;
                return timeout;
            }

            lastDelayLoc = null;
            return 0;

        };

        let possiblyActivate = (element) => {
            let delay = activationDelay();

            if (delay) {
                timeoutId = setTimeout(() => {
                    possiblyActivate(element);
                }, delay);
            } else {
                activationCb(element);
            }
        };

        menu.addEventListener('mousemove', (e: MouseEvent) => {
            movements.push({
                x: e.clientX,
                y: e.clientY
            });
            if (movements.length >= 3) {
                movements.shift();
            }
        });

        [].forEach.call(rows, (row) => {
            row.addEventListener('mouseenter', (e: MouseEvent) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }

                possiblyActivate(e.target);
            });
        });

    }
}
