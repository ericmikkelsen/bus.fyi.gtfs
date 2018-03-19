

const today = () => {
    const today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth()+1; //January is 0!

    const yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    }
    
    return parseInt(yyyy+mm+dd);
}

const afterToday = (date) => {
    if(typeof(date) === 'string') parseInt(date);
    return ( date > today() ) ? true : false;
}

module.exports = {
    afterToday: afterToday,
    today:     today,
}