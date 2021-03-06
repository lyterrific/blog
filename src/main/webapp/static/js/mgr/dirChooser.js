var dirChooser = (function(){
	var dir;
	var modal = '<div class="modal" id="dirChooserModal" tabindex="-1"';
	modal += 'role="dialog" aria-labelledby="fileSelectModalLabel">';
	modal += '<div class="modal-dialog modal-lg" role="document">';
	modal += '<div class="modal-content">';
	modal += '<div class="modal-header">';
	modal += '<button type="button" class="close" data-dismiss="modal"';
	modal += 'aria-label="Close">';
	modal += '<span aria-hidden="true">&times;</span>';
	modal += '</button>';
	modal += '<h4 class="modal-title">文件夹选择</h4>';
	modal += '</div>';
	modal += '<div class="modal-body">';
	modal += '<div class="container-fluid"><div class="row"><select class="form-control"></select></div><div class="row" id="fc_current" style="margin-top:10px"></div><div id="fc_main" class="row" ></div></div>';
	modal += '</div>';
	modal += '<div class="modal-footer">';
	modal += '<button type="button" id="dir-choose-btn" class="btn btn-primary" >确定</button>';
	modal += '<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>';
	modal += '</div>';
	modal += '</div>';
	modal += '</div>';
	modal += '</div>';
	var modal = $(modal).appendTo($('body'));
	var container = $('#fc_main');
	var storeSelector = modal.find('select');
	
	container.on("click","a[data-page]",function(){
		 var page = $(this).attr('data-page');
		 var parent = $(this).attr('data-parent');
		 fileSelectPageQuery(page,parent);
	}); 

	var fileSelectPageQuery = function(page,parent){
		if(!parent || parent == ''){
			dir = {name:"根目录",id:""};
			$("#fc_current").html('<div class="well">当前选择:<b>'+dir.name+'</b></div>');
		}
		var param = {};
		param.currentPage = page;
		if(parent && parent != "")
			param.parent = parent;
		container.html("<img src='"+basePath+"/static/img/loading.gif' class='img-responsive center-block' />")
		$.get(basePath+'/mgr/file/query?type=DIRECTORY',param,function(data){
			if(data.success){
				lastParam = param;
				container.html(getRenderHtml(data.data));
				container.find('[data-toggle="tooltip"]').tooltip();
			} else {
				container.html('<div class="row"><div class="col-md-12"><div class="alert alert-danger">'+data.message+'</div></div></div>');
			}
		})
	}
	
	var getRenderHtml = function(data){
		var html = '';
		var paths = data.paths;
		if(paths.length > 0){
			html += '<div class="row">';
			html += '<div class="col-md-12">';
			html += '<ol class="breadcrumb">';
			html += '<li><a href="###"  data-parent="" data-page="1" >根目录</a></li>'	;
			for(var i=0;i<paths.length;i++){
				var path = paths[i];
				html += '<li><a href="###" data-parent="'+path.id+'" data-page="1" >'+path.path+'</a></li>';
			}
			html += '</ol>';
			html += '</div>';
			html += '</div>';
			var last = paths[paths.length-1];
			dir = {name:last.path,id:path.id};
			$("#fc_current").html('<div class="well">当前选择:<b>'+dir.name+'</b></div>');
		}
		var page = data.page;
		var datas = page.datas;
		html += '<div class="row">';
		html += '<div class="col-md-12"><div class="tip"></div>';
		if(datas.length > 0){
			html += '<div class="row">';
			for(var i=0;i<datas.length;i++){
				var data = datas[i];
				html += '<div class="col-xs-6 col-md-4">';
				html += '<div class="thumbnail text-center">';
				html += '<a href="###" data-page="1" data-parent="'+data.id+'" "><img src="'+basePath+'/static/fileicon/folder.png" class="img-responsive" style="height:100px"/></a>';
				html += '<div class="caption" style="height:35px">';
				var name = data.path
				if(name.length > 10){
					name = name.substring(0,10)+"...";
				}
				html += '<a title="'+data.path+'" data-toggle="tooltip">'+name+'</a>';
				html += '</div>';
				html += '</div>';
				html += '</div>';
			}
			html += '</div>';
		} else {
			html += '<div class="alert alert-info">没有文件夹可供选择</div>'
		}
		if(page.totalPage > 1){
			html += '<div>';
			html += '<ul class="pagination">';
			for(var i=page.listbegin;i<=page.listend-1;i++){
				html += '<li>';
				html += '<a href="###" data-page="'+i+'" data-parent="'+(lastParam.parent ? lastParam.parent : "")+'" >'+i+'</a>';
				html += '</li>';
			}
			html += '</ul>';
			html += '</div>';
		}
		html += '</div>';
		html += '</div>';
		return html;
	}
	
	modal.on('shown.bs.modal',function(){
		dir = undefined;
		fileSelectPageQuery(1,"");
	});
	
	
	$.ajax({
		type : "get",
		url : basePath+"/mgr/file/stores",
        contentType:"application/json",
        async: false,
		data : {},
		success : function(data){
			for(var i=0;i<data.length;i++){
				var store = data[i];
				storeSelector.append('<option value="'+store.id+'">'+store.name+'</option>');
			}
		},
		complete:function(){
		}
	});
	
	
	return {
		
		choose:function(callback){
			if(!callback){
				return ;
			}
			modal.modal('show');
			$("#dir-choose-btn").unbind('click')
			$("#dir-choose-btn").bind('click',function(){
				modal.modal('hide');
				if(dir){
					callback(dir,storeSelector.val());
				}
			});
		}
		
	}
	
})();