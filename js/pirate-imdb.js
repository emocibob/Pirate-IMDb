/**
 * Get the original IMDb title for a TV series from the current page.
 */
function getOriginalTitleForEpisode() {
    var originalTitle = $('META[property="og:title"]').attr('content');
    originalTitle = originalTitle.replace(/ \(TV (Mini\-)?(Series|Episode) .*\)$/, ""); //  Remove "(TV Series/Episode ...)"
    
    return originalTitle;
}

/**
 * Get the original title from the movie or TV series IMDb home page.
 */
function getOriginalTitle() {    
    var originalTitleInDesc = $('.title_wrapper').first().find('.originalTitle');
    if (originalTitleInDesc.length) {
        // Has no year
        var originalTitle = originalTitleInDesc.first().text().replace(/ \(original title\)$/, '');
    } else {
        // Has the year
        var originalTitle = $('.title_wrapper').first().children('h1').text();
    }
    originalTitle = originalTitle.trim();

    var year = $('#titleYear');
    var isAMovie = year !== undefined && year !== null; // TV series have no title year
    if (isAMovie && originalTitleInDesc.length)
        originalTitle += ' ' + year.text();

    originalTitle = originalTitle.replace(/\(([^\(]+)$/, '$1'); // Remove last "("
    originalTitle = originalTitle.replace(/\)$/, ''); // Remove last ")"

    return originalTitle;
}

/**
 * Return a div container filled with torrent links for a movie or an episode of a TV series.
 * For now only TPB is supported (i.e. the function returns a container with 1 link).
 * @param {string} title     - Search term for the torrent sites.
 * @param {boolean} episodes - True if the function returns the container for an episode in an episodes list.
 */
function getLinks(title, episodes) {
    // Link to the torrent site, hardcoded for TPB
    var torrentSiteUrl = 'https://thepiratebay.org/search/' + title + '/0/99/0';

    // Create container for the torrent sites links
    var linksContainer = $('<div></div>');
    linksContainer.addClass('pirate-all-links');
    if(episodes)
        linksContainer.addClass('pirate-next-to-text');
    else
        linksContainer.addClass('pirate-under-title-desc');

    // Create link and append link to episode description
    $('<a></a>', {
        href: torrentSiteUrl,
        text: 'TPB',
        target: '_blank' // Open new tab when clicked
    }).appendTo(linksContainer);

    return linksContainer;
}

/**
 * Add torrent links to all episodes on the current IMDb page.
 */
function tvSeriesEpisodes() {
    // Check if links are alerady added
    if ($('.pirate-all-links').length)
        return; 

    var originalTitle = getOriginalTitleForEpisode();

    var episodes = $('.eplist').first().children();
    var epImageDiv, epDiv, epInfo, season, episode, episodeId, epTitle, links;
    // Add pirate links for each episode
    episodes.each(function() {
        epImageDiv = $(this).children('.image').first();
        // Check if episode has no info
        if (epImageDiv.find('.add-image-container').length) {
            epInfo = epImageDiv.children().eq(1).children().eq(2);
        } else {
            epInfo = epImageDiv.children().first().children().first().children().eq(1);
        }
        
        // Get season and episode number for specific episode
        epInfo = epInfo.text().split(", ");
        season = epInfo[0].replace("S", "");
        episode = epInfo[1].replace("Ep", "");
        if (season.length === 1)
            season = "0" + season;
        if (episode.length === 1)
            episode = "0" + episode;
        episodeId = "S" + season + "E" + episode;

        // This will be the query for the torrent sites
        epTitle = originalTitle + " " + episodeId;
        // Create container for episode links
        links = getLinks(epTitle, true);
        // Append to episode title
        $(this).find('STRONG').first().append(links);
    });
}

/**
 * Add torrent links to an episode home page.
 */
function episodeHomePage() {
    // Check if links are alerady added
    if ($('.pirate-all-links').length)
        return; 

    var epInfo = $('.button_panel.navigation_panel').children('.bp_item.bp_text_only').find('.bp_heading').first().text();
    epInfo = epInfo.split("|")
    var season = epInfo[0].trim().replace(/^Season/, "").trim();
    if (season.length === 1)
        season = "0" + season;
    var epNum = epInfo[1].trim().replace(/^Episode/, "").trim();
    if (epNum.length === 1)
        epNum = "0" + epNum;

    var originalTitle = getOriginalTitleForEpisode(); // Full title with episode name
    originalTitle = originalTitle.replace(/^"/, '').replace(/([^"]+)".*/, '$1'); // Get series title which is wrapped with quotes
    var epTitle = originalTitle + " S" + season + "E" + epNum;
    var links = getLinks(epTitle, false);

    $('.title_wrapper').first().children('.subtext').first().append(links);
}

/**
 * Add torrent links to a movie home page.
 */
function titleHomePage() {
    // Check if links are alerady added
    if ($('.pirate-all-links').length)
        return; 

    var title = getOriginalTitle();
    var links = getLinks(title);

    $('.title_wrapper').first().children('.subtext').first().append(links);
}

/**
 * Call apropiate function for the page type.
 */
function decidePageType() {
    // Check if on a Tv series episodes page
    if (window.location.href.indexOf('episodes') !== -1)
        tvSeriesEpisodes();
    // Check if on a home page for an episode
    else if ($('.title_bar_wrapper').length && $('.titleParentWrapper').length)
        episodeHomePage();
    // Check if on a movie or Tv series IMDb home page
    else if ($('.title_bar_wrapper').length)
        titleHomePage();
}

// Recive any messages from background.js
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // Check if tab updated
        if (request["message"] === "tab_updated")
            decidePageType();
    }
);

// Start script
decidePageType();