
$( document ).ready(function() {

  var items = [];
  var itemsRaw = [];

  async function datas(){
  $.getJSON('/api/books', function(data) {
     // var items = [];
    itemsRaw = data;
    
    $.each(data, function(i, val) {
      items.push('<li class="bookItem btn btn-light" id="' + i + '">' + val.title + ' - ' + val.commentcount + ' comments</li><br/>');
      return ( i !== 14 );
    });
    
    if (items.length >= 15) {
      items.push('<p>...and '+ (data.length - 15)+' more!</p>');
    }
    
    $('<ul/>', {
      'class': 'listWrapper',
       html: items.join('')
      }).appendTo('#display');
    
  });
  
  }
  
  datas();
  
  var comments = [];
  $('#display').on('click','li.bookItem',function() {
    $("#detailTitle").html('<h2 class="text-primary">'+itemsRaw[this.id].title+'</h2> (Book ID: <code>'+itemsRaw[this.id]._id+')</code>');
    $.getJSON('/api/books/'+itemsRaw[this.id]._id, function(data) {
      comments = [];
      data[0].comments.forEach((comment)=> {
        comments.push("<li>"+comment+"</li>")
      }) // ok upto this point  
      
      
      comments.push('<br/><form id="newCommentForm">'+
                    '<br/><label for="commentToAdd">Add your comment:</label>'+
                    '<textarea id="commentToAdd" name="comment" class="form-control" rows="5" placeholder="Enter valid comment" maxlength="150" ></textarea></form><br/>');
      comments.push('<div class="d-flex flex-row justify-content-between"><button class="btn btn-info addComment" id="'+ data[0]._id+'">Add Comment</button>');
      comments.push('<button class="btn btn-danger deleteBook" id="'+ data[0]._id+'">Delete This Book</button></div>');
      $('#detailComments').html(comments.join(''));
    });
  });
  
  $('#bookDetail').on('click','button.deleteBook',function() {
    $.ajax({
      url: '/api/books/'+this.id,
      type: 'delete',
      success: function(data) {
        //update list
        $('#detailComments').html('<p style="color: red;">'+data.success+'<p><p>Refresh the page</p>');
      }
    });
  });
  
  $('#bookDetail').on('click','button.addComment',function(e) {
    var newComment = $('#commentToAdd').val();
    $.ajax({
      url: '/api/books/'+this.id,
      type: 'post',
      dataType: 'json',
      data: $('#newCommentForm').serialize(),
      success: function(data) {
        if(newComment.match(/[A-Za-z]/)){comments.unshift(newComment); //adds new comment to top of list
        $('#detailComments').html(comments.join('<hr/>'))};
        e.preventDefault();
      }
    });
  });
  
  $('#newBook').click(function() {
    $.ajax({
      url: '/api/books',
      type: 'post',
      dataType: 'json',
      data: $('#newBookForm').serialize(),
      success: function(data) {
        //update list
      }
    });
  });
  
  $('#deleteAllBooks').click(function() {
    $.ajax({
      url: '/api/books',
      type: 'delete',
      dataType: 'json',
      data: $('#newBookForm').serialize(),
      success: function(data) {
        //update list
       $("#detailTitle").html("<h3>" + data.success + "</h3>") 
        $(".listWrapper").html("There is no book collection right now!")
        
      }
    });
  });  
  
  
});