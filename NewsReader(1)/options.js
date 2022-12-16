
function restore_options() { 
    // 내부 저장소(storage)에서 옵션에 저장했던 값 불러오는 기능
    chrome.storage.sync.get({
        appEnabled: true,
        popupPosition: 0, 
        //0과 1로 팝업창 위치설정(0:아래부분/1:윗부분)
    }, function (items) {
        // 사용유무 확인하기 위함
        document.getElementById('cbEnabled').checked = items.appEnabled;
        // 팝업 위치를 설정하기 위함
        $('input:radio[name=radioPopupPosition]:input[value=' + items.popupPosition + ']').attr("checked", true)
                                                                                          .parents("label").addClass("active")
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

$(function () {

});