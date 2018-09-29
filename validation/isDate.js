module.exports = function isDate(date) {
 let newDate = new Date(date);
if(newDate instanceof Date && !isNaN(newDate.valueOf())){
    return true;
}
 return false
}