function todayDate() {
    var today = new Date(); // get the current date
    var dd = today.getDate() + 1; //get the day from today.
    var mm = today.getMonth() + 1; //get the month from today +1 because january is 0!
    var yyyy = today.getFullYear(); //get the year from today

    //if day is below 10, add a zero before (ex: 9 -> 09)
    if (dd < 10) {
        dd = '0' + dd
    }

    //like the day, do the same to month (3->03)
    if (mm < 10) {
        mm = '0' + mm
    }

    //finally join yyyy mm and dd with a "-" between then
    return yyyy + '-' + mm + '-' + dd;
}

$(document).ready(function () {
    $('#bookingDate').attr('min', todayDate());
});