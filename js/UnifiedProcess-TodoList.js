// gnb fixed horizontal scroll issue
$(window).scroll(function() {
    $('#sidebar-wrapper').css({left: 0 - $(this).scrollLeft()});
});

document.addEventListener('DOMContentLoaded', async function () {
    const cDate = () => {
        let today = new Date();
        let year = today.getFullYear();
        let month = ('0' + (today.getMonth() + 1)).slice(-2);
        let day = ('0' + today.getDate()).slice(-2);
        let dateString = year + '-' + month  + '-' + day;
        return dateString; 
    }
  document.getElementById('datePicker2').value = cDate();
  createTodoListGrid();
  createAnsGrid();
  getCombUserList();
});

function getCombUserList() {
  axios.get(contextPath + '/Integration/getUserList',{
      params: {
                 
      }
  })
  .then(function(response) {
      const list = response.data;
      let txt = '';
      list.forEach(item =>{
          txt += `<option class='dropdown-item' value=${item.ID}>${item.NAME}</option>`;
        })
      $('#todoAsnm').append(txt);
  })
  .catch(function(error) {
      console.log(error);
  });
}

const { Editor } = toastui;
const { colorSyntax } = Editor.plugin;

const toDoAskViewer = toastui.Editor.factory({
    el: document.querySelector("#toDoAskViewer"),
    viewer: true,
    height: '100%',
});

const toDoAnsViewer = toastui.Editor.factory({
    el: document.querySelector("#toDoAnsViewer"),
    viewer: true,
    height: '100%',
});

// ToDoList Grid
let toDoContainer, toDoProvider, toDoGridView;

let toDoFields = [
    {fieldName:"RGST_DT", dataType:"text"},      // 등록날짜
    {fieldName:"TDL_ID", dataType:"text"},       // 등록순번
    {fieldName:"PROC_ID", dataType:"text"},      // 프로세스 ID
    {fieldName:"PROC_NM", dataType:"text"},      // 프로세스 명
    {fieldName:"STEP_ID", dataType:"text"},      // No
    {fieldName:"STEP_NM", dataType:"text"},      // 단계ID
    {fieldName:"TODO_ASK", dataType:"text"},     // 의뢰내용
    {fieldName:"WR_UNIT", dataType:"text"},      // 업무구분
    {fieldName:"TODO_ASNM", dataType:"text"},    // 수행인원	
    {fieldName:"COMPL_ST", dataType:"text"},     // 완료여부

    {fieldName:"FRST_RGST_DT", dataType:"date"}, // 등록일 
    {fieldName:"FRST_RGSR_ID", dataType:"text"}, 
    {fieldName:"FRST_RGST_IP", dataType:"text"},
    {fieldName:"LAST_UPDR_ID", dataType:"text"},
    {fieldName:"LAST_UPDT_IP", dataType:"text"},
    {fieldName:"LAST_UPDT_DT", dataType:"text"},
]

let toDoColumns = [
    {fieldName:"RGST_DT", name:"RGST_DT", header:{text:"등록날짜"},footer: {expression: "count"}},
    {fieldName:"TDL_ID", name:"TDL_ID", header:{text:"No"}},
    {fieldName:"PROC_ID", name:"PROC_ID", header:{text:"프로세스ID"}},
    {fieldName:"PROC_NM", name:"PROC_NM", header:{text:"프로세스명"}},
    {fieldName:"STEP_NM", name:"STEP_NM", header:{text:"단계명"}, styleName: "textLeft"},
    {fieldName:"TODO_ASK", name:"TODO_ASK", header:{text:"내용"}, styleName: "textLeft",
        renderer:{
            type:"html",
            //showTooltip:true,
            callback: function(grid, cell, w, h) {
                let str = cell.value;
                if(str == null) str = "";
                str = str.replace(/(<([^>]+)>)/gi, "");
                str = str.replace(/\s\s+/g, ' ');
                return str;
            }
            },
    },
    {fieldName:"WR_UNIT", name:"WR_UNIT", header:{text:"업무구분"}},
    {fieldName:"TODO_ASNM", name:"TODO_ASNM", header:{text:"수행인원"},styleName: "textLeft"},
    {fieldName:"COMPL_ST", name:"COMPL_ST", header:{text:"완료여부"},
        styleCallback: function(grid, dataCell){
            let ret = {}
            if(dataCell.value == 'N'){
                ret.styleName = "tdlIncomplete"
            }
            return ret;
        }
    },
    
    {fieldName:"FRST_RGST_DT", name:"FRST_RGST_DT", header:{text: "최초등록일시"}},
    {fieldName:"FRST_RGSR_ID", name:"FRST_RGSR_ID", header:{text: "최초등록자ID"}},
    {fieldName:"FRST_RGST_IP", name:"FRST_RGST_IP", header:{text: "최초등록IP"}},
    {fieldName:"LAST_UPDR_ID", name:"LAST_UPDR_ID", header:{text: "최종수정자ID"}},
    {fieldName:"LAST_UPDT_IP", name:"LAST_UPDT_IP", header:{text: "최종수정IP"}},
    {fieldName:"LAST_UPDT_DT", name:"LAST_UPDT_DT", header:{text: "LAST_UPDT_DT"}},
];

function createTodoListGrid() {
    toDoContainer = document.getElementById('toDoListGrid');
    toDoProvider = new RealGrid.LocalDataProvider(false);
    toDoGridView = new RealGrid.GridView(toDoContainer);
    toDoGridView.setDataSource(toDoProvider);

    toDoProvider.setFields(toDoFields);
    toDoGridView.setColumns(toDoColumns);

    toDoGridView.setDisplayOptions({showEmptyMessage: true});
    toDoGridView.displayOptions.emptyMessage = "표시할 ToDoList가 없습니다.";

    toDoGridView.displayOptions.rowHeight = 30;
    toDoGridView.header.height = 30;
    toDoGridView.footer.height = 10;
    toDoGridView.stateBar.width = 16;

    toDoGridView.setCheckBar({visible: false}); // 그리드 체크 박스 표시
    toDoGridView.setRowIndicator({visible: false}); // 그리드 행수 표시
    toDoGridView.setStateBar({visible: false}); // 그리드에서 입력,수정,삭제 표시
    toDoGridView.setDisplayOptions({focusVisible:true}); // 포커스 표시 여부
    toDoGridView.displayOptions.rowFocusType = "row"; // 그리드 한줄 선택

    // ReadOnly
    // 그리드 컬럼들의 editable 상태를 편히 관리하기 위해 컬럼 마다 관리
    toDoColumns.forEach((element) => {
        toDoGridView.columnByName(element.name).editable = false;
    });

    // 같은 값의 그리드 병합
    /*
    toDoColumns.forEach((element) => {
    		toDoGridView.setColumnProperty(element, "mergeRule", { criteria: "value" });
    });
    toDoGridView.displayOptions.showInnerFocus = false; // 그리드 병합 시  InnerFocus 안보이게
    */

    toDoGridView.displayOptions.fitStyle = "evenFill"; // 그리드 꽉 채우기

    // 컬럼 표시 여부
    // const colVisible = false;
    toDoGridView.columnByName("FRST_RGST_DT").visible =  false;
    toDoGridView.columnByName("FRST_RGSR_ID").visible =  false; 
    toDoGridView.columnByName("FRST_RGST_IP").visible =  false; 
    toDoGridView.columnByName("LAST_UPDR_ID").visible =  false;
    toDoGridView.columnByName("LAST_UPDT_IP").visible =  false; 
    toDoGridView.columnByName("LAST_UPDT_DT").visible =  false;
    
    toDoGridView.setColumnProperty("RGST_DT","width",80);
    toDoGridView.setColumnProperty("TDL_ID","width",25);
    toDoGridView.setColumnProperty("PROC_ID","width",80);
    toDoGridView.setColumnProperty("PROC_NM","width",150);
    toDoGridView.setColumnProperty("STEP_NM","width",290);
    toDoGridView.setColumnProperty("TODO_ASK","width",290);
    toDoGridView.setColumnProperty("TODO_ASNM","width",100);
    toDoGridView.setColumnProperty("WR_UNIT","width",60);
    toDoGridView.setColumnProperty("COMPL_ST","width",60);

    toDoGridView.onCellClicked = function (grid, clickData) {
        const current = toDoGridView.getCurrent();
        const values = toDoProvider.getJsonRow(current.dataRow);
        
        toDoAskViewer.setMarkdown(values.TODO_ASK);
        ansGridView.clearCurrent();
        toDoAnsViewer.setMarkdown("");
        getAnswerList();			
    }

    toDoGridView.setRowStyleCallback(function(grid, item, fixed) {
        let ret = {};
        let complSt = grid.getValue(item.index, "COMPL_ST");
        if(complSt == "Y") {
            ret.styleName = 'tdlCompleted';
        }
        return ret;
    });

    axios.get(contextPath + '/Integration/SelectItgToDoList',{
        params: {
            pastDate : document.getElementById('datePicker1').value,
            currentDate : document.getElementById('datePicker2').value,
            todoAsnm : document.getElementById('todoAsnm').value,  
            complStCheck : $('#inlineCheckbox1').prop("checked")                   
        }
    })
    .then(function(response) {
        const list = response.data;
        if(list.length != 0) {
            toDoProvider.setRows(list);
        }
    })
    .catch(function(error) {
        console.log(error);
    });

}

function getTodoList() {
    toDoGridView.clearCurrent();
    toDoAskViewer.setMarkdown("");
    ansProvider.clearRows();
    toDoAnsViewer.setMarkdown("");
    const pastDate = document.getElementById('datePicker1').value;
    const currentDate = document.getElementById('datePicker2').value;
    const todoAsnm = document.getElementById('todoAsnm').value;
    const complStCheck = $('#inlineCheckbox1').prop("checked");
    //	let complStCheck;
    //	$('#inlineCheckbox1').prop("checked") ? complStCheck = "Y" : complStCheck = "N"
    
    axios.get(contextPath + '/Integration/SelectItgToDoList2',{
        params: {
            pastDate,
            currentDate,
            todoAsnm,
            complStCheck
        }
    })
    .then(function(response) {
        const list = response.data;
        console.log(list);
        toDoProvider.setRows(list);
    })
    .catch(function(error) {
        console.log(error);
    });
}

function getAnswerList() {
    const current = toDoGridView.getCurrent();
    const values = toDoProvider.getJsonRow(current.dataRow);
    axios.get(contextPath + '/Integration/SelectItgToDoListAns',{
        params: {
            RGST_DT : values.RGST_DT,
            TDL_ID  : values.TDL_ID 	           
        }
    })
    .then(function(response) {
        const list = response.data;
        if(list.length != 0) {
            ansProvider.setRows(list);
        }
    })
    .catch(function(error) {
        console.log(error);
    });
}









// Answer Grid
let ansContainer, ansProvider, ansGridView;

let ansFields = [
    {fieldName:"TODO_ASNM", dataType:"text"},      
    {fieldName:"LAST_UPDT_DT", dataType:"date"},     
    {fieldName:"RDEM_PR", dataType:"text"},      
    {fieldName:"COMPL_ST", dataType:"text"},
    {fieldName:"TODO_ANS", dataType:"text"},
    
    {fieldName:"PROC_NM", dataType:"text"},      // 프로세스 명
    {fieldName:"STEP_NM", dataType:"text"},      // 단계명
    {fieldName:"RGST_DT", dataType:"text"},      // 등록날짜
    {fieldName:"TDL_ID", dataType:"text"},       // 등록순번
    {fieldName:"TDLA_ID", dataType:"text"},       // 등록순번   
    {fieldName:"FRST_RGSR_ID", dataType:"text"}, 
    {fieldName:"FRST_RGST_IP", dataType:"text"},
    {fieldName:"FRST_RGST_DT", dataType:"date"},
    {fieldName:"LAST_UPDR_ID", dataType:"text"},
    {fieldName:"LAST_UPDT_IP", dataType:"text"},
]

let ansColumns = [
    {fieldName:"TODO_ASNM", name:"TODO_ASNM", header:{text:"수행인원"}},
    {fieldName:"COMPL_ST", name:"COMPL_ST", header:{text:"완료여부"},
        styleCallback: function(grid, dataCell){
            let ret = {}
            if(dataCell.value == 'N'){
                ret.styleName = "tdlIncomplete"
            }
            return ret;
        }
    },
    {fieldName:"LAST_UPDT_DT", name:"LAST_UPDT_DT", header:{text:"확인날짜"}},
    {fieldName:"RDEM_PR", name:"RDEM_PR", header:{text:"보완프로세스"}},

    {fieldName:"PROC_NM", name:"PROC_NM", header:{text: "프로세스명"}},
    {fieldName:"STEP_NM", name:"STEP_NM", header:{text: "단계명"}},
    {fieldName:"TODO_ANS", name:"TODO_ANS", header:{text:"답변내용"}},
    {fieldName:"RGST_DT", name:"RGST_DT", header:{text:"등록날짜"}},
    {fieldName:"TDL_ID", name:"TDL_ID", header:{text:"No"}},
    {fieldName:"TDLA_ID", name:"TDLA_ID", header:{text:"TDLAID"}},
    {fieldName:"FRST_RGST_DT", name:"FRST_RGST_DT", header:{text: "최초등록일시"}},
    {fieldName:"FRST_RGSR_ID", name:"FRST_RGSR_ID", header:{text: "최초등록자ID"}},
    {fieldName:"FRST_RGST_IP", name:"FRST_RGST_IP", header:{text: "최초등록IP"}},
    {fieldName:"LAST_UPDR_ID", name:"LAST_UPDR_ID", header:{text: "최종수정자ID"}},
    {fieldName:"LAST_UPDT_IP", name:"LAST_UPDT_IP", header:{text: "최종수정IP"}},
];

function createAnsGrid() {
    ansContainer = document.getElementById('answerGrid');
    ansProvider = new RealGrid.LocalDataProvider(false);
    ansGridView = new RealGrid.GridView(ansContainer);
    ansGridView.setDataSource(ansProvider);

    ansProvider.setFields(ansFields);
    ansGridView.setColumns(ansColumns);

    ansGridView.displayOptions.rowHeight = 30;
    ansGridView.header.height = 10;
    //ansGridView.footer.height = 0;
    ansGridView.setFooters({visible:false});
    ansGridView.stateBar.width = 16;

    ansGridView.setCheckBar({visible: false}); // 그리드 체크 박스 표시
    ansGridView.setRowIndicator({visible: false}); // 그리드 행수 표시
    ansGridView.setStateBar({visible: false}); // 그리드에서 입력,수정,삭제 표시
    ansGridView.setDisplayOptions({focusVisible:true}); // 포커스 표시 여부
    ansGridView.displayOptions.rowFocusType = "row"; // 그리드 한줄 선택

    ansGridView.displayOptions.fitStyle = "evenFill"; // 그리드 꽉 채우기

    ansGridView.columnByName("TODO_ANS").visible =  false;
    ansGridView.columnByName("RGST_DT").visible =  false;
    ansGridView.columnByName("TDL_ID").visible =  false;
    ansGridView.columnByName("TDLA_ID").visible =  false;
    ansGridView.columnByName("PROC_NM").visible =  false;
    ansGridView.columnByName("STEP_NM").visible =  false;
    
    ansGridView.columnByName("FRST_RGST_DT").visible =  false;
    ansGridView.columnByName("FRST_RGSR_ID").visible =  false;
    ansGridView.columnByName("FRST_RGST_IP").visible =  false;
    ansGridView.columnByName("LAST_UPDR_ID").visible =  false;
    ansGridView.columnByName("LAST_UPDT_IP").visible =  false;

    // ReadOnly
    // 그리드 컬럼들의 editable 상태를 편히 관리하기 위해 컬럼 마다 관리
    ansColumns.forEach((element) => {
        ansGridView.columnByName(element.name).editable = false;
    });
    
    ansGridView.onCellClicked = function (grid, clickData) {
        const current = ansGridView.getCurrent();
        const values = ansProvider.getJsonRow(current.dataRow);

        toDoAnsViewer.setMarkdown(values.TODO_ANS);
    }

}


/*****************************************************************************************/
// 모달 
/* 의뢰 수정 모달 */
function tdlAskModify() {
    const current = toDoGridView.getCurrent();
    if(current.dataRow != -1) {
        $("#tdlAskModifyModal").modal('show');	
    }else {
        alert('수정할 ToDoList를 선택해주세요');
    }
}

let tdlAskModifyEditor;
$('#tdlAskModifyModal').on('show.bs.modal', function (event) {
    const current = toDoGridView.getCurrent();
    const values = toDoProvider.getJsonRow(current.dataRow)
    
    document.getElementById('intgProc_name').value = values.PROC_NM;
    document.getElementById('intgProcStep_name').value = values.STEP_NM;
    document.getElementById('todo_asnm').value = values.TODO_ASNM;
    document.getElementById('wr_unit').value = values.WR_UNIT;
        
    tdlAskModifyEditor = new toastui.Editor({
        el: document.querySelector('#todo_ask'),
        height: '400px',
        initialEditType : 'wysiwyg',
        hideModeSwitch : true,
        plugins: [colorSyntax],
    });
    tdlAskModifyEditor.removeToolbarItem('image');
    tdlAskModifyEditor.setHTML(values.TODO_ASK);
});

function updateTdlAsk() {
    const current = toDoGridView.getCurrent();
    const values = toDoProvider.getJsonRow(current.dataRow)
    axios.post(contextPath + '/Integration/updateTdlAsk', null, {
        params: {
            RGST_DT   : values.RGST_DT,
            TDL_ID    : values.TDL_ID,
            TODO_ASNM : values.TODO_ASNM,
            TODO_ASK  : tdlAskModifyEditor.getHTML(),
            WR_UNIT   : document.getElementById('wr_unit').value,
        }
    })
    .then(function (response) {
        console.log(response.data + "," + response.status);
        $("#tdlAskModifyModal").modal('hide');
        getTodoList();
    })
    .catch(function(error) {
        console.log(error);
    });
}


/* 답변 등록 모달 */
function answerModalShow() {
    const current = ansGridView.getCurrent();
    if(current.dataRow != -1) {
        $("#todoListAnsModal").modal('show');	
    }else {
        alert('수행인원을 선택해주세요');
    }
};

let todoAnsEditor;
$('#todoListAnsModal').on('show.bs.modal', function (event) {
    const current = ansGridView.getCurrent();
    const values = ansProvider.getJsonRow(current.dataRow)
    console.log(values);
    document.getElementById('intgProc_name_ans').value = values.PROC_NM;
    document.getElementById('intgProcStep_name_ans').value = values.STEP_NM;
    document.getElementById('todo_asnm_ans').value = values.TODO_ASNM;
    document.getElementById('rdem_pr').value = values.RDEM_PR;
        
    todoAnsEditor = new toastui.Editor({
        el: document.querySelector('#todo_ans'),
        height: '400px',
        initialEditType : 'wysiwyg',
        hideModeSwitch : true,
        plugins: [colorSyntax],
    });
    todoAnsEditor.removeToolbarItem('image');
    todoAnsEditor.setHTML(values.TODO_ANS);
});

function updateTdlAnswer() {
    const current = ansGridView.getCurrent();
    const values = ansProvider.getJsonRow(current.dataRow)
    axios.post(contextPath + '/Integration/updateTdlAnswer', null, {
        params: {
            RGST_DT   : values.RGST_DT,
            TDL_ID    : values.TDL_ID,
            TDLA_ID   : values.TDLA_ID,
            TODO_ASNM : values.TODO_ASNM,
            TODO_ANS  : todoAnsEditor.getHTML(),
            RDEM_PR   : document.getElementById('rdem_pr').value,
            COMPL_ST  : 'Y' 
        }
    })
    .then(function (response) {
        console.log(response.data + "," + response.status);
        getAnswerList();
        $("#todoListAnsModal").modal('hide');
    })
    .catch(function(error) {
        console.log(error);
    });
}

$('#todoListAnsModal').on('hidden.bs.modal', function (event) {
    const current = toDoGridView.getCurrent();
    const values = toDoProvider.getJsonRow(current.dataRow);
    axios.get(contextPath + '/Integration/SelectItgToDoListAns',{
        params: {
            RGST_DT : values.RGST_DT,
            TDL_ID  : values.TDL_ID 	           
        }
    })
    .then(function(response) {
        const list = response.data;
        if(list.length != 0) {
            ansProvider.setRows(list);
            const current = ansGridView.getCurrent();
            const values = ansProvider.getJsonRow(current.dataRow);
            toDoAnsViewer.setMarkdown(values.TODO_ANS);
        }
    })
    .catch(function(error) {
        console.log(error);
    });
})
