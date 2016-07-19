// this function takes the question object returned by the StackOverflow request
// and returns new result to be appended to DOM
var showQuestion = function(question) {
	
	// clone our result template code
	var result = $('.templates .question').clone();
	
	// Set the question properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text(date.toString());

	// set the .viewed for question property in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set some properties related to asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" '+
		'href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
		question.owner.display_name +
		'</a></p>' +
		'<p>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
};

var showAnswerer = function(answerer) {

	console.log(answerer);
	var result = $('.templates .answerer').clone();

	var imageElem = result.find('.image img');
	imageElem.attr('src', answerer.user.profile_image);

	var linkElem = result.find('.image a');
	linkElem.attr('href', answerer.user.link);

	var reputationElem = result.find('.reputation span');
	reputationElem.text(answerer.user.reputation);

	var nameElem = result.find('.name');
	nameElem.text(answerer.user.display_name);

	var scoreElem = result.find('.score');
	scoreElem.text(answerer.score);

	var postsElem = result.find('.posts');
	postsElem.text(answerer.post_count);

	return result;
};

// this function takes the results object from StackOverflow
// and returns the number of results and tags to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' results for <strong>' + query + '</strong>';
	return results;
};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};

// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function(tags) {
	
	// the parameters we need to pass in our request to StackOverflow's API
	var request = { 
		tagged: tags,
		site: 'stackoverflow',
		order: 'desc',
		sort: 'creation'
	};
	//Returns deferred object
	$.ajax({
		url: "https://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",//use jsonp to avoid cross origin issues
		type: "GET",
	})
	.done(function(result){ //this waits for the ajax to return with a succesful promise object
		var searchResults = showSearchResults(request.tagged, result.items.length);
		$('.search-results').html(searchResults);
		//$.each is a higher order function. It takes an array and a function as an argument.
		//The function is executed once for each item in the array.
		$.each(result.items, function(i, item) {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};

var getTopAnswerers = function(answerers) {
	// Parameters we need to pass in our request to StackOverflow's API
	var request = {
		site: 'stackoverflow',
	}

	$.ajax({
		url: "https://api.stackexchange.com/2.2/tags/" + answerers + "/top-answerers/all_time" ,
		data: request,
		dataType: "jsonp",
		type: "GET",
	})
	.done(function(result){
		var searchResults = showSearchResults(answerers, result.items.length);
		$('.answerer-search-results').html(searchResults);
		$.each(result.items, function(index, value) {
			var answerer = showAnswerer(value);
		 	$('.answerer-results').append(answerer);
		})
	})
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});

}

$(document).ready( function() {
	$('.unanswered-getter').submit( function(e){
		e.preventDefault();
		// zero out results if previous search has run
		$('.result-view').show();
		$('.results').html('');
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
		showUnansweredBox();
	});
	$('.inspiration-getter').submit(function(e){
		e.preventDefault();
		$('.result-view').show();
		$('.answerer-results').html('');
		//Get the value of the answerers the user submitted
		var answerers = $(this).find("input[name='answerers']").val();
		//Send API request
		getTopAnswerers(answerers);
		showAnswererBox();
	});
	$('#unanswered-view').click(function(){
		showUnansweredBox();
	});
	$('#answerers-view').click(function(){
		showAnswererBox();
	});
});

var showAnswererBox = function() {
	$('.results-container').hide();
	$('.answerer-container').show();
	$('#answerers-view').css('background-color', "#9999ff");
	$('#unanswered-view').css('background-color', "#e6e6ff");
}

var showUnansweredBox = function() {
	$('.answerer-container').hide();
	$('.results-container').show();
	$('#answerers-view').css('background-color', "#e6e6ff");
	$('#unanswered-view').css('background-color', "#9999ff");
}