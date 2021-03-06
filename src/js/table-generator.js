const $ = require('jquery');
const constants = require('./constants.js');
if (!$) {
    throw new Error(`jQuery not initialized or found!`);
}

const initSizingTable = () => {
    $.getJSON(constants.patternURL, patterns => {

        patterns.forEach(k => {
            if (k && k.type && k.bodyType) {
                const html = loadTable(k.type, k.bodyType, k);
                $('#table-location').append(html);
            }
        })

        /** Logic */
        function loadTable(fittedType, bodyType, pattern) {
            let html = '';
            
            html += `<h3 style="white-space:pre-wrap;">${fittedType.toUpperCase()} ${bodyType.toUpperCase()} MONOGARMENTS HAVE A:</h3>`;
            html += `<p style="white-space:pre-wrap;">Chest difference between ${pattern.chestDiff.min}" & ${pattern.chestDiff.max}" or above</p>`;
            html += `<p style="white-space:pre-wrap;">And a seat difference between ${pattern.seatDiff.min}" & ${pattern.seatDiff.max}"</p>`;


            const headers1 = pattern.patterns.map(k => k.conditions.chest).reduce((prev, cur) => prev.find(k => k.min === cur.min && k.max === cur.max) ? prev : prev.concat(cur), []);
            const headers2 = pattern.patterns.map(k => k.conditions.seat).reduce((prev, cur) => prev.find(k => k.min === cur.min && k.max === cur.max) ? prev : prev.concat(cur), []);
            const vertHeaders = pattern.patterns.map(k => k.conditions.height).reduce((prev, cur) => prev.find(k => k.min === cur.min && k.max === cur.max) ? prev : prev.concat(cur), []);

            html += `<table class="patterntable">`;
            html += `<tbody>`
            html += headerRow('Chest', headers1);
            html += headerRow('Seat', headers2);

            html += `<th>Height</th>`;
            for (var i = 0; i <= headers1.length; i++) {
                html += `<th></th>`;
            }

            vertHeaders.forEach(h => {
                html += `<tr>`;
                html += `<th>${formatInches(h.min)}&nbsp;-&nbsp;${formatInches(h.max)}</th>`;
                html += `<td></td>`
                for(var i = 0; i < headers2.length; i++) {
                    const foundPattern = pattern.patterns.filter(k => matchValues(k.conditions.seat, headers2[i]))
                        .filter(k => matchValues(k.conditions.height, h))[0];
                    html += `<td>`
                    if (foundPattern) {
                        if (foundPattern.link) {
                            html += `<a href="${foundPattern.link}" target="_blank">${foundPattern.name}</a>`;
                        } else {
                            console.warn(`WARN: Body ${bodyType} FittedType: ${fittedType} Pattern ${foundPattern.name} did not have a link associated with it`);
                            html += foundPattern.name
                        }
                        
                    } else {
                        console.warn(`WARN: Body ${bodyType} FittedType: ${fittedType}  There was no pattern found for Height (${h.min} - ${h.max}) and Seat (${headers2[i].min} - ${headers2[i].max})`);
                    }
                    html += `</td>`
                }


                html += `</tr>`;
            })


            html += `</tbody>`
            html += `</table>`;
            return html;

        }

        function matchValues(left, right) {
            return left.min === right.min && left.max === right.max;
        }

        function headerRow(title, cells) {
            let html = '';
            html += `<tr>`
            html += `<th class="emptycell"></th>`
            html += `<th>${title}</th>`
            cells.forEach(k => {
                html += `<th>${formatInches(k.min)}&nbsp;-&nbsp;${formatInches(k.max)}</th>`
            })
            html += `</tr>`
            return html;
        }

        function formatInches(inches) {
            return `${inches || ""}”`
            // inches = Number(inches);
            // const ft = Math.floor(inches/12);
            // const rem = inches % 12;
            // return `${ft}’${rem}”`;
        }
    })
}

if (!window.__sizingTableInitialized) {
    console.log(`Setting up page load events`)
    $(document).ready(initSizingTable); //handle direct page requests
    window.addEventListener('mercury:load', initSizingTable); //handle page loads from other sources
    window.__sizingTableInitialized = true;
}
