var THEME_COLOR   = "#7fcf9a";
var THEME_COLOR_2 = "#1DC0F0";

// https://stackoverflow.com/a/28056903
function hexToRGB(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
}

function aggregateEstimates(row) {
    "use strict";
    
    var action,
        issueKey = AJS.$(row).attr("data-issue-key");
    
    try {
        // console.log("Found issue list");
        
        if (issueKey) {
            action = AJS.$.getJSON(AJS.contextPath() + "/rest/api/latest/issue/" + issueKey, function (data) {
                
                //console.log("Got data for - " + issueKey);
                var subtasks = data.fields.subtasks.length;
                
                if (subtasks > 0) {
                    var exist = AJS.$(row).find("#ext-sp-subtasks").length;
                    if (exist > 0) {
                        // Remove existing
                        AJS.$(row).find("#ext-sp-subtasks").remove();
                    }
                    var actions = AJS.$(row).find(".ghx-end .aui-badge");
                    AJS.$(actions).before('<span class="aui-label" title="Subtasks" id="ext-sp-subtasks">' + subtasks + "</span>");
                }
                
                if (data.fields.aggregatetimeestimate !== null
                        || data.fields.aggregatetimeestimate !== "undefined"
                        || data.fields.aggregatetimeestimate !== ""
                        || data.fields.aggregatetimeestimate.lenght !== 0) {
                    
                    var value2 = data.fields.aggregatetimeestimate / 60 / 60;
                    value2 = Math.round(value2 * 100) / 100;
                    var actions2 = AJS.$(row).find(".ghx-end .aui-badge");
                    var badge = AJS.$(actions2);
                    badge.html(value2 + "h");
                    badge.css({
                        background: hexToRGB(THEME_COLOR, 0.2)
                    });
                }
            });
        }
    } catch (ex) {
        console.log("ERROR");
    }
    
    return action;
}

function updateSprint() {
    "use strict";

    function updateTotal() {
        AJS.$(".ghx-sprint-planned").each(function () {

            var printId = $(this).attr('data-sprint-id')

            var sum = 0.0;
            $(this).find(".js-issue > div").each(function () {
                var t = $(this).find("span.aui-badge").text();
                if (t.length > 0) {
                    sum += parseFloat(t);
                }
            });
            var lastBadge = $(this).find(".ghx-stat-total span.aui-badge").last();
            if (lastBadge !== null) {
                lastBadge.text(sum + "h");
                lastBadge.css({
                    background: hexToRGB(THEME_COLOR, 0.2)
                });
            }

            var statTot = $(this).find(".ghx-stat-total").last();
            if (statTot !== null) {
                var exist = statTot.find("#spr-rem-lbl").length;
                if (exist > 0) {
                    // Remove existing
                    statTot.find("#spr-rem-lbl").remove();
                }

                var exist = statTot.find("#spr-rem-badge").length;
                if (exist > 0) {
                    // Remove existing
                    statTot.find("#spr-rem-badge").remove();
                }

                var totalTime = parseFloat(AJS.$("#spr-tot-hour-" + printId).val())
                var rem = totalTime - sum

                statTot.append('<span id="spr-rem-lbl" class="ghx-label">Time Left</span><span id="spr-rem-badge" style="background: ' + hexToRGB(THEME_COLOR_2, 0.2) + ';" class="aui-badge ghx-estimate-badge">' + rem + 'h</span>')                
            }

            localStorage.setItem("sprint-time-tot-" + printId, AJS.$("#spr-tot-hour-" + printId).val());
        });
    }
    
    var issues = [];    

    AJS.$(".ghx-sprint-group .js-issue").each(function () {
        issues.push(aggregateEstimates(this));
    });
    
    $.when.apply(null, issues).then(function (schemas) {
        updateTotal();
    }, function (e) {
        console.log("Failed to get issues");
    });
}

function updateBacklog() {
    "use strict";
    
    var issues = [];
    
    AJS.$(".ghx-backlog-group .js-issue-list .js-issue").each(function () {
        issues.push(aggregateEstimates(this));
    });
    
    $.when.apply(null, issues).then(function (schemas) {
        //console.log("Done!");
    }, function (e) {
        console.log("Failed to get issues");
    });
}

function addSprintTimeInput() {

        AJS.$(".ghx-sprint-planned").each(function () {

            var printId = $(this).attr('data-sprint-id')

            var statTot = $(this).find(".ghx-stat-total").last();
            if (statTot !== null) {
                var exist = statTot.find("#spr-tot-hour").length;
                if (exist > 0) {
                    // Remove existing
                    statTot.find("#spr-tot-hour").remove();
                }

                statTot.prepend('<input type="number" class="ghx-fieldtype-number" id="spr-tot-hour-' + printId + '" placeholder="Available Sprint Hours" step="1" style="margin-left: 10px"/>');

                AJS.$("#spr-tot-hour-" + printId).val(localStorage.getItem("sprint-time-tot-" + printId));
            }
        });
}

AJS.$(document).ready(function () {
    "use strict";
    
    var path = window.location.pathname;
    
    if (path.substring(path.lastIndexOf("/") + 1).indexOf("RapidBoard") > -1) {            

        AJS.$("#ghx-view-modes").append('<button class="aui-button aui-button-primary" id="add-agg-spr">Σ Sprints</button>');
        AJS.$("#ghx-view-modes").append('<button class="aui-button aui-button-primary" id="add-agg-bl">Σ Backlog</button>');

        addSprintTimeInput()

        AJS.$("#add-agg-spr").css({
                    background: THEME_COLOR
                });
        AJS.$("#add-agg-bl").css({
                    background: THEME_COLOR
                });
        
        AJS.$("#add-agg-spr").click(function () {
            updateSprint();
        });
        
        AJS.$("#add-agg-bl").click(function () {
            updateBacklog();
        });
        
        // TODO: Auto updates
        /*
        JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED, function(e, context, reason) {
            console.log(reason);
            if (reason == JIRA.CONTENT_ADDED_REASON.pageLoad) {
                console.log("Page loaded");
                update();
            }
            if (reason == JIRA.CONTENT_ADDED_REASON.panelRefreshed) {
                console.log("Page refresh");
                update();
            }
        });*/
    }
});