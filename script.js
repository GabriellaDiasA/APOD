const resultDiv = document.getElementById("result");
const buttonAPOD = document.getElementById("calendarButton");
const backButton = document.getElementById("backButton");
const forwardButton = document.getElementById("forwardButton");
const calendar = document.getElementById("calendar");
let currentDate = "";

// Helpers? Mayhaps?
function newDate(op){
    console.log(currentDate);
    let year = parseInt(currentDate.substring(0,4));
    let month = parseInt(currentDate.substring(5,7));
    let day = parseInt(currentDate.substring(8,10));

    let dateObj = new Date();
    dateObj.setFullYear(year);
    dateObj.setMonth(month - 1);
    dateObj.setDate(day);
    dateObj.setDate(dateObj.getDate() + op);
    if(dateObj.getMonth() == 0){
        dateObj.setFullYear(dateObj.getFullYear() - 1);
        dateObj.setMonth(11);
    }
    if(op == 1 && dateObj.getDate() == 1){
        dateObj.setMonth(dateObj.getMonth() + 1);
    }

    year = dateObj.getFullYear();
    month = dateObj.getMonth() + 1;
    day = dateObj.getDate();

    if(month < 10){
        month = `0${month}`;
    }
    if(day < 10){
        day = `0${day}`;
    }
    currentDate = `${year}-${month}-${day}`;
}

function updateDate(){
    currentDate = calendar.value;
}


// Controller
class APODController{
    findAPOD(){
        let model = new APODModel();
        model.receiveData();

        let view = new APODView(model);
        view.draw();
    }
}

// View
class APODView{
    constructor(model){
        this._element = document.createElement('div');
        this._imageURL = model.imageURL;
        this._image = document.createElement('img');
        this._explanationText = model.explanation;
        this._explanation = document.createElement('p');
    }

    get image(){
        this._image.setAttribute("id", "APODImage");
        this._image.src = this._imageURL;
        return this._image;
    }

    get explanation(){
        this._explanation.textContent = this._explanationText;
        this._explanation.setAttribute("id", "APODText");
        return this._explanation;
    }

    clearPastView(){
        for(let i = 0; resultDiv.childNodes.length != 0; i++){
            resultDiv.childNodes[0].remove();
        }
    }

    draw(){
        this.clearPastView();
        resultDiv.append(this.image);
        resultDiv.append(this.explanation);
    }
}

// Model
class APODModel{
    constructor(){
        this._explanation = "";
        this._imageURL = "";
    }

    get explanation(){
        return this._explanation;
    }
    
    get imageURL(){
        return this._imageURL;
    }

    receiveData(){
        let request = new XMLHttpRequest();
        request.open("GET", `https://api.nasa.gov/planetary/apod?api_key=f8LGPGWpRSDWpkp9mSFt1bSZlzrjhIU9cX2mOxnX&date=${currentDate}`, false);
        request.addEventListener("load", () => {
            if(request.status == 200){
                let result = JSON.parse(request.responseText)
                this._imageURL = result.url;
                this._explanation = result.explanation;
            }
            else{
                console.log("Unexpected return! CODE:");
                console.log(request.status);
            }
        })
        request.send();
    }
}

// Execution
let controller = new APODController();
buttonAPOD.addEventListener('click', () => {
    updateDate();
    controller.findAPOD();
})
backButton.addEventListener('click', () => {
    newDate(-1);
    controller.findAPOD();
})
forwardButton.addEventListener('click', () => {
    newDate(+1);
    controller.findAPOD();
})

//      For the record, I found the MVC architechture to be pitifully convoluted. I can only imagine
// that in larger projects the same entity (for example, the APOD here) would end up having WAY more than
// the 3 classes I had to create here. Not only are there redundancies involved in the creation of so many
// different classes to represent the same entity, but it is also fundamentally wrong when we consider
// the very core of what "modelling" means in not just programming but science as a whole. The result we
// see above may end up easier to read for those used to this painful architechture but it is not at all
// representative of the truth.