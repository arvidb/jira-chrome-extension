function updateSprint() {

    function updateTotal() {
        AJS.$('.ghx-sprint-planned > div').each(function() { 
            var sum = 0.0;
            $(this).find('.js-issue > div').each(function() {
                var t = $( this ).find( 'span.aui-badge' ).text();
                if (t.length > 0) {
                    sum += parseFloat(t);
                }
            });

            var lastBadge = $(this).find('.ghx-stat-total span.aui-badge').last();
            if (lastBadge != null) {
                lastBadge.text(sum + 'h');
                lastBadge.css({ background: "rgba(60,150,0,0.2)" });
            }
        });
    }

    var sprintIssues = [];

    AJS.$('.ghx-sprint-group .js-issue').each(function() {

        try {

            console.log('Found issue list in sprints');

            var row = this;
            var issueKey = AJS.$(this).attr("data-issue-key");

            if (issueKey)
            {
                sprintIssues.push(AJS.$.getJSON(AJS.contextPath() + '/rest/api/latest/issue/' + issueKey, function(data) {

                    //console.log('Got data for - ' + issueKey);

                   	var subtasks = data.fields.subtasks.length;
                   	if (subtasks > 0) {
                        var exist = AJS.$(row).find('#ext-sp-subtasks').length;
                        if (exist > 0) {
                            // Remove existing
                            AJS.$(row).find('#ext-sp-subtasks').remove()
                        }

                        var actions = AJS.$(row).find('.ghx-end .aui-badge');
                        AJS.$(actions).before('<span class="aui-label" title="Subtasks" id="ext-sp-subtasks">' + subtasks + '</span>');
                   	}

                    if (data.fields.aggregatetimeestimate != null || data.fields.aggregatetimeestimate != 'undefined' || data.fields.aggregatetimeestimate != "" || data.fields.aggregatetimeestimate.lenght != 0)
                    {
                        var value2 = data.fields.aggregatetimeestimate / 60 / 60;
                        var actions2 = AJS.$(row).find('.ghx-end .aui-badge');
                        var badge = AJS.$(actions2);
                        badge.html(value2 + "h");
                        badge.css({ background: "rgba(60,150,0,0.2)" });
                    }
                }));
            }
        } catch (ex) {
            console.log("ERROR");
        }
    });

    $.when.apply(null, sprintIssues).then(function(schemas) {
         updateTotal();
    }, function(e) {
         console.log("Failed to get issues");
    });
}

function updateBacklog() {

	var issues = [];

    AJS.$('.ghx-backlog-group .js-issue-list .js-issue').each(function() {
        try {
            console.log('Found issue list in backlog');

            var row = this;
            var issueKey = AJS.$(this).attr("data-issue-key");
            if (issueKey)
            {
                issues.push(AJS.$.getJSON(AJS.contextPath() + '/rest/api/latest/issue/' + issueKey, function(data) {
                        
                    //console.log('Got data for - ' + issueKey);
                   
                    var subtasks = data.fields.subtasks.length;
                   	if (subtasks > 0) {
                        var exist = AJS.$(row).find('#ext-sp-subtasks').length;
                        if (exist > 0) {
                            // Remove existing
                            AJS.$(row).find('#ext-sp-subtasks').remove()
                        }

                    	var actions = AJS.$(row).find('.ghx-end .aui-badge');
                    	AJS.$(actions).before('<span class="aui-label" title="Subtasks" id="ext-sp-subtasks">' + subtasks + '</span>');
                   	}

                    if (data.fields.aggregatetimeestimate != null || data.fields.aggregatetimeestimate != 'undefined' || data.fields.aggregatetimeestimate != "" || data.fields.aggregatetimeestimate.lenght != 0)
                    {
                        var value2 = data.fields.aggregatetimeestimate / 60 / 60;

                        var actions2 = AJS.$(row).find('.ghx-end .aui-badge');
                        var badge = AJS.$(actions2);
                        badge.html(value2 + "h");
                        badge.css({ background: "rgba(60,150,0,0.2)" });
                    }
                }));
            }
        } catch (ex) {
            console.log("ERROR");
        }
    });

    $.when.apply(null, issues).then(function(schemas) {
         //console.log("Done!");
    }, function(e) {
         console.log("Failed to get issues");
    });
}

AJS.$(document).ready(function() {

    var path = window.location.pathname;
    if (path.substring(path.lastIndexOf('/') + 1).indexOf('RapidBoard') > -1) {
        
        AJS.$('#ghx-view-modes').append('<button class="aui-button" id="add-agg-spr">Σ Sprints</center>');
		AJS.$('#ghx-view-modes').append('<button class="aui-button" id="add-agg-bl">Σ Backlog</center>');

        AJS.$('.add-agg-spr').on('click', function() {
            $('add-agg-spr').trigger("click");
        });
        
        AJS.$("#add-agg-spr").click(function() {
            updateSprint();
        });

        AJS.$('.add-agg-bl').on('click', function() {
            $('add-agg-bl').trigger("click");
        });
        
        AJS.$("#add-agg-bl").click(function() {
            updateBacklog();
        });

        // TODO: Auto updates
		/*
        JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED, function(e, context, reason) {
            console.log(reason);
            if (reason == JIRA.CONTENT_ADDED_REASON.pageLoad) {
                console.log('Page loaded');
                update();
            }
            if (reason == JIRA.CONTENT_ADDED_REASON.panelRefreshed) {
                console.log('Page refresh');
                update();
            }
        });*/
    }
});