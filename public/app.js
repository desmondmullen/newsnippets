function displayArticles(saved) {
    $('#noteentry').empty();
    $('#notelist').empty();
    $('#articles').empty();
    let theUrl = '/articles';
    if (saved) { theUrl = '/articles/saved' };
    $.getJSON(theUrl, data => {
        let isSaved;
        let isNotSaved;
        for (let i = 0; i < data.length; i++) {
            if (data[i].saved) {
                isSaved = `checked='checked'`;
                isNotSaved = ``;
            } else {
                isSaved = ``;
                isNotSaved = `checked='checked'`;
            }
            let theSavedToggle = `Save Article:
        <label class='container'>On
            <input data-id='${data[i]._id}' id='saveon' type='radio' ${isSaved} name='savearticle${data[i]._id}' class='saveon${data[i]._id}'>
            <span class='checkmark'></span>
        </label>
        <label class='container'>Off
            <input data-id='${data[i]._id}' id='saveoff' type='radio' ${isNotSaved} name='savearticle${data[i]._id}' class='saveoff${data[i]._id}'>
            <span class='checkmark'></span>
        </label>`;
            $('#articles').append(`<p>${data[i].title} ${theSavedToggle}<button data-id='${data[i]._id}' data-title='${data[i].title}' id='displaynotes'>See/Add Note(s)</button><br /><a href='${data[i].link}' target='_blank'>${data[i].link}</a><br />${data[i].description}</p>`);
        }
    });
};

$(document).on('click', '#scrapearticles', function() {
    $('#noteentry').empty();
    $('#notelist').empty();
    let stillFetching = true;
    document.getElementById('articles').classList.add('fetching');
    $('#articles').html(`Fetching articles `);
    for (i = 0; i < 25; i++) {
        if (stillFetching === true) {
            setTimeout(function() {
                $('#articles').append(`. `)
            }, i * 300);
        }
    }
    document.getElementById('allarticles').checked = true;
    $.ajax({
            method: 'GET',
            url: '/scrape'
        })
        .then(function(data) {
            stillFetching = false;
            console.log('scrapearticles');
            document.getElementById('articles').classList.remove('fetching');
            displayArticles();
        });
});

displayArticles();

$(document).on('click', '#allarticles', function() {
    displayArticles();
});

$(document).on('click', '#savedarticles', function() {
    displayArticles('saved');
    // $('#noteentry').empty();
    // $('#notelist').empty();
    // $('#articles').empty();
    // $.ajax({
    //         method: 'GET',
    //         url: '/articles/saved'
    //     })
    //     .then(data => {
    //         for (let i = 0; i < data.length; i++) {
    //             $('#articles').append(`<p>${data[i].title} <button data-id='${data[i]._id}' id='savearticle'>Saved</button><button data-id='${data[i]._id}' data-title='${data[i].title}' id='displaynotes'>See/Add Note(s)</button><br /><a href='${data[i].link}' target='_blank'>${data[i].link}</a><br />${data[i].description}</p>`);
    //         }
    //     });
});

$(document).on('click', '#displaynotes', function() {
    let thisId = $(this).attr('data-id');
    let thisTitle = $(this).attr('data-title');
    displayNotes(thisId, thisTitle);
});

function displayNotes(thisId, thisTitle) {
    $('#noteentry').empty();
    $('#notelist').empty();
    $('#titleinput').val('');
    $('#bodyinput').val('');
    $('#noteentry').append(`<h2>Notes for: <em>${thisTitle}</em></h2>`);
    $('#noteentry').append(`<input id='titleinput' name='title' placeholder="New note title...">`);
    $('#noteentry').append(`<textarea id='bodyinput' name='body' placeholder="New note body..."></textarea>`);
    $('#noteentry').append(`<button data-id='${thisId}' data-title='${thisTitle}' id='savenote'>Save Note</button>`);
    console.log('in display notes before ajax ' + thisId);
    $.ajax({
            method: 'GET',
            url: '/articles/' + thisId
        })
        .then(data => {
            console.log('in display notes ' + data);
            for (let i = 0; i < data.length; i++) {
                $("#notelist").prepend("<p class='data-entry' data-id=" + data[i]._id + "><span class='dataTitle' data-id=" +
                    data[i]._id + ">" + data[i].title + "</span><span class=delete>X</span></p>");
            }
        });
};

$(document).on('click', '#savenote', function() {
    const thisId = $(this).attr('data-id');
    const thisTitle = $(this).attr('data-title');
    $.ajax({
            method: 'POST',
            url: '/articles/' + thisId,
            data: {
                title: $('#titleinput').val(),
                body: $('#bodyinput').val()
            }
        })
        .then(data => {
            displayNotes(thisId, thisTitle);
        });
});

$(document).on('click', '#saveon', function() {
    console.log('saving');
    const thisId = $(this).attr('data-id');
    $.ajax({
            method: 'POST',
            url: '/articles/' + thisId,
            data: {
                saved: true
            }
        })
        .then(data => {
            displayArticles();
        });
});

$(document).on('click', '#saveoff', function() {
    console.log('unsaving');
    const thisId = $(this).attr('data-id');
    $.ajax({
            method: 'POST',
            url: '/articles/' + thisId,
            data: {
                saved: false
            }
        })
        .then(data => {
            displayArticles();
        });
});

// $(document).on('click', '#savearticle', function() {
//     console.log('saving');
//     const thisId = $(this).attr('data-id');
//     $.ajax({
//             method: 'POST',
//             url: '/articles/' + thisId,
//             data: {
//                 saved: true
//             }
//         })
//         .then(data => {
//             displayArticles();
//         });
// });

$(document).on("click", ".delete", function() {
    let selected = $(this).parent();
    $.ajax({
        type: "GET",
        url: "/delete/" + selected.attr("data-id"),
        success: (response) => {
            selected.remove();
            $("#note").val("");
            $("#title").val("");
            $("#action-button").html("<button id='make-new'>Submit</button>");
        }
    });
});

$(document).on("click", ".dataTitle", function() {
    const thisId = $(this).attr("data-id");
    $.ajax({
        type: "GET",
        url: "/notes/" + thisId,
        success: (data) => {
            $('#noteentry').html(`<h2>Notes for: <em>${data[0].article.title}</em></h2>`);
            $('#noteentry').append(`<input id='titleinput' name='title' >`);
            $('#titleinput').val(data[0].title);
            $('#noteentry').append(`<textarea id='bodyinput' name='body'>${data[0].body}</textarea>`);
            $('#noteentry').append(`<button data-id='${thisId}' data-articleId='${data[0].article._id}' data-title='${data[0].article.title}' id='updatenote'>Update Note</button>`);
        }
    });
});

$(document).on("click", "#updatenote", function() {
    let thisId = $(this).attr("data-id")
    let thisTitle = $(this).attr("data-title")
    let thisArticleId = $(this).attr("data-articleId")
    $.ajax({
        type: "POST",
        url: "/update/" + thisId,
        dataType: "json",
        data: {
            title: $("#titleinput").val(),
            body: $("#bodyinput").val()
        },
        // On successful call
        success: (data) => {
            displayNotes(thisArticleId, thisTitle);
            // Clear the inputs
            // $("#note").val("");
            // $("#title").val("");
            // // Revert action button to submit
            // $("#action-button").html("<button id='make-new'>Submit</button>");
            // // Grab the results from the db again, to populate the DOM
            // getResults();
        }
    });
});