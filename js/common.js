/**
 * 
 */
 $("#menu-toggle").click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

function btnTest() {
	toastr.info("준비중입니다");
}

/* alert Message */
function SnackMessage(message,status) {
	SnackBar({
		message: message,
		status: status,
		position: "tr",
		timeout: 2400
	});
}