var publishing = false;
var tags = [];

var summaryEditor = CodeMirror.fromTextArea(document.getElementById('summary'),
		{
			mode : 'gfm',
			lineNumbers : false,
			matchBrackets : true,
			lineWrapping : true,
			theme : 'base16-light',
			dragDrop : false,
			extraKeys : {
				"Enter" : "newlineAndIndentContinueMarkdownList",
				"Alt-F" : "findPersistent",
				"Ctrl-A" : "selectAll"
			}
		});

$("#baseModal .CodeMirror").css({
	"height" : "300px"
});

function showBase() {
	$("#baseModal").modal('show');
}

function openFile() {
	fileSelectPageQuery(1, '');
	$("#fileSelectModal").modal("show");
}

$(function() {

	$
			.get(
					basePath + '/mgr/lock/all',
					{},
					function(data) {
						var oldLock = $("#oldLock").val();
						if (data.success) {
							var locks = data.data;
							if (locks.length > 0) {
								var html = '';
								html += '<div class="form-group">'
								html += '<label for="lockId" class="control-label">锁:</label> ';
								html += '<select id="lockId" class="form-control">';
								html += '<option value="">无</option>';
								for (var i = 0; i < locks.length; i++) {
									var lock = locks[i];
									if (lock.id == oldLock) {
										html += '<option value="' + lock.id
												+ '" selected="selected">'
												+ lock.name + '</option>';
									} else {
										html += '<option value="' + lock.id
												+ '">' + lock.name
												+ '</option>';
									}
								}
								html += '</select>';
								html += '</div>';
								$("#lock_container").html(html);
							}
						} else {
							console.log(data.data);
						}
					});

	$("#status").change(function() {
		if ($(this).val() == 'SCHEDULED') {
			$("#scheduleContainer").show();
		} else {
			$("#scheduleContainer").hide();
		}
	});

	var oldTags = $("#oldTags").val();
	if (oldTags != '') {
		var oldTagArray = oldTags.split(",");
		for (var i = 0; i < oldTagArray.length; i++) {
			var tag = oldTagArray[i];
			if (tag != '') {
				addTag(tag);
				renderTag();
			}
		}
	}
	var oldSpace = $("#oldSpace").val();
	if (oldSpace != "") {
		$("#space").val(oldSpace);
	}

	$("#tags-input")
			.on(
					'input',
					function(e) {
						var me = $(this);
						var tag = me.val();
						$("#add-tag-sign").remove();
						if ($.trim(tag).length > 0) {
							$("#tags-input")
									.after(
											'<a onclick="_addTag()" class="glyphicon glyphicon-ok-sign form-control-feedback form-control-clear" id="add-tag-sign" style="pointer-events: auto; text-decoration: none;cursor: pointer;"></a>');
						}
					});

	setInterval(function() {
		save();
	}, 10000);

	$("#submit-art").click(function() {
		publishing = true;
		var me = $(this);
		var article = getArticle();
		me.prop("disabled", true);
		var url = "";
		if (article.id && article.id != null) {
			url = basePath + "/mgr/article/update";
		} else {
			url = basePath + "/mgr/article/write";
		}
		$.ajax({
			type : "post",
			url : url,
			contentType : "application/json",
			data : JSON.stringify(article),
			success : function(data) {
				if (data.success) {
					bootbox.alert("保存成功");
					setTimeout(function() {
						window.location.href = basePath + '/mgr/article/index';
					}, 500)
				} else {
					$("#error-tip").html(data.message).show();
					publishing = false;
				}
			},
			complete : function() {
				me.prop("disabled", false);
			}
		});
	});

	$("#baseModal").on("show.bs.modal", function() {
		$("#error-tip").html('').hide();
	});

	$("#baseModal").on("shown.bs.modal", function() {
		summaryEditor.refresh();
	});

	$("#stackeditModal").on('hidden.bs.modal', function() {
		showStackedit();
	});

});

function _addTag() {
	var me = $("#tags-input");
	addTag($.trim(me.val()));
	renderTag();
	me.val("");
	$("#add-tag-sign").remove();
}

function getArticle() {
	var article = {};
	article.title = $("#title").val();
	if ($.trim(article.title) == "") {
		article.title = "No title";
	}
	article.content = editor.getValue();
	article.from = $("#from").val();
	article.status = $("#status").val();
	if ($("#level").val() != '') {
		article.level = $("#level").val();
	}
	if (article.status == 'SCHEDULED') {
		article.pubDate = $("#scheduleDate").val()
	}
	;
	article.isPrivate = $("#private").prop("checked");
	article.allowComment = $("#allowComment").prop("checked");
	article.tags = tags;
	article.featureImage = $("#featureImage").val();
	article.summary = summaryEditor.getValue();
	article.space = {
		"id" : $("#space").val()
	};
	article.editor = 'MD';
	if ($("#lockId").val() != "") {
		article.lockId = $("#lockId").val();
	}
	article.alias = $("#alias").val();
	if ($("#id").val() != "") {
		article.id = $("#id").val();
	}
	return article;
}

function save() {
	if (publishing) {
		return;
	}
	var article = getArticle();
	article.status = 'DRAFT';
	if (article.content == '') {
		return;
	}
	var url = "";
	if (article.id && article.id != null) {
		url = basePath + "/mgr/article/update";
	} else {
		url = basePath + "/mgr/article/write";
	}
	publishing = true;
	$.ajax({
		type : "post",
		url : url,
		async : false,
		contentType : "application/json",
		data : JSON.stringify(article),
		success : function(data) {
			if (data.success) {
				$("#id").val(data.data.id);
			}
		},
		complete : function() {
			publishing = false;
		}
	});
}

function showTagError(error) {
	if ($("#tag-tip").length == 0)
		$("#tags-input").before(error);
	setTimeout(function() {
		$("#tag-tip").remove();
	}, 1000);
}

function addTag(tag) {
	var tag = $.trim(tag);
	if (tags.length >= 10) {
		showTagError('<span id="tag-tip" class="text text-danger">最多只能有10标签</span>')
	} else if (tag == "" || tag.length > 20) {
		showTagError('<span id="tag-tip" class="text text-danger">标签名在1~20个字符之间</span>')
	} else {
		for (var i = 0; i < tags.length; i++) {
			var _tag = tags[i];
			if (_tag.name == tag) {
				showTagError('<span id="tag-tip" class="text text-danger">已经存在该标签</span>')
				$("#tags-input").val("");
				return;
			}
		}
		tags.push({
			"name" : $.trim(tag)
		});
	}
}

function renderTag() {
	if (tags.length == 0) {
		$("#tags-container").html('');
		return;
	}
	var html = '<div class="table-responsive"><table class="table table-borderless">';
	if (tags.length > 5) {
		html += '<tr>';
		for (var i = 0; i < 5; i++) {
			html += getLabel_html(tags[i].name);
		}
		html += '</tr>';
		html += '<tr>';
		for (var i = 5; i < tags.length; i++) {
			html += getLabel_html(tags[i].name);
		}
		html += '</tr>';
	} else {
		html += '<tr>';
		for (var i = 0; i < tags.length; i++) {
			html += getLabel_html(tags[i].name);
		}
		html += '</tr>';
	}
	html += '<table></div>';
	$("#tags-container").html(html);
}

function save() {
	if (publishing) {
		return;
	}
	var article = getArticle();
	article.status = 'DRAFT';
	if (article.content == '') {
		return;
	}
	var url = "";
	if (article.id && article.id != null) {
		url = basePath + "/mgr/article/update";
	} else {
		url = basePath + "/mgr/article/write";
	}
	publishing = true;
	$.ajax({
		type : "post",
		url : url,
		async : false,
		contentType : "application/json",
		data : JSON.stringify(article),
		success : function(data) {
			if (data.success) {
				$("#id").val(data.data.id);
				// showAutoSaveTip(new Date());
			}
		},
		complete : function() {
			publishing = false;
		}
	});
}

function getLabel_html(tag) {
	return '<td><span class="label label-success">'
			+ tag
			+ '<a href="###" onclick="removeTag($(this))" style="margin-left:5px"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a></span></td>';
}

function removeTag(o) {
	var tag = o.parent().text();
	for (var i = 0; i < tags.length; i++) {
		if (tags[i].name == tag) {
			tags.splice(i, 1);
			renderTag();
			return;
		}
	}
}

function showAutoSaveTip(time) {
	$("#auto-save-tip").remove();
	var hour = time.getHours();
	var minute = time.getMinutes();
	var second = time.getSeconds();
	if (hour < 10) {
		hour = "0" + hour;
	}
	if (minute < 10) {
		minute = "0" + minute;
	}
	if (second < 10) {
		second = "0" + second;
	}
	$('body')
			.append(
					'<div id="auto-save-tip"  style="position:fixed;top:0;text-align:center;width:100%"><div class="alert alert-info" style="width:200px;margin:0 auto;margin-top:5px;z-index:9999999;">'
							+ (hour + ':' + minute + ':' + second)
							+ '自动保存成功</div></div>');
	setTimeout(function() {
		$("#auto-save-tip").remove();
	}, 1500);
}

function previewSummary(o) {
	var content = summaryEditor.getValue();
	var html = md.render(content);
	o.removeClass("glyphicon-eye-open").addClass("glyphicon-eye-close").attr(
			"onclick", "inputSummry($(this))");
	$("#summary-content").hide();
	$("#summary-rendered").html(html).show();
}

function inputSummry(o) {
	o.removeClass("glyphicon-eye-close").addClass("glyphicon-eye-open").attr(
			"onclick", "previewSummary($(this))");
	$("#summary-rendered").html('').hide();
	$("#summary-content").show();
}

function bold() {
	var text = editor.getSelection();
	if (text == '') {
		editor.replaceRange("****", editor.getCursor());
		editor.focus();
		var str = "**";
		var mynum = str.length;
		var start_cursor = editor.getCursor();
		var cursorLine = start_cursor.line;
		var cursorCh = start_cursor.ch;
		editor.setCursor({
			line : cursorLine,
			ch : cursorCh - mynum
		});
	} else {
		editor.replaceSelection("**" + text + "**");
	}
}

function italic() {
	var text = editor.getSelection();
	if (text == '') {
		editor.replaceRange("**", editor.getCursor());
		editor.focus();
		var str = "*";
		var mynum = str.length;
		var start_cursor = editor.getCursor();
		var cursorLine = start_cursor.line;
		var cursorCh = start_cursor.ch;
		editor.setCursor({
			line : cursorLine,
			ch : cursorCh - mynum
		});
	} else {
		editor.replaceSelection("*" + text + "*");
	}
}

function blockQuote() {
	var text = editor.getSelection();
	if (text == '') {
		editor.replaceRange("> ", editor.getCursor());
		editor.focus();
		var start_cursor = editor.getCursor();
		var cursorLine = start_cursor.line;
		var cursorCh = start_cursor.ch;
		editor.setCursor({
			line : cursorLine,
			ch : cursorCh
		});
	} else {
		editor.replaceSelection("> " + text);
	}
}