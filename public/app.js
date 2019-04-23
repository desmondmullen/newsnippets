function displayArticles(saved) {
    let isSaved;
    let theUrl = '/articles';
    if (saved) { theUrl = '/articles/saved' };
    $.getJSON(theUrl, data => {
        doTheDisplaying(data);
    });
};

function doTheDisplaying(data) {
    $('#noteentry').empty();
    $('#notelisttitle').empty();
    $('#notelist').empty();
    document.getElementById('notelist').setAttribute('style', 'padding: 0px');
    $('#articles').empty();
    for (let i = 0; i < data.length; i++) {
        if (data[i].saved) {
            isSaved = `checked='checked'`;
        } else {
            isSaved = ``;
        }
        let theSavedToggle = `<section class='save-switch'>Save Article: 
        OFF <label class='switch'>On
            <input data-id='${data[i]._id}' type='checkbox' ${isSaved} name='savearticle${data[i]._id}' class='saveart saveart${data[i]._id}'>
            <span class='slider round'></span>
        </label> ON</section>`;
        $('#articles').append(`<div class='article-display'><span class='article-title'>${data[i].title}</span><br />${data[i].description}<br /><a href='${data[i].link}' target='_blank'>${data[i].link}</a><div class='article-bar'>${theSavedToggle}<button data-id='${data[i]._id}' data-title='${data[i].title}' id='displaynotes'>See/Add Note(s)</button></div></div><br />`);
    }
};

$(document).on('click', '#scrapearticles', function() {
    $('#noteentry').empty();
    $('#notelisttitle').empty();
    document.getElementById('notelist').setAttribute('style', 'padding: 0px');
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
});

$(document).on('click', '#search', function() {
    if ($('#searchinput').val() === '') {
        displayArticles();
    } else {
        $.ajax({
                method: 'GET',
                url: '/find/' + $('#searchinput').val().trim()
            })
            .then(data => {
                doTheDisplaying(data);
            });
    }
});

document.getElementById('searchinput').addEventListener('keyup', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        if ($('#searchinput').val() === '') {
            displayArticles();
        } else {
            document.getElementById('search').click();
        }
    }
});

$(document).on('click', '#displaynotes', function() {
    let thisId = $(this).attr('data-id');
    let thisTitle = $(this).attr('data-title');
    displayNotes(thisId, thisTitle);
});

function displayNotes(thisId, thisTitle) {
    $('#noteentry').empty();
    $('#notelisttitle').empty();

    $('#notelist').empty();
    $('#titleinput').val('');
    $('#bodyinput').val('');
    $('#noteentry').append(`<div class='notesfor'>Create a note for:</div> <em>${thisTitle}</em>`);
    $('#noteentry').append(`<input id='titleinput' name='title' placeholder='Note title...'>`);
    $('#noteentry').append(`<textarea id='bodyinput' name='body' placeholder='Note body...'></textarea>`);
    $('#noteentry').append(`<section class='align-right'><button data-id='${thisId}' data-title='${thisTitle}' id='savenote'>Save Note</button></section><br>`);
    $.ajax({
            method: 'GET',
            url: '/articles/' + thisId
        })
        .then(data => {
            $('#notelisttitle').html(`<div class='savednotes'>Saved Notes for this article:</div>(Click title to view or edit. Click X to delete.)`);
            $('#notelist').append(`<strong>Title <span class='deleteheader'>Delete<span></strong>`);
            document.getElementById('notelist').setAttribute('style', 'padding: 10px');
            for (let i = 0; i < data.length; i++) {
                $('#notelist').append(`<hr><p data-id='${data[i]._id}'><span class='dataTitle' data-id='${data[i]._id}'>${data[i].title}</span><span class=delete>X</span></p>`);
            }
        });
};

$(document).on('click', '#savenote', function() {
    if ($('#titleinput').val() && $('#bodyinput').val()) {
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
    }
});

$(document).on('click', '.saveart', function() {
    const thisId = $(this).attr('data-id');
    const trueOrFalse = $(this)[0].checked
    $.ajax({
            method: 'POST',
            url: '/articles/' + thisId,
            data: {
                saved: trueOrFalse
            }
        })
        .then(data => {
            $(this)[0].checked = !$(this)[0].checked;
            displayArticles();
        });
});

$(document).on('click', '.delete', function() {
    let selected = $(this).parent();
    $.ajax({
        type: 'GET',
        url: '/delete/' + selected.attr('data-id'),
        success: (response) => {
            selected.remove();
            $('#note').val('');
            $('#title').val('');
            $('#action-button').html(`<button id='make-new'>Submit</button>`);
        }
    });
});

$(document).on('click', '.dataTitle', function() {
    const thisId = $(this).attr('data-id');
    $.ajax({
        type: 'GET',
        url: '/notes/' + thisId,
        success: (data) => {
            $('#noteentry').html(`<h2>Notes for: <em>${data[0].article.title}</em></h2>`);
            $('#noteentry').append(`<input id='titleinput' name='title' >`);
            $('#titleinput').val(data[0].title);
            $('#noteentry').append(`<textarea id='bodyinput' name='body'>${data[0].body}</textarea>`);
            $('#noteentry').append(`<button data-id='${thisId}' data-articleId='${data[0].article._id}' data-title='${data[0].article.title}' id='updatenote'>Update Note</button>`);
        }
    });
});

$(document).on('click', '#updatenote', function() {
    let thisId = $(this).attr('data-id')
    let thisTitle = $(this).attr('data-title')
    let thisArticleId = $(this).attr('data-articleId')
    $.ajax({
        type: 'POST',
        url: '/update/' + thisId,
        dataType: 'json',
        data: {
            title: $('#titleinput').val(),
            body: $('#bodyinput').val()
        },
        success: (data) => {
            displayNotes(thisArticleId, thisTitle);
        }
    });
});