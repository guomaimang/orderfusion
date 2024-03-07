$(function () {
    //隐藏错误提示框
    $('.alert-danger').css("display", "none");

    $('#userModal').modal('hide');

    $("#jqGrid").jqGrid({
        // 设置API
        url: 'admin/user/list',
        datatype: "json",
        colModel: [
            // 设置列表表头
            {label: 'ID', name: 'id', index: 'id', width: 30, key: true, hidden: false},
            {label: 'Name', name: 'name', index: 'name', width: 50},
            {label: 'Email', name: 'email', index: 'email', width: 120},
            {label: 'Registration Time', name: 'registerTime', index: 'registerTime', width: 120},
            {label: 'Frozen', name: 'isFrozen', index: 'isFrozen', width: 30},
        ],
        height: 560,
        rowNum: 10,
        rowList: [10, 20, 50],
        styleUI: 'Bootstrap',
        loadtext: 'Information reading in progress...',
        rownumbers: false,
        rownumWidth: 20,
        autowidth: true,
        multiselect: true,
        pager: "#jqGridPager",
        jsonReader: {
            root: "data.list",
            page: "data.currPage",
            total: "data.totalPage",
            records: "data.totalCount"
        },
        prmNames: {
            page: "page",
            rows: "limit",
            order: "order",
        },
        gridComplete: function () {
            //隐藏grid底部滚动条
            $("#jqGrid").closest(".ui-jqgrid-bdiv").css({"overflow-x": "hidden"});
        },
    });
    $(window).resize(function () {
        $("#jqGrid").setGridWidth($(".card-body").width());
    });
});



/**
 * 数据验证
 */
function validObject() {
    var articleName = $('#articleName').val();
    if (isNull(articleName)) {
        showErrorInfo("The title can not be blank!");
        return false;
    }
    if (!validLength(articleName, 120)) {
        showErrorInfo("Title characters cannot be larger than 120!");
        return false;
    }
    var articleAuthor = $('#articleAuthor').val();
    if (isNull(articleAuthor)) {
        showErrorInfo("Author cannot be empty!");
        return false;
    }
    var ariticleContent = editorD.txt.html();
    if (isNull(ariticleContent) || ariticleContent == 'Please enter...') {
        showErrorInfo("Content cannot be empty!");
        return false;
    }
    if (!validLength(ariticleContent, 3000)) {
        showErrorInfo("Content characters cannot be larger than 3000!");
        return false;
    }
    return true;
}

/**
 * 重置 modal 表单数据
 */


// Grid 顶部的操作按钮

function addUser() {
    reset();
    $('.modal-title').html('Add');
    $('#userModal').modal('show');
}
function editUser() {
    reset();
    $('.modal-title').html('Edit');

    let id = getSelectedRow();
    if (id == null) {
        return;
    }
    //请求数据
    $.get("admin/user/info/" + id, function (r) {
        if (r.code === 0 && r.data != null) {
            //填充数据 至 modal
            $('#modal-id').val(r.data.id);
            $('#modal-email').val(r.data.email);
            $('#modal-name').val(r.data.name);
            $('#modal-registerTime').val(r.data.registerTime);
            $('#modal-isFrozen').val(r.data.isFrozen);
        }
    });
    //显示 modal
    $('#userModal').modal('show');
}
function lockSwitch() {
    let id = getSelectedRow();
    if (id == null) {
        return;
    }

    swal({
        title: "Confirmation Box",
        text: "Confirm to lock/unlock the selected user?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((flag) => {
        if (flag) {
            $.ajax({
                type: "PUT",
                url: "admin/user/update",
                contentType: "application/json",
                data: JSON.stringify(id),
                success: function (r) {
                    if (r.code === 0) {
                        swal("Update Successfully", {
                            icon: "success",
                        });
                        $("#jqGrid").trigger("reloadGrid");
                    }else {
                        swal(r.message, {
                            icon: "error",
                        });
                    }
                }
            });
        }
    });
}

//绑定 modal 表单上的 SAVE 按钮
$('#saveButton').click(async function () {
    //验证数据
    if (validObject()) {

        // Ajax 发送网络请求

        // 获取表单数据
        let id = $("#modal-id").val();
        let name = $("#modal-name").val();
        let password = await sha256($("#modal-password").val());

        // 将即将发送数据封装为Json, 和 Pojo 对应
        let data = {
            "id": id,
            "name": name,
            "password": password,
        };
        let url = "";
        let method = "";

        // 表示新增操作
        if (id === null || id === undefined || id < 0) {
            url = 'admin/user/add';
            method = 'POST';
        }else {
            // id>=0表示编辑操作
            url = 'admin/user/update';
            method = 'PUT';
        }

        // 执行方法
        $.ajax({
            type: method,           //方法类型
            dataType: "json",       //预期服务器返回的数据类型
            url: url,               //url
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            error: function () {
                swal("Operation failure, please contact the support!", {
                    icon: "error",
                });
            }

        });

    }
});

function reset() {
    //隐藏错误提示框
    $('.alert-danger').css("display", "none");
    //清空数据
    $('#articleId').val(0);
    $('#articleName').val('');
    $('#articleAuthor').val('');

}
/**
 * jqGrid 重新加载
 */
function reload() {
    reset();
    var page = $("#jqGrid").jqGrid('getGridParam', 'page');
    $("#jqGrid").jqGrid('setGridParam', {
        page: page
    }).trigger("reloadGrid");
}