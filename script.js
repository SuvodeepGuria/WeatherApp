let data=[];

function insertData(){
    //Fetch the data from frontend
    let uname = document.getElementById("uname").value;
    let email = document.getElementById("email").value;
    //Create a temp array to hold the data
    let tempData=[];
    tempData.push(uname);
    tempData.push(email);

    //Now add the temp array to main data array
    data.push(tempData);

    //After Each entry data shoulde be displayed
    displayData();
}

function displayData(){
    document.getElementById("displayData").innerHTML='';
    var tempDiv='<table border=1>';
    var totalEle=data.length;

    tempDiv+='<tr>';
    tempDiv+='<td>Name</td>';
    tempDiv+='<td>Email</td>';
    tempDiv+='<td>Action 1</td>';
    tempDiv+='<td>Action 2</td>';
    tempDiv+='</tr>';
    for(var i=0;i<totalEle;i++){
        // document.getElementById("displayData").innerHtml='<tr><td>'+data[i][0]+"</td><td>"+data[i][1]+'</td></tr>';
        // document.getElementById("displayData").innerText+=data[i][0]+" - "+data[i][1]+"\n";
        tempDiv+='<tr>';
        tempDiv+='<td>'+data[i][0]+'</td>';
        tempDiv+='<td>'+data[i][1]+'</td>';
        tempDiv+='<td>'+'<button onclick="editData('+i+')">Edit</button>'+'</td>';
        tempDiv+='<td>'+'<button onClick="deleteData('+i+')">Delete</button>'+'</td>';
        tempDiv+='</tr>';
    }
    tempDiv+='</table>';
    document.getElementById("displayData").innerHTML=tempDiv;
    document.getElementById("submitBtn").innerText="Add Record";
}

function editData(i){
    document.getElementById("uname").value=data[i][0];
    document.getElementById("email").value=data[i][1];
    document.getElementById("submitBtn").innerText="Update Record";
    document.getElementById("submitBtn").setAttribute("click","updateData("+i+")");

}

function updateData(){
    //Set data in input box
    data[i][0]=document.getElementById("uname").value;
    data[i][1]=document.getElementById("email").value;

    //Clear input box
    document.getElementById("uname").value='';
    document.getElementById("email").value='';

    //Back to add record mode
    document.getElementById("submitBtn").innerText="Add Record";
    document.getElementById("submitBtn").setAttribute("click","insertData()");

    //After Each entry data shoulde be displayed
    displayData();
}

function deleteData(i){
    data.splice(i,1);
    displayData();
}