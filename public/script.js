fetch("http://localhost:3000/jokes")
.then((res)=> res.json()).then(data=>{
    console.log(data)
})